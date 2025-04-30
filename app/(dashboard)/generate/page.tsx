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
import { Sparkles, Save, ArrowRight, LightbulbIcon } from "lucide-react";

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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Logo</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Describe your ideal logo and our AI will create it for you in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className="min-h-24 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5"
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveLogo}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Logo
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 mb-4 text-neutral-800 dark:text-neutral-200">
              <LightbulbIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-medium">Tips for great logos</h2>
            </div>
            <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Be specific about colors, style, and theme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Mention your industry or company type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Describe any symbols or icons you want to include</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Specify the mood or feeling you want to convey</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Consider shapes (circular, square, etc.) for your design</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <Card className="overflow-hidden rounded-xl shadow-sm border-neutral-200 dark:border-neutral-800">
            <CardContent className="p-0 aspect-square relative flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
              {isGenerating ? (
                <div className="text-center">
                  <Skeleton className="w-full h-full absolute inset-0" />
                  <div className="relative z-10 p-4">
                    <div className="animate-pulse mb-4 font-medium">Creating your masterpiece...</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      This may take up to 30 seconds
                    </div>
                  </div>
                </div>
              ) : imageUrl ? (
                <Image
                  src={getImageUrl(imageUrl)}
                  alt="Generated logo"
                  fill
                  className="object-contain p-4"
                  priority
                  unoptimized={imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
              ) : (
                <div className="text-center p-8">
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  </div>
                  <div className="text-neutral-700 dark:text-neutral-300 font-medium mb-2">
                    Your logo will appear here
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Create a detailed prompt and click Generate
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logo Saved Successfully!</DialogTitle>
            <DialogDescription>
              Your logo has been saved to your dashboard and is ready to use.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-6 bg-neutral-50 dark:bg-neutral-900 rounded-md my-2">
            {imageUrl && (
              <div className="relative w-48 h-48">
                <Image
                  src={getImageUrl(imageUrl)}
                  alt="Generated logo"
                  fill
                  className="object-contain"
                  unoptimized={imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" onClick={handleCreateNew}>
              Create Another Logo
            </Button>
            <Button onClick={handleViewDashboard} className="gap-1">
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 