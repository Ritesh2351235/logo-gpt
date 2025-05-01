'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const AMOUNT = 500;
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleScriptLoad = () => {
    setScriptLoaded(true);
  };

  const handlePayment = async () => {
    if (!scriptLoaded) {
      console.error('Razorpay script not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: AMOUNT, currency: 'INR' }),
      });
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: AMOUNT * 100,
        currency: 'INR',
        name: 'LogoGPT',
        description: 'Payment for LogoGPT',
        order_id: data.orderId,
        handler: function (response: any) {
          console.log(response);
          console.log('Payment successful');
          //Handle successful payment UI
        },
        prefill: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          contact: '+1234567890',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Error processing payment:', error);
      //Handle error UI
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        strategy="lazyOnload"
      />

      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Payment
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Pay securely using Razorpay
          </p>
        </div>
        <div className="mt-8">
          <button
            disabled={isProcessing || !scriptLoaded}
            onClick={handlePayment}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isProcessing ? 'Processing...' : !scriptLoaded ? 'Loading Payment...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;