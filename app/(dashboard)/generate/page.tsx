"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Save,
  ArrowRight,
  LightbulbIcon,
  Download,
  FileType,
  Upload,
  X,
  Image as ImageIcon,
  Pencil,
  ImagePlus
} from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

const getImageUrl = (url: string) => {
  if (!url) return '';

  // If the url is already a data URL, return it as is
  if (url.startsWith('data:image/')) {
    return url;
  }

  // If it's a relative URL starting with /
  if (url.startsWith('/')) {
    return url;
  }

  // Handle OpenAI URLs
  if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    const encodedUrl = encodeURIComponent(url);
    return `/api/proxy-image?url=${encodedUrl}`;
  }

  // Any other URL, return as is
  return url;
};

export default function GenerateLogoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingKit, setIsDownloadingKit] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Function to trigger user data refresh in the parent layout
  const refreshUserData = () => {
    // Create and dispatch a custom event that the layout component will listen for
    const event = new CustomEvent('refreshUserData');
    document.dispatchEvent(event);
  };

  // Disable service worker for image editing to prevent caching issues
  useEffect(() => {
    if (activeTab === "edit") {
      // Attempt to unregister service worker before editing images
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            console.log('Unregistering service worker during image edit');
            registration.unregister();
          }
        });
      }
    }
  }, [activeTab]);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('Image size should be less than 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Clear the uploaded image
  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsGenerating(true);
      setImageUrl(null);

      const payload: any = { prompt: values.prompt };

      // If we're in edit mode and have an uploaded image, include it
      if (activeTab === "edit" && uploadedImage) {
        payload.imageBase64 = uploadedImage;
      }

      // Use the same approach for both generate and edit to ensure consistency
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include' as RequestCredentials,
        body: JSON.stringify(payload),
      };

      console.log(`Starting ${activeTab === "edit" ? "image edit" : "logo generation"}...`);

      const response = await fetch("/api/generate", requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Server error: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.error || `Failed to ${activeTab === "edit" ? "edit image" : "generate logo"}: ${response.status}`);
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("No image URL received from server");
      }

      setImageUrl(data.imageUrl);
      console.log(`${activeTab === "edit" ? "Image edit" : "Logo generation"} successful`);

      // After successful generation, refresh the user data to update credits
      refreshUserData();
    } catch (error: any) {
      console.error(`Error ${activeTab === "edit" ? "editing image" : "generating logo"}:`, error);
      form.setError("prompt", {
        type: "manual",
        message: error.message || `Failed to ${activeTab === "edit" ? "edit image" : "generate logo"}. Please try again.`,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveLogo() {
    if (!imageUrl) return;

    try {
      setIsSaving(true);
      const prompt = form.getValues("prompt");

      console.log("Saving image to database...");
      console.log("Image URL type:", typeof imageUrl);
      console.log("Image URL length:", imageUrl.length);

      const response = await fetch("/api/logos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          prompt,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error saving logo:", errorData || response.statusText);
        throw new Error(errorData?.error || "Failed to save logo");
      }

      const data = await response.json();
      console.log("Save response:", data);

      // Only show success dialog - don't auto-redirect
      setSuccessDialogOpen(true);

      // Refresh user data after saving logo
      refreshUserData();
    } catch (error: any) {
      console.error("Error saving logo:", error);
      // Show error message to user
      alert(`Failed to save: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function downloadLogoKit() {
    if (!imageUrl) return;

    try {
      setIsDownloadingKit(true);

      // In a real app, this would call a backend endpoint that generates
      // and returns a zip file with different formats of the logo
      const response = await fetch("/api/logo-kit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          prompt: form.getValues("prompt"),
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
    } finally {
      setIsDownloadingKit(false);
    }
  }

  function handleViewDashboard() {
    setSuccessDialogOpen(false);
    router.push("/dashboard");
  }

  function handleCreateNew() {
    setSuccessDialogOpen(false);
    setImageUrl(null);
    form.reset();
  }

  // Reset the uploaded image when switching tabs
  useEffect(() => {
    if (activeTab === "generate") {
      clearUploadedImage();
    }
    setImageUrl(null);
  }, [activeTab]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      <BlurFade delay={0.1} inView>
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3">Create with LogoGPT</h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Describe your ideal logo and our AI will create it for you in seconds.
          </p>
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlurFade delay={0.2} inView>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 w-full grid grid-cols-2 h-11 items-center bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-lg gap-1">
                  <TabsTrigger
                    value="generate"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm rounded-md h-9 px-3 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">Generate Logo</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="edit"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm rounded-md h-9 px-3 flex items-center justify-center gap-2 transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="text-sm font-medium">Edit Image</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-6">
                  <Form {...form}>
                    <form className="space-y-5">
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Describe your logo</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="E.g., Modern logo for a tech startup with blue and purple gradients, minimalist design with a circuit board pattern"
                                {...field}
                                className="min-h-32 resize-none rounded-lg focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => onSubmit(form.getValues())}
                          disabled={isGenerating}
                          className="px-6 py-6 rounded-full text-base"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Logo
                            </>
                          )}
                        </Button>
                        {imageUrl && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={saveLogo}
                              disabled={isSaving}
                              className="rounded-full text-base"
                            >
                              {isSaving ? "Saving..." : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Logo
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={downloadLogoKit}
                              disabled={isDownloadingKit}
                              className="rounded-full text-base"
                            >
                              {isDownloadingKit ? "Preparing..." : (
                                <>
                                  <FileType className="mr-2 h-4 w-4" />
                                  Download Kit
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                      {form.formState.errors.prompt && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                          {form.formState.errors.prompt.message?.toString()}
                        </div>
                      )}
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="edit" className="space-y-5">
                  <div>
                    <h3 className="text-base font-medium mb-2">Upload an image to edit</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      Upload an image (max 4MB) that you'd like to modify.
                    </p>

                    {!uploadedImage ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 cursor-pointer bg-white dark:bg-neutral-800"
                        onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus className="h-8 w-8 text-neutral-400 dark:text-neutral-500 mb-3" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click to select an image
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-56 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                        <Image
                          src={uploadedImage}
                          alt="Uploaded image"
                          fill
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={clearUploadedImage}
                          className="absolute top-3 right-3 bg-black/70 text-white p-1.5 rounded-full"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Form {...form}>
                    <form className="space-y-5">
                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Describe the changes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="E.g., Change the color to blue, add a circuit board pattern, make it more minimalist"
                                {...field}
                                className="min-h-24 resize-none rounded-lg focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => {
                            if (!uploadedImage) {
                              alert("Please upload an image first");
                              return;
                            }
                            onSubmit(form.getValues());
                          }}
                          disabled={isGenerating || !uploadedImage}
                          className="px-6 py-6 rounded-full text-base"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                              Editing...
                            </>
                          ) : (
                            <>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Image
                            </>
                          )}
                        </Button>
                        {imageUrl && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={saveLogo}
                              disabled={isSaving}
                              className="rounded-full text-base"
                            >
                              {isSaving ? "Saving..." : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Result
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={downloadLogoKit}
                              disabled={isDownloadingKit}
                              className="rounded-full text-base"
                            >
                              {isDownloadingKit ? "Preparing..." : (
                                <>
                                  <FileType className="mr-2 h-4 w-4" />
                                  Download Kit
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                      {form.formState.errors.prompt && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                          {form.formState.errors.prompt.message?.toString()}
                        </div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <Card className="overflow-hidden rounded-xl shadow-lg border-neutral-200 dark:border-neutral-800 h-full">
            <CardContent className="p-0 aspect-square relative flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              {isGenerating ? (
                <div className="w-full h-full">
                  <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900">
                    <div className="absolute inset-0 bg-grid-neutral-200/50 dark:bg-grid-neutral-800/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-neutral-900" />
                  </div>
                  <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-4">
                        <div className="w-full h-full max-w-sm mx-auto blur-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-30" />
                      </div>
                      <Sparkles className="h-12 w-12 text-blue-500 relative animate-pulse" />
                    </div>
                    <div className="text-center mt-8">
                      <div className="font-medium text-lg tracking-tight mb-2">
                        {activeTab === "edit" ? "Editing your image..." : "Creating your logo..."}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        Processing your request
                      </div>
                    </div>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full group">
                  <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900">
                    <div className="absolute inset-0 bg-grid-neutral-200/50 dark:bg-grid-neutral-800/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-neutral-900" />
                  </div>
                  <Image
                    src={getImageUrl(imageUrl)}
                    alt={activeTab === "edit" ? "Edited image" : "Generated logo"}
                    fill
                    className="object-contain p-8 relative z-10"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={true}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    <a
                      href={getImageUrl(imageUrl)}
                      download={activeTab === "edit" ? "edited-image.png" : "logo.png"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-105"
                    >
                      <Button
                        size="sm"
                        className="rounded-full bg-white dark:bg-neutral-800 text-black dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Download PNG
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 w-full h-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-grid-neutral-200/50 dark:bg-grid-neutral-800/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 dark:from-neutral-900" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl" />
                      {activeTab === "edit" && uploadedImage ? (
                        <Pencil className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
                      ) : (
                        <Sparkles className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight mb-3">
                      {activeTab === "edit" && uploadedImage
                        ? "Ready to transform"
                        : "Create something amazing"}
                    </h3>
                    <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
                      {activeTab === "edit"
                        ? (uploadedImage
                          ? "Describe your vision and watch the magic happen"
                          : "Upload an image to begin your creative journey")
                        : "Describe your perfect logo and let AI bring it to life"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tighter">
              {activeTab === "edit" ? "Image Edit Saved!" : "LogoGPT Creation Saved!"}
            </DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              {activeTab === "edit"
                ? "Your edited image has been saved to your dashboard."
                : "Your logo has been saved to your dashboard."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              onClick={handleViewDashboard}
              className="flex-1 gap-1.5 rounded-lg"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateNew}
              className="flex-1 rounded-lg"
            >
              {activeTab === "edit" ? "Edit Another Image" : "Create Another Logo"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSuccessDialogOpen(false)}
              className="flex-1 rounded-lg"
            >
              Continue Editing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 