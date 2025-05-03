"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Home, Sparkles, CreditCard, Loader2, Phone } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  credits: number;
}

interface NavbarProps {
  className?: string;
  variant?: "landing" | "dashboard";
}

export function Navbar({ className, variant = "landing" }: NavbarProps) {
  const { isSignedIn } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (variant === "dashboard") {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user', {
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

      fetchUserData();
      const intervalId = setInterval(fetchUserData, 15000);
      return () => clearInterval(intervalId);
    }
  }, [variant]);

  if (variant === "landing") {
    return (
      <header className={cn("sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm", className)}>
        <div className="container flex h-16 max-w-screen-xl items-center justify-between px-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">LogoGPT</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/contact">
              <Button variant="ghost" className="rounded-full">Contact</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="rounded-full">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="rounded-full">Get started</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm", className)}>
      <div className="container flex h-auto min-h-16 max-w-screen-xl items-center px-3 sm:px-6 py-2 sm:py-0 flex-wrap sm:flex-nowrap">
        <Link href="/dashboard" className="mr-4 sm:mr-8 flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">LogoGPT</span>
        </Link>
        <nav className="flex flex-1 items-center justify-between w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-5 sm:gap-6 text-sm font-medium py-2 sm:py-0 order-1 sm:order-none">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              href="/generate"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Generate</span>
            </Link>
            <Link
              href="/payment"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              <CreditCard size={16} />
              <span className="hidden sm:inline">Buy Credits</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              <Phone size={16} />
              <span className="hidden sm:inline">Contact</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0 order-0 sm:order-none">
            {loading ? (
              <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </div>
            ) : userData ? (
              <Badge variant="outline" className="flex items-center gap-1 py-1 px-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                <Sparkles size={12} />
                <span>{userData.credits}</span>
              </Badge>
            ) : null}
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                  userButtonBox: "hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1 transition-colors",
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </nav>
      </div>
    </header>
  );
} 