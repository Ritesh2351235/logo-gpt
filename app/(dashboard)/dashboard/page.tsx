"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Sparkles, Download, Clock, Trash2, AlertCircle, FileType } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { cn } from "@/lib/utils";

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
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
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

      // If the logo was also selected in the details modal, close that too
      if (selectedLogo && selectedLogo.id === deletingId) {
        setDetailsModalOpen(false);
        setSelectedLogo(null);
      }
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

  const handleLogoClick = (logo: Logo) => {
    setSelectedLogo(logo);
    setDetailsModalOpen(true);
  };

  const downloadLogoKit = async (logoId: string, imageUrl: string, prompt: string) => {
    try {
      // Call the logo-kit API endpoint
      const response = await fetch("/api/logo-kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate logo kit");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a link to download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "logo-kit.zip";
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading logo kit:", error);
    }
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your Logos</h1>
          <Link href="/generate">
            <Button className="flex items-center gap-1.5 rounded-full px-6 py-6">
              <Sparkles className="h-4 w-4" />
              Generate New Logo
            </Button>
          </Link>
        </div>
      </BlurFade>

      {error && (
        <BlurFade delay={0.15} inView>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center text-red-800 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        </BlurFade>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <BlurFade key={i} delay={0.2 + i * 0.05} inView>
              <div className={cn(
                "rounded-xl overflow-hidden min-h-[180px]",
                i === 0 ? "col-span-2 row-span-2" : // Large square (2x2)
                  i === 1 ? "col-span-1 row-span-1" : // Normal (1x1)
                    i === 2 ? "col-span-1 row-span-1" : // Normal (1x1) 
                      i === 3 ? "col-span-2 row-span-1" : // Wide (2x1)
                        i === 4 ? "col-span-1 row-span-2" : // Tall (1x2)
                          ""
              )}>
                <Skeleton className="w-full h-full min-h-[180px]" />
              </div>
            </BlurFade>
          ))}
        </div>
      ) : logos.length === 0 ? (
        <BlurFade delay={0.2} inView>
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
              </div>
            </div>
            <BlurFadeText>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-3">No logos yet</h2>
            </BlurFadeText>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 max-w-md mx-auto">
              You haven't generated any logos yet. Create your first logo now!
            </p>
            <Link href="/generate">
              <Button size="lg" className="gap-1.5 rounded-full px-8 py-6">
                <Sparkles className="h-4 w-4" />
                Generate Your First Logo
              </Button>
            </Link>
          </div>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo, i) => (
            <BlurFade key={logo.id} delay={0.2 + i * 0.05} inView>
              <div
                className={cn(
                  "rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all cursor-pointer relative group bg-white dark:bg-neutral-800",
                  i === 0 ? "col-span-2 row-span-2" : // Large square (2x2)
                    i === 1 ? "col-span-1 row-span-1" : // Normal (1x1)
                      i === 2 ? "col-span-1 row-span-1" : // Normal (1x1) 
                        i === 3 ? "col-span-2 row-span-1" : // Wide (2x1)
                          i === 4 ? "col-span-1 row-span-2" : // Tall (1x2)
                            ""
                )}
                onClick={() => handleLogoClick(logo)}
                style={{
                  aspectRatio:
                    i === 0 ? "1/1" :  // Square
                      i === 3 ? "2/1" :  // Wide
                        i === 4 ? "1/2" :  // Tall
                          "1/1"              // Default square
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-medium truncate mb-2">{logo.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(new Date(logo.createdAt))}
                    </span>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getDownloadUrl(logo.imageUrl), '_blank');
                        }}
                      >
                        <Download className="h-3 w-3 text-white" />
                      </button>
                      <button
                        className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(logo.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full flex items-center justify-center p-6">
                  <Image
                    src={getImageUrl(logo.imageUrl)}
                    alt={logo.prompt}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized={logo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                  />
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tighter">Delete Logo</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this LogoGPT creation? This action cannot be undone.
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
            <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting} className="rounded-lg">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-lg"
            >
              {isDeleting ? "Deleting..." : "Delete Logo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logo Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-xl p-0 overflow-hidden">
          {selectedLogo && (
            <>
              <div className="relative h-72 bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={getImageUrl(selectedLogo.imageUrl)}
                  alt={selectedLogo.prompt}
                  fill
                  className="object-contain"
                  unoptimized={selectedLogo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{selectedLogo.prompt}</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Created {formatDate(new Date(selectedLogo.createdAt))}
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={getDownloadUrl(selectedLogo.imageUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                      <Download className="h-3.5 w-3.5" />
                      Download PNG
                    </Button>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLogoKit(selectedLogo.id, selectedLogo.imageUrl, selectedLogo.prompt)}
                    className="gap-1.5 rounded-lg"
                  >
                    <FileType className="h-3.5 w-3.5" />
                    Download Logo Kit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleDeleteClick(selectedLogo.id);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20 ml-auto rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 