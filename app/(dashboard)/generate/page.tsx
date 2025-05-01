"use client";

import { useState } from "react";
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
import { Sparkles, Save, ArrowRight, LightbulbIcon, Download, FileType } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

const getImageUrl = (url: string) => {
  if (url && url.startsWith('/')) {
    return url;
  }
  if (url && url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
    const encodedUrl = encodeURIComponent(url);
    return `/api/proxy-image?url=${encodedUrl}`;
  }
  return url;
};

export default function GenerateLogoPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingKit, setIsDownloadingKit] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsGenerating(true);
      setImageUrl(null);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ prompt: values.prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Server error: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.error || `Failed to generate logo: ${response.status}`);
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error: any) {
      console.error("Error generating logo:", error);
      form.setError("prompt", {
        type: "manual",
        message: error.message || "Failed to generate logo. Please try again.",
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
        throw new Error("Failed to save logo");
      }

      setSuccessDialogOpen(true);
    } catch (error) {
      console.error("Error saving logo:", error);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <BlurFade delay={0.1} inView>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-2">Create with LogoGPT</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Describe your ideal logo and our AI will create it for you in seconds.
          </p>
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlurFade delay={0.2} inView className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        className="min-h-24 resize-none rounded-lg focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-6 rounded-full"
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
                      className="rounded-full"
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
                      className="rounded-full"
                    >
                      {isDownloadingKit ? "Preparing..." : (
                        <>
                          <FileType className="mr-2 h-4 w-4" />
                          Download Logo Kit
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-4 text-neutral-800 dark:text-neutral-200">
              <LightbulbIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold">Tips for great logos</h2>
            </div>
            <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Be specific about colors, style, and theme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Mention your industry or company type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Describe any symbols or icons you want to include</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Specify the mood or feeling you want to convey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Consider shapes (circular, square, etc.) for your design</span>
              </li>
            </ul>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <Card className="overflow-hidden rounded-xl shadow-lg border-neutral-200 dark:border-neutral-800 h-full">
            <CardContent className="p-0 aspect-square relative flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              {isGenerating ? (
                <div className="w-full h-full">
                  <Skeleton className="w-full h-full absolute inset-0" />
                  <div className="relative z-10 p-4 h-full flex flex-col items-center justify-center">
                    <Sparkles className="h-8 w-8 animate-pulse mb-4 text-blue-500" />
                    <div className="text-center">
                      <div className="animate-pulse mb-4 font-medium">Creating your masterpiece...</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        This may take up to 30 seconds
                      </div>
                    </div>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(imageUrl)}
                    alt="Generated logo"
                    fill
                    className="object-contain p-4"
                    priority
                    unoptimized={imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                  />
                  <div className="absolute bottom-4 right-4">
                    <a
                      href={getImageUrl(imageUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm">
                        <Download className="h-4 w-4 mr-1" />
                        PNG
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Your logo will appear here</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto">
                    Describe your logo and click Generate to create it
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </BlurFade>
      </div>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tighter">LogoGPT Creation Saved!</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
              Your logo has been saved to your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
              Create Another Logo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 