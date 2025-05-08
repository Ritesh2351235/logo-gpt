'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, ArrowRight, Star } from 'lucide-react';
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-500/5 to-blue-600/5 blur-3xl transform rotate-12 dark:from-blue-500/5 dark:to-blue-600/5" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-blue-500/5 to-blue-600/5 blur-3xl transform -rotate-12 dark:from-blue-500/5 dark:to-blue-600/5" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        <BlurFade delay={0.1} inView>
          <div className="mb-12">
            <div className="inline-block animate-float">
              <Badge variant="outline" className="mb-4 py-2 px-4 text-sm bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 backdrop-blur-sm">
                <Star className="w-4 h-4 mr-1.5 inline-block" />
                Payment System Update
              </Badge>
            </div>
            <BlurFadeText delay={0.2}>
              <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-100 bg-clip-text text-transparent">
                Need Credits?
              </h1>
            </BlurFadeText>
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
                While our payment system is being set up, we're handling credit requests directly. Simply reach out to us, and we'll help you get the credits you need.
              </p>
              <p className="text-lg text-neutral-500 dark:text-neutral-500">
                Thank you for your understanding and cooperation during this transition.
              </p>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <div className="flex flex-col items-center gap-4">
            <Link href="/contact">
              <Button
                className="gap-2 py-6 px-8 text-lg group relative overflow-hidden bg-neutral-900 hover:bg-black dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                size="lg"
              >
                <Mail className="w-5 h-5" />
                Contact Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              We'll respond within 24 hours
            </span>
          </div>
        </BlurFade>
      </div>
    </div>
  );
};

export default PaymentPage;

/* Original implementation preserved as comment for future use
const PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 5,
    credits: 30,
    features: [
      'Generate 30 high-quality logos',
      'Download in multiple formats',
      'Access to basic mockup tools',
      'Logo storage for 3 months',
    ],
    badge: 'Popular',
  },
  ... rest of the original implementation ...
*/