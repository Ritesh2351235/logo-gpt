"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Sparkles, Download, Clock, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Logo {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchLogos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/logos");
      if (!response.ok) {
        throw new Error("Failed to fetch logos");
      }
      const data = await response.json();
      setLogos(data);
    } catch (error) {
      console.error("Error fetching logos:", error);
      setError("Failed to load logos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleDeleteClick = (logoId: string) => {
    setDeletingId(logoId);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/logos/${deletingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete logo");
      }

      // Remove the logo from the state
      setLogos((prev) => prev.filter((logo) => logo.id !== deletingId));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting logo:", error);
      setError("Failed to delete logo. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialogOpen(false);
    setDeletingId(null);
  };

  // Helper to handle both S3 and local image URLs
  const getImageUrl = (url: string) => {
    // If it's a relative URL (local storage), keep it as is
    if (url.startsWith('/')) {
      return url;
    }

    // If it's an OpenAI URL, use our proxy
    if (url && url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      // Encode the URL to use in the proxy
      const encodedUrl = encodeURIComponent(url);
      return `/api/proxy-image?url=${encodedUrl}`;
    }

    // Otherwise it's a remote URL, return as is
    return url;
  };

  // Determine if URL is a local path or external URL for download
  const getDownloadUrl = (url: string) => {
    // If it's a relative URL, we need to prefix with window.location.origin
    if (url.startsWith('/')) {
      // This will be executed client-side where window is available
      return typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
    }
    return url;
  };

  const currentLogo = deletingId ? logos.find((logo) => logo.id === deletingId) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Your Logos</h1>
        <Link href="/generate">
          <Button className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Generate New Logo
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center text-red-800 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-neutral-200 dark:border-neutral-800">
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full rounded-none" />
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : logos.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">No logos yet</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            You haven't generated any logos yet. Create your first logo now!
          </p>
          <Link href="/generate">
            <Button size="lg" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              Generate Your First Logo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <Card key={logo.id} className="overflow-hidden border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base font-medium truncate">
                  {logo.prompt}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-48 relative">
                <Image
                  src={getImageUrl(logo.imageUrl)}
                  alt={logo.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={logo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center">
                <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(new Date(logo.createdAt))}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={getDownloadUrl(logo.imageUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(logo.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Logo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this logo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentLogo && (
            <div className="flex justify-center p-4 bg-neutral-50 dark:bg-neutral-900 rounded-md">
              <div className="relative w-32 h-32">
                <Image
                  src={getImageUrl(currentLogo.imageUrl)}
                  alt={currentLogo.prompt}
                  fill
                  className="object-contain"
                  unoptimized={currentLogo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-1"
            >
              {isDeleting ? "Deleting..." : "Delete Logo"}
              {!isDeleting && <Trash2 className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 