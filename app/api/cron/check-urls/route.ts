import { NextRequest, NextResponse } from "next/server";
import { getUrls, saveUrlCheck, initializeUrls } from "@/lib/db";
import { checkUrl } from "@/lib/url-checker";
import type { UrlCheck } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initializeUrls();
    const urls = await getUrls();

    console.log(
      `Starting URL checks for ${
        urls.length
      } URLs at ${new Date().toISOString()}`
    );

    // Check all URLs in parallel
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        console.log(`Checking ${url.name}: ${url.url}`);
        const result = await checkUrl(url.url);

        const check: UrlCheck = {
          ...url,
          status: result.success ? "success" : "error",
          lastChecked: new Date(),
          responseTime: result.responseTime,
          errorMessage: result.errorMessage,
        };

        console.log(
          `${url.name}: ${result.success ? "SUCCESS" : "FAILED"} (${
            result.responseTime
          }ms)`
        );
        if (!result.success) {
          console.log(`${url.name} error: ${result.errorMessage}`);
        }

        return check;
      })
    );

    // Save all successful checks
    const checks: UrlCheck[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        checks.push(result.value);
      }
    });

    // Save checks to database
    for (const check of checks) {
      await saveUrlCheck(check);
    }

    const successCount = checks.filter((c) => c.status === "success").length;
    const errorCount = checks.filter((c) => c.status === "error").length;

    console.log(
      `URL check completed: ${successCount} success, ${errorCount} errors`
    );

    return NextResponse.json({
      success: true,
      message: "URL checks completed",
      results: {
        total: checks.length,
        success: successCount,
        errors: errorCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
