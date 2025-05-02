"use client";

import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: string;
  credits: number;
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user', {
        // Add cache control to prevent caching
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUserData();

    // Set up interval to refresh data every 15 seconds
    const intervalId = setInterval(fetchUserData, 15000);

    // Set up visibility change handler to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for the custom refreshUserData event from child components
    const handleRefreshUserData = () => {
      console.log('Refreshing user data from event');
      fetchUserData();
    };
    document.addEventListener('refreshUserData', handleRefreshUserData);

    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('refreshUserData', handleRefreshUserData);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar variant="dashboard" />
      <main className="container max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-8 min-h-[calc(100vh-64px-72px)]">
        {children}
      </main>
      <footer className="py-4 sm:py-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <div className="container max-w-screen-xl mx-auto px-3 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="py-2 sm:py-4 text-sm text-center text-neutral-500 dark:text-neutral-400">
              © {new Date().getFullYear()} LogoGPT. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
              >
                Terms
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <Link
                href="#"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 