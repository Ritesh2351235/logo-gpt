"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/magicui/globe";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { motion } from "@/lib/motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-50">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Logo Master</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 pt-24 md:pt-28 px-4">
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center text-center pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-6"
            >
              <Globe className="w-40 h-40 text-neutral-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">LM</span>
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <BlurFadeText>AI-Powered Logo Generation</BlurFadeText>
            </h1>
            <p className="max-w-3xl text-xl text-neutral-500 dark:text-neutral-400 mb-8">
              Create stunning, professional logos for your brand in seconds with our AI-powered logo generator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full py-6">
                  Generate a Logo
                </Button>
              </Link>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full py-6">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-neutral-100 dark:bg-neutral-900">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
              Everything you need to create the perfect logo for your brand
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-powered Logo Generation"
              description="Leverage the power of AI to create unique, professional logos based on your description."
            />
            <FeatureCard
              title="Instant Mockups"
              description="See your logo in context with instant mockups on business cards, websites, and more."
            />
            <FeatureCard
              title="Brand Kit Downloads"
              description="Download your complete brand kit including various formats and color variations."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
              Thousands of businesses trust Logo Master for their branding needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Logo Master saved us thousands on logo design. We got a professional logo in minutes!"
              author="Sarah Johnson"
              role="Startup Founder"
            />
            <TestimonialCard
              quote="I was blown away by the quality of the AI-generated logos. Exactly what I needed for my brand."
              author="Michael Chen"
              role="Marketing Director"
            />
            <TestimonialCard
              quote="The ability to iterate quickly and try different concepts made finding the perfect logo so easy."
              author="Emma Davis"
              role="Small Business Owner"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t dark:border-neutral-800">
        <div className="container max-w-screen-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Logo Master to create stunning logos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/generate">
              <Button size="lg" className="w-full sm:w-auto py-6">
                Generate a Logo
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" size="lg" className="w-full sm:w-auto py-6">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t dark:border-neutral-800">
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="mb-8 md:mb-0">
              <div className="text-xl font-bold mb-4">Logo Master</div>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                AI-powered logo generation for businesses of all sizes.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Examples
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t dark:border-neutral-800 text-center md:text-left text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Logo Master. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-neutral-950 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-white dark:bg-neutral-950 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <p className="mb-4 text-neutral-600 dark:text-neutral-300 italic">"{quote}"</p>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">{role}</p>
      </div>
    </div>
  );
}
