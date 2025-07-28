"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import type { ActionResponse } from "@/lib/actions-types";
import type { UrlCheck } from "@/lib/types";
import { getUrls, getUrlChecks, saveUrlCheck, initializeUrls } from "@/lib/db";
import { checkUrl } from "@/lib/url-checker";

const safeAction = createSafeActionClient();

export const getUrlChecksAction = safeAction.action(
  async (): Promise<ActionResponse<UrlCheck[]>> => {
    try {
      await initializeUrls();
      const checks = await getUrlChecks();
      return { success: true, data: checks };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch URL checks",
        },
      };
    }
  }
);

const checkUrlSchema = z.object({
  id: z.string(),
});

export const checkSingleUrlAction = safeAction
  .schema(checkUrlSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse<UrlCheck>> => {
    try {
      const urls = await getUrls();
      const urlToCheck = urls.find((u) => u.id === parsedInput.id);

      if (!urlToCheck) {
        return {
          success: false,
          error: { message: "URL not found" },
        };
      }

      const result = await checkUrl(urlToCheck.url);

      const check: UrlCheck = {
        ...urlToCheck,
        status: result.success ? "success" : "error",
        lastChecked: new Date(),
        responseTime: result.responseTime,
        errorMessage: result.errorMessage,
      };

      await saveUrlCheck(check);

      return { success: true, data: check };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to check URL",
        },
      };
    }
  });

export const checkAllUrlsAction = safeAction.action(
  async (): Promise<ActionResponse<UrlCheck[]>> => {
    try {
      await initializeUrls();
      const urls = await getUrls();
      const checks: UrlCheck[] = [];

      // Check all URLs in parallel
      const results = await Promise.allSettled(
        urls.map(async (url) => {
          const result = await checkUrl(url.url);
          return {
            ...url,
            status: result.success ? "success" : "error",
            lastChecked: new Date(),
            responseTime: result.responseTime,
            errorMessage: result.errorMessage,
          } as UrlCheck;
        })
      );

      // Process results
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          checks.push(result.value);
        }
      });

      // Save all checks
      for (const check of checks) {
        await saveUrlCheck(check);
      }

      return { success: true, data: checks };
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Failed to check URLs",
        },
      };
    }
  }
);
