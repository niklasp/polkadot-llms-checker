import { promises as fs } from "fs";
import path from "path";
import type { UrlCheck } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const URLS_FILE = path.join(DATA_DIR, "urls.json");
const CHECKS_FILE = path.join(DATA_DIR, "checks.json");

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
  {
    id: "substrate",
    name: "Substrate",
    url: "https://docs.substrate.io/llms.txt",
  },
  {
    id: "polkadot",
    name: "Polkadot Dev Docs",
    url: "https://docs.polkadot.com/llms.txt",
  },
];

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read JSON file with fallback
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

// Write JSON file
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function initializeUrls(): Promise<void> {
  await ensureDataDir();
  const existingUrls = await readJsonFile(URLS_FILE, []);
  if (existingUrls.length === 0) {
    await writeJsonFile(URLS_FILE, initialUrls);
  }
}

export async function getUrls(): Promise<
  Omit<UrlCheck, "lastChecked" | "status">[]
> {
  const urls = await readJsonFile(URLS_FILE, initialUrls);
  return urls;
}

export async function getUrlChecks(): Promise<UrlCheck[]> {
  const checks = await readJsonFile(CHECKS_FILE, []);
  return (checks as UrlCheck[]).map((check) => ({
    ...check,
    lastChecked: new Date(check.lastChecked),
  }));
}

export async function saveUrlCheck(check: UrlCheck): Promise<void> {
  const existingChecks = await getUrlChecks();
  const index = existingChecks.findIndex((c) => c.id === check.id);

  if (index >= 0) {
    existingChecks[index] = check;
  } else {
    existingChecks.push(check);
  }

  await writeJsonFile(CHECKS_FILE, existingChecks);
}

export async function saveUrlChecks(checks: UrlCheck[]): Promise<void> {
  await writeJsonFile(CHECKS_FILE, checks);
}
