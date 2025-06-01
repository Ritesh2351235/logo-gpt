"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { CreditCard, Loader2 } from "lucide-react";
import Script from "next/script";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentFailure from "@/components/payment/PaymentFailure";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "starter",
    name: "Starter Plan",
    priceUSD: 5,
    credits: 30,
    description: "Perfect for individuals and small businesses",
    badge: "Popular",
    features: [
      "Generate 30 high-quality logos",
      "Download in multiple formats",
      "Access to basic mockup tools",
      "Logo storage for 3 months",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    priceUSD: 10,
    credits: 80,
    description: "For businesses with extensive branding needs",
    badge: "Best Value",
    features: [
      "Generate 80 high-quality logos",
      "Download in all formats with source files",
      "Advanced mockup tools and templates",
      "Unlimited logo storage",
      "Priority customer support",
    ],
  },
];

const PaymentPage = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | { credits: number; plan: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const [inrPrices, setInrPrices] = useState<{ [planId: string]: number }>({});
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    async function fetchInrPrices() {
      const prices: { [planId: string]: number } = {};
      for (const plan of PLANS) {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.id, displayCurrency: "USD" }),
        });
        const data = await res.json();
        prices[plan.id] = data.amount;
      }
      setInrPrices(prices);
    }
    fetchInrPrices();
  }, []);

  useEffect(() => {
    if (isSignedIn === false) {
      router.replace("/sign-in");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, error, router]);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, displayCurrency: "USD" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded");
      const planObj = PLANS.find((p) => p.id === selectedPlan);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: "INR",
        name: "LogoGPT",
        description: `${planObj?.name} - INR`,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              planId: selectedPlan,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(verifyData.error || "Payment verification failed");
          } else {
            setSuccess({ credits: planObj?.credits || 0, plan: planObj?.name || "" });
          }
        },
        prefill: {},
        theme: { color: "#111" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
        <PaymentSuccess credits={success.credits} plan={success.plan} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
        <PaymentFailure error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-2 bg-white dark:bg-neutral-950">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <BlurFadeText>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-neutral-900 dark:text-white">Buy Credits</h1>
      </BlurFadeText>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full mb-10">
        {/* Starter Plan */}
        <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border-2 ${selectedPlan === 'starter' ? 'border-blue-500 dark:border-blue-500' : 'border-neutral-200 dark:border-neutral-700'} hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full cursor-pointer`} onClick={() => setSelectedPlan('starter')}>
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
            <Button className={`w-full py-6 text-lg font-semibold rounded-xl shadow-md transition-all duration-200 ${selectedPlan === 'starter' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`} onClick={handlePay} disabled={loading || !razorpayLoaded || selectedPlan !== 'starter'}>
              {loading && selectedPlan === 'starter' ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {selectedPlan === 'starter' ? (loading ? 'Processing...' : 'Buy Credits') : 'Choose Plan'}
            </Button>
          </div>
        </div>
        {/* Pro Plan */}
        <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border-2 ${selectedPlan === 'pro' ? 'border-blue-500 dark:border-blue-500' : 'border-neutral-200 dark:border-neutral-700'} hover:border-blue-500 dark:hover:border-blue-500 transition-all h-full cursor-pointer`} onClick={() => setSelectedPlan('pro')}>
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
            <Button className={`w-full py-6 text-lg font-semibold rounded-xl shadow-md transition-all duration-200 ${selectedPlan === 'pro' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`} onClick={handlePay} disabled={loading || !razorpayLoaded || selectedPlan !== 'pro'}>
              {loading && selectedPlan === 'pro' ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {selectedPlan === 'pro' ? (loading ? 'Processing...' : 'Buy Credits') : 'Choose Plan'}
            </Button>
          </div>
        </div>
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