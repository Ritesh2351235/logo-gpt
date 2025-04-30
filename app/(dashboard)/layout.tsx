import { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { MoveRight, Home, Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="container flex h-16 max-w-screen-xl items-center px-4 sm:px-6">
          <Link href="/dashboard" className="mr-8 flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Logo Master</span>
          </Link>
          <nav className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
              >
                <Home size={16} />
                Dashboard
              </Link>
              <Link
                href="/generate"
                className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
              >
                <Sparkles size={16} />
                Generate
              </Link>
            </div>
            <div className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10",
                    userButtonBox: "hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full p-1 transition-colors",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </nav>
        </div>
      </header>
      <main className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-64px-72px)]">
        {children}
      </main>
      <footer className="py-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <div className="container max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © {new Date().getFullYear()} Logo Master. All rights reserved.
            </p>
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