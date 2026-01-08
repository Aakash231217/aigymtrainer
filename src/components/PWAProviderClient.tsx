"use client"

import React, { useEffect } from 'react'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

// Client component for PWA functionality that will be imported in layout
export default function PWAProviderClient() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope)
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  return <PWAInstallPrompt />
}
