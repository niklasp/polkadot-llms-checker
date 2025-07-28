"use client";

import { useEffect, useState } from "react";
import { UrlChecksTable } from "@/components/url-checks-table";
import type { UrlCheck } from "@/lib/types";
import {
  getUrlChecksAction,
  checkAllUrlsAction,
} from "@/app/actions/url-actions";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const [checks, setChecks] = useState<UrlCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchChecks = async () => {
    try {
      const result = await getUrlChecksAction();
      if (result?.data?.success && result.data.data) {
        setChecks(result.data.data);
        // Check if we're getting demo data (all timestamps are older than 1 hour)
        const now = Date.now();
        const hasRecentChecks = result.data.data.some(
          (check) =>
            now - new Date(check.lastChecked).getTime() < 60 * 60 * 1000
        );
        setIsDemoMode(!hasRecentChecks && result.data.data.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch checks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const result = await checkAllUrlsAction();
      if (result?.data?.success && result.data.data) {
        setChecks(result.data.data);
        setIsDemoMode(false); // Real data now
      }
    } catch (error) {
      console.error("Failed to refresh checks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading URL checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Polkadot <code>llms.txt</code> Checker
        </h1>
        <p className="text-gray-600">
          Monitor the availability of llms.txt files across different
          documentation sites. Checks run automatically every hour.
        </p>
      </div>

      {isDemoMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Development Mode</h3>
            <p className="text-sm text-blue-800">
              You&apos;re seeing demo data because Vercel KV storage isn&apos;t
              configured. The &quot;Check All&quot; button will perform real
              checks, or set up KV storage for full functionality with automated
              hourly checks.
            </p>
          </div>
        </div>
      )}

      <UrlChecksTable
        data={checks}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
      />

      <div className="mt-8 text-sm text-gray-500">
        <p>
          The system automatically checks these URLs every hour using Vercel
          Cron Jobs. You can also manually trigger checks using the buttons
          above.
        </p>
      </div>
    </div>
  );
}
