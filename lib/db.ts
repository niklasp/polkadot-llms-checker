import { kv } from "@vercel/kv";
import type { UrlCheck } from "./types";

const URLS_KEY = "llms-txt-urls";
const CHECKS_KEY = "llms-txt-checks";

// Initial URLs to check
const initialUrls: Omit<UrlCheck, "lastChecked" | "status">[] = [
  {
    id: "papi",
    name: "Papi",
    url: "https://papi.how/llms.txt",
  },
  {
    id: "dedot",
    name: "Dedot",
    url: "https://docs.dedot.dev/llms.txt",
  },
  {
    id: "ink",
    name: "Ink",
    url: "https://use.ink/llms.txt",
  },
];

// Fallback data for development when KV isn't configured
const fallbackChecks: UrlCheck[] = [
  {
    id: "papi",
    name: "Papi",
    url: "https://papi.how/llms.txt",
    status: "success",
    lastChecked: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    responseTime: 245,
  },
  {
    id: "dedot",
    name: "Dedot",
    url: "https://docs.dedot.dev/llms.txt",
    status: "error",
    lastChecked: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    responseTime: 1200,
    errorMessage: "HTTP 404: Not Found",
  },
  {
    id: "ink",
    name: "Ink",
    url: "https://use.ink/llms.txt",
    status: "success",
    lastChecked: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    responseTime: 180,
  },
];

// Check if KV is available
function isKvAvailable(): boolean {
  return !!(process.env.KV_URL && process.env.KV_REST_API_TOKEN);
}

export async function initializeUrls(): Promise<void> {
  if (!isKvAvailable()) {
    console.log("KV storage not configured, using fallback data");
    return;
  }

  try {
    const existingUrls = await kv.get(URLS_KEY);
    if (!existingUrls) {
      await kv.set(URLS_KEY, initialUrls);
    }
  } catch (error) {
    console.error("Failed to initialize URLs:", error);
  }
}

export async function getUrls(): Promise<
  Omit<UrlCheck, "lastChecked" | "status">[]
> {
  if (!isKvAvailable()) {
    return initialUrls;
  }

  try {
    const urls = await kv.get(URLS_KEY);
    return (urls as Omit<UrlCheck, "lastChecked" | "status">[]) || initialUrls;
  } catch (error) {
    console.error("Failed to get URLs:", error);
    return initialUrls;
  }
}

export async function getUrlChecks(): Promise<UrlCheck[]> {
  if (!isKvAvailable()) {
    return fallbackChecks;
  }

  try {
    const checks = await kv.get(CHECKS_KEY);
    return ((checks as UrlCheck[]) || []).map((check) => ({
      ...check,
      lastChecked: new Date(check.lastChecked),
    }));
  } catch (error) {
    console.error("Failed to get URL checks:", error);
    return [];
  }
}

export async function saveUrlCheck(check: UrlCheck): Promise<void> {
  if (!isKvAvailable()) {
    console.log(
      "KV storage not configured, cannot save check for:",
      check.name
    );
    return;
  }

  try {
    const existingChecks = await getUrlChecks();
    const index = existingChecks.findIndex((c) => c.id === check.id);

    if (index >= 0) {
      existingChecks[index] = check;
    } else {
      existingChecks.push(check);
    }

    await kv.set(CHECKS_KEY, existingChecks);
  } catch (error) {
    console.error("Failed to save URL check:", error);
  }
}

export async function saveUrlChecks(checks: UrlCheck[]): Promise<void> {
  if (!isKvAvailable()) {
    console.log("KV storage not configured, cannot save checks");
    return;
  }

  try {
    await kv.set(CHECKS_KEY, checks);
  } catch (error) {
    console.error("Failed to save URL checks:", error);
  }
}
