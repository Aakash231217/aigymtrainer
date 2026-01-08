"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, XIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed, don't show prompt
    }

    // Store the install prompt event for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Set a timeout to show the prompt if the user hasn't interacted
    const timeoutId = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true);
      }
    }, 30000); // Show after 30 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeoutId);
    };
  }, [isInstallable]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt as it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Set a cookie or localStorage value to remember user dismissed it
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-background border border-border p-4 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-base">Install Athonix App</h3>
        <button onClick={dismissPrompt} className="text-muted-foreground hover:text-foreground">
          <XIcon size={18} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Install Athonix on your device for a better experience, offline access, and faster loading.
      </p>
      <Button onClick={handleInstallClick} className="w-full" size="sm">
        <DownloadIcon className="mr-2 h-4 w-4" />
        Install App
      </Button>
    </div>
  );
};

export default PWAInstallPrompt;
