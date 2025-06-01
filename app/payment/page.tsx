'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, ArrowRight, Star, Check, Zap, Crown, Loader2 } from 'lucide-react';
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { useUser } from '@clerk/nextjs';

const PLANS = [
  {
    id: 'standard',
    name: 'Standard Plan',
    productId: process.env.NEXT_PUBLIC_STANDARD_PLAN || "805962",
    price: 5,
    credits: 30,
    icon: Star,
    features: [
      'Generate 30 high-quality logos',
      'Download in PNG & SVG formats',
      'Basic mockup templates',
      'Logo storage for 3 months',
      'Email support',
    ],
    badge: 'Popular',
    buttonText: 'Get Standard Plan',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    productId: process.env.NEXT_PUBLIC_PRO_PLAN || "805971",
    price: 10,
    credits: 75,
    icon: Crown,
    features: [
      'Generate 75 high-quality logos',
      'All formats (PNG, SVG, EPS, PDF)',
      'Premium mockup templates',
      'Logo storage for 12 months',
      'Priority support',
      'Commercial license included',
    ],
    badge: 'Best Value',
    buttonText: 'Get Pro Plan',
  },
];

const PaymentPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { user } = useUser();

  const buyproduct = async (productId: string) => {
    const response = await axios.post("api/payment", {
      productId: productId,
      userId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
    });
    return response;
  };

  const handlePlanSelection = async (plan: typeof PLANS[0]) => {
    try {
      setIsLoading(true);
      setSelectedPlanId(plan.id);

      // Handle async plan selection logic here
      console.log('Processing plan selection:', plan);

      // Call the buyproduct function with the selected plan productId
      const response = await buyproduct(plan.productId);
      console.log('Payment response:', response.data);

      // Check if response contains a URL for redirection
      if (response.data && response.data.url) {
        console.log('Redirecting to:', response.data.url);
        // Redirect user to the payment URL
        window.location.href = response.data.url;
      } else {
        // Handle successful payment response without redirect
        alert(`Successfully processed ${plan.name} for $${plan.price} (${plan.credits} credits)`);
      }

    } catch (error) {
      console.error('Error processing plan selection:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 py-16 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-blue-500/3 to-blue-600/3 blur-3xl transform rotate-12" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-blue-500/3 to-blue-600/3 blur-3xl transform -rotate-12" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <BlurFade delay={0.1} inView>
            <div className="mb-6">
              <Badge variant="outline" className="py-2 px-6 text-sm font-medium bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 backdrop-blur-sm">
                Choose Your Plan
              </Badge>
            </div>
          </BlurFade>
          <BlurFadeText delay={0.2}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-100 bg-clip-text text-transparent">
              Professional Pricing
            </h1>
          </BlurFadeText>
          <BlurFade delay={0.3} inView>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Choose the perfect plan for your logo creation needs. Simple, transparent pricing with no hidden fees.
            </p>
          </BlurFade>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <BlurFade key={plan.id} delay={0.4 + index * 0.1} inView>
                <div className={`relative h-full flex flex-col p-8 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 group ${plan.id === 'pro'
                  ? 'bg-white dark:bg-neutral-900 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}>
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className={`py-2 px-4 text-xs font-semibold tracking-wide ${plan.id === 'pro'
                        ? 'bg-blue-600 text-white border-0 shadow-lg'
                        : 'bg-green-600 text-white border-0 shadow-lg'
                        }`}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8 pt-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${plan.id === 'pro'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                      <Icon className={`w-8 h-8 ${plan.id === 'pro'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                        }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">
                        ${plan.price}
                      </span>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                      {plan.credits} logo credits included
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <Button
                      onClick={() => handlePlanSelection(plan)}
                      disabled={isLoading}
                      className={`w-full py-4 text-lg font-semibold transition-all duration-300 ${plan.id === 'pro'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50'
                        : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50'
                        }`}
                      size="lg"
                    >
                      {isLoading && selectedPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.buttonText}
                          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </BlurFade>
            );
          })}
        </div>

        {/* Contact Info */}
        <BlurFade delay={0.8} inView>
          <div className="text-center mt-20">
            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto">
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
                Questions about our plans?
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="gap-3 py-3 px-6 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Button>
              </Link>
            </div>
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