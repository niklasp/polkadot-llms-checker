import type { CheckResult } from "./types";

export async function checkUrl(url: string): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "llms-txt-checker/1.0",
      },
      // Set a 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        responseTime,
      };
    } else {
      return {
        success: false,
        responseTime,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return {
          success: false,
          responseTime,
          errorMessage: "Request timeout (10s)",
        };
      }

      return {
        success: false,
        responseTime,
        errorMessage: error.message,
      };
    }

    return {
      success: false,
      responseTime,
      errorMessage: "Unknown error occurred",
    };
  }
}
