"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip service worker registration on the generate page
    if (pathname?.includes('/generate')) {
      // Try to unregister any existing service workers on the generate page
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            console.log('Unregistering service worker on generate page');
            registration.unregister();
          }
        });
      }
      return;
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/service-worker.js').then(
          function (registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope);
          },
          function (err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, [pathname]);

  return null;
} 