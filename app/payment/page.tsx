'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@clerk/nextjs';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Define pricing plans
const PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 5,
    amount: 500, // Amount in smallest currency unit (cents/paise)
    credits: 30,
    features: [
      'Generate 30 high-quality logos',
      'Download in multiple formats',
      'Access to basic mockup tools',
      'Logo storage for 3 months',
    ],
    badge: 'Popular',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 10,
    amount: 1000, // Amount in smallest currency unit (cents/paise)
    credits: 80,
    features: [
      'Generate 80 high-quality logos',
      'Download in all formats with source files',
      'Advanced mockup tools and templates',
      'Unlimited logo storage',
      'Priority customer support',
    ],
    badge: 'Best Value',
  },
];

const PaymentPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const router = useRouter();
  const { user } = useUser();

  const handleScriptLoad = () => {
    setScriptLoaded(true);
  };

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!scriptLoaded || !selectedPlan) {
      console.error('Razorpay script not loaded or no plan selected');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlan.amount,
          currency: 'INR',
          plan: selectedPlan.id,
        }),
      });
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedPlan.amount * 100,
        currency: 'INR',
        name: 'LogoGPT',
        description: `Payment for LogoGPT ${selectedPlan.name}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          console.log(response);

          // Verify payment and add credits
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                planId: selectedPlan.id,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment successful, redirect to dashboard
              router.push('/dashboard?payment=success');
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            // Handle error UI
          }
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
          contact: '',
        },
        theme: {
          color: '#3b82f6', // blue-500
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 py-12 px-4">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        strategy="lazyOnload"
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Choose Your Plan</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Select a plan that works for your logo generation needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`border-2 transition-all ${selectedPlan?.id === plan.id
                ? 'border-blue-500 dark:border-blue-500 shadow-lg'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 text-base"> / one-time</span>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                    Get <strong>{plan.credits}</strong> credits to use for logo generation
                  </p>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            disabled={isProcessing || !scriptLoaded || !selectedPlan}
            onClick={handlePayment}
            size="lg"
            className="px-8 py-6 text-lg"
          >
            {isProcessing ? 'Processing...' : !scriptLoaded ? 'Loading Payment...' : !selectedPlan ? 'Select a plan above' : `Pay $${selectedPlan.price} Now`}
          </Button>
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Secured by Razorpay • 100% secure payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;