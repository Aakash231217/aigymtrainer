"use client"

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

// Use a client component for PWA functionality
const PWAProvider = () => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
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

export default PWAProvider
