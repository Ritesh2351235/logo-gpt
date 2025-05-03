"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";

// Logo example images
const logoImages = [
  "https://logo-gpt.s3.ap-south-1.amazonaws.com/logos/885ccbcb-b3e9-4da3-a5cc-5eb4d638895b.png",
  "https://logo-gpt.s3.ap-south-1.amazonaws.com/logos/b8689bc5-9f88-47c8-88fb-6180bd854813.png",
  "https://logo-gpt.s3.ap-south-1.amazonaws.com/logos/032b4832-2266-4a12-8174-581456c11d8f.png",
  "https://i.pinimg.com/736x/7f/02/f7/7f02f7f6985458a48ddb7ebb3dff550c.jpg",
  "https://i.pinimg.com/736x/df/51/ba/df51bae01cd310b9012c8b65de3c6b2f.jpg",
  "https://i.pinimg.com/736x/f1/33/e5/f133e5a7e8e02e8d443e5ab4fa46dfe6.jpg",
  "https://i.pinimg.com/736x/d8/01/bd/d801bd116b548884bc80a2a9239be297.jpg",
  "https://i.pinimg.com/736x/31/fd/b9/31fdb93556b16c7811e9c076932457b2.jpg",
  "https://logo-gpt.s3.ap-south-1.amazonaws.com/logos/4121e0da-50fe-4553-875b-7059d462affd.png"
];

// Feature items
const features = [
  {
    title: "GPT-Image-1 Powered",
    description: "Generate your logos with OpenAI's latest GPT-Image-1 model, tailored to your brand's unique identity."
  },
  {
    title: "Free Logo Kit",
    description: "Download your complete logo kit with multiple formats and variations at no additional cost."
  },
  {
    title: "Built-in Mockup Tool",
    description: "Try our in-house built mockup tool to visualize and share your logos in real-world scenarios."
  },
  {
    title: "Centralized Dashboard",
    description: "Access all your generated logos from one intuitive dashboard, making management effortless."
  }
];

// JSON-LD Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LogoGPT",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "5.00",
    "priceCurrency": "USD"
  },
  "description": "AI-powered logo generation tool that creates professional logos in minutes.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "250"
  }
};

export default function LandingPage() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex flex-col min-h-screen dark:bg-neutral-950 bg-white">
        <Navbar variant="landing" />
        <main>
          {/* Hero Section - With BlurFadeText */}
          <section className="flex items-center justify-center pt-12 pb-16 px-4" aria-labelledby="hero-heading">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-8"
              >
                <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold tracking-tight">
                  <BlurFadeText>Professional Logos</BlurFadeText>
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    In Minutes, Not Months
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                  <span className="font-bold">Stop spending thousands</span> on logo designs. Create
                  <span className="font-bold"> stunning, professional-looking logos</span> in minutes with AI.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Logo Images Collage Section */}
          <section className="py-8 px-4 bg-white dark:bg-neutral-900" aria-labelledby="examples-heading">
            <div className="container mx-auto max-w-5xl">
              {/* Logo Collage */}
              <h2 id="examples-heading" className="text-3xl font-bold tracking-tighter mb-6 text-center">
                Stunning Logo Examples
              </h2>
              <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
                {logoImages.map((imageUrl, idx) => (
                  <BlurFade key={imageUrl} delay={0.25 + idx * 0.05} inView>
                    <div className="mb-4 rounded-xl overflow-hidden bg-white shadow-lg">
                      <img
                        className="w-full object-cover"
                        src={imageUrl}
                        alt={`AI-generated logo example ${idx + 1} created with LogoGPT`}
                        loading={idx < 3 ? "eager" : "lazy"}
                        width="400"
                        height="400"
                      />
                    </div>
                  </BlurFade>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section - Moved before pricing and restyled */}
          <section className="space-y-12 w-full py-16 px-4" aria-labelledby="features-heading">
            <div className="container mx-auto max-w-5xl">
              <BlurFade delay={0.2} inView>
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                      Features
                    </div>
                    <BlurFadeText>
                      <h2 id="features-heading" className="text-3xl font-bold tracking-tighter sm:text-5xl">
                        Everything You Need
                      </h2>
                    </BlurFadeText>
                    <p className="text-muted-foreground md:text-xl/relaxed max-w-2xl mx-auto">
                      Our comprehensive logo creation platform offers all the tools you need to create, manage,
                      and showcase your brand identity.
                    </p>
                  </div>
                </div>
              </BlurFade>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <BlurFade key={feature.title} delay={0.3 + index * 0.1} inView>
                    <article className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all">
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">{feature.description}</p>
                    </article>
                  </BlurFade>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 px-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900" aria-labelledby="pricing-heading">
            <div className="container mx-auto max-w-5xl">
              <div className="text-center mb-12">
                <BlurFadeText>
                  <h2 id="pricing-heading" className="text-3xl font-bold tracking-tighter sm:text-5xl mb-3">Pricing Tailored To Your Fit</h2>
                </BlurFadeText>
                <p className="text-xl text-neutral-600 dark:text-neutral-400">
                  Stop spending thousands of dollars. Generate 30 logos for just <span className="font-bold text-blue-600">$5</span>.
                </p>
                <p className="mt-3 text-neutral-500 dark:text-neutral-400">
                  We have multiple pricing options that adapt to your specific needs.
                </p>
              </div>

              {/* Pricing Cards - Improved styling and added second plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Starter Plan */}
                <BlurFade delay={0.3} inView>
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">Starter Plan</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          Popular
                        </span>
                      </div>
                      <div className="mb-6">
                        <p className="text-4xl font-bold">
                          $5
                          <span className="text-neutral-500 dark:text-neutral-400 text-base font-normal"> / month</span>
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">Perfect for individuals and small businesses</p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-grow">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Generate <strong>30</strong> high-quality logos</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Download in multiple formats</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Access to basic mockup tools</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Logo storage for 3 months</span>
                        </li>
                      </ul>
                      <Link href="/sign-up" className="w-full">
                        <Button className="w-full py-6" size="lg">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </BlurFade>

                {/* Pro Plan */}
                <BlurFade delay={0.4} inView>
                  <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">Pro Plan</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          Best Value
                        </span>
                      </div>
                      <div className="mb-6">
                        <p className="text-4xl font-bold">
                          $10
                          <span className="text-neutral-500 dark:text-neutral-400 text-base font-normal"> / month</span>
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2">For businesses with extensive branding needs</p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-grow">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Generate <strong>80</strong> high-quality logos</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Download in all formats with source files</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Advanced mockup tools and templates</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Unlimited logo storage</span>
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Priority customer support</span>
                        </li>
                      </ul>
                      <Link href="/sign-up" className="w-full">
                        <Button className="w-full py-6" size="lg">
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </div>
                  </div>
                </BlurFade>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Updated to remove non-existent page links */}
        <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 py-12 px-4 mt-auto">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">LogoGPT</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
                  Create professional logos in minutes with AI technology tailored for businesses of all sizes.
                </p>
                <p className="text-neutral-500 dark:text-neutral-500 text-sm">
                  © {new Date().getFullYear()} LogoGPT. All rights reserved.
                </p>
              </div>
              <div>
                <h3 className="text-md font-bold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="#features-heading" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#pricing-heading" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/contact" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
