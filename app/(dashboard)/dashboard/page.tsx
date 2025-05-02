"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Sparkles, Download, Clock, Trash2, AlertCircle, FileType, CreditCard } from "lucide-react";
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

interface UserData {
  id: string;
  credits: number;
}

export default function DashboardPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
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
    }
  };

  useEffect(() => {
    fetchLogos();
    fetchUserData();

    // Set up interval to refresh user data every 10 seconds
    const intervalId = setInterval(fetchUserData, 10000);

    // Check for payment success parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true);

      // Remove the query parameter without page refresh
      const newUrl = window.location.pathname;
      window.history.pushState({}, '', newUrl);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    }

    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <BlurFade delay={0.1} inView>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter sm:text-4xl">Your Logos</h1>
          <Link href="/generate">
            <Button className="flex items-center gap-1.5 rounded-full px-4 sm:px-6 py-5 sm:py-6 text-sm sm:text-base w-full sm:w-auto">
              <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              Generate New Logo
            </Button>
          </Link>
        </div>
      </BlurFade>

      {paymentSuccess && (
        <BlurFade delay={0.15} inView>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center text-green-800 dark:text-green-400 text-sm sm:text-base">
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 mr-2 flex-shrink-0" />
            Payment successful! Your credits have been added to your account.
          </div>
        </BlurFade>
      )}

      {userData && userData.credits < 5 && (
        <BlurFade delay={0.15} inView>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-start sm:items-center text-yellow-800 dark:text-yellow-400">
              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-medium text-sm sm:text-base">Low credits</p>
                <p className="text-xs sm:text-sm">You have {userData.credits} credits remaining. Purchase more credits to continue generating logos.</p>
              </div>
            </div>
            <Link href="/payment" className="ml-6 sm:ml-0">
              <Button variant="outline" className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 gap-1.5 text-xs sm:text-sm">
                <CreditCard className="h-3 sm:h-4 w-3 sm:w-4" />
                Buy Credits
              </Button>
            </Link>
          </div>
        </BlurFade>
      )}

      {error && (
        <BlurFade delay={0.15} inView>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-center text-red-800 dark:text-red-400 text-sm sm:text-base">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        </BlurFade>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <BlurFade key={i} delay={0.2 + i * 0.05} inView>
              <div className="rounded-xl overflow-hidden min-h-[120px] sm:min-h-[180px]">
                <Skeleton className="w-full h-full min-h-[120px] sm:min-h-[180px]" />
              </div>
            </BlurFade>
          ))}
        </div>
      ) : logos.length === 0 ? (
        <BlurFade delay={0.2} inView>
          <div className="text-center py-12 sm:py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 sm:h-8 w-6 sm:w-8 text-neutral-400 dark:text-neutral-600" />
              </div>
            </div>
            <BlurFadeText>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tighter sm:text-3xl mb-2 sm:mb-3">No logos yet</h2>
            </BlurFadeText>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
              You haven't generated any logos yet. Create your first logo now!
            </p>
            <Link href="/generate">
              <Button size="lg" className="gap-1.5 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base">
                <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Generate Your First Logo
              </Button>
            </Link>
          </div>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {logos.map((logo, i) => (
            <BlurFade key={logo.id} delay={0.2 + i * 0.05} inView>
              <div
                className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all cursor-pointer relative aspect-square"
                onClick={() => handleLogoClick(logo)}
              >
                <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                  <Image
                    src={getImageUrl(logo.imageUrl)}
                    alt={logo.prompt}
                    fill
                    className="object-contain p-2 sm:p-4"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized={logo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-end justify-end p-2">
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
            </BlurFade>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-4 sm:p-6 max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tighter">Delete Logo</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
              Are you sure you want to delete this LogoGPT creation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentLogo && (
            <div className="flex justify-center p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-900 rounded-md">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
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
        <DialogContent className="sm:max-w-xl rounded-xl p-0 overflow-hidden max-w-[90vw]">
          {selectedLogo && (
            <>
              <div className="relative h-56 sm:h-72 bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={getImageUrl(selectedLogo.imageUrl)}
                  alt={selectedLogo.prompt}
                  fill
                  className="object-contain"
                  unoptimized={selectedLogo.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
                <DialogTitle className="sr-only">Logo Details</DialogTitle>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href={getDownloadUrl(selectedLogo.imageUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-xs sm:text-sm">
                      <Download className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                      Download PNG
                    </Button>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLogoKit(selectedLogo.id, selectedLogo.imageUrl, selectedLogo.prompt)}
                    className="gap-1.5 rounded-lg text-xs sm:text-sm"
                  >
                    <FileType className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                    Download Kit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleDeleteClick(selectedLogo.id);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20 ml-auto rounded-lg text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
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