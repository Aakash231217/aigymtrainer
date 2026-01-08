"use client";
import { useEffect } from 'react';

export default function usePWA() {
  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Use the window load event to register the service worker
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
