import { Suspense } from "react";
import { UrlChecksTable } from "@/components/url-checks-table";
import { getUrlChecks, initializeUrls } from "@/lib/db";
import { Loader2 } from "lucide-react";

// Enable ISR with 1 hour revalidation
export const revalidate = 3600; // 1 hour in seconds

async function getUrlChecksData() {
  await initializeUrls();
  return await getUrlChecks();
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading URL checks...</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const checks = await getUrlChecksData();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Polkadot <code>llms.txt</code> Checker
        </h1>
        <p className="text-gray-600">
          Monitor the availability of llms.txt files across different
          documentation sites. Checks run automatically every day at midnight
          UTC.
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <UrlChecksTable data={checks} />
      </Suspense>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          The system automatically checks these URLs daily at midnight UTC using
          Vercel Cron Jobs. Data is cached and refreshed automatically.
        </p>
      </div>
    </div>
  );
}
