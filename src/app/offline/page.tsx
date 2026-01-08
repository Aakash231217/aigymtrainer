"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { WifiOffIcon, RefreshCcwIcon } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-4">
      <div className="flex flex-col items-center max-w-md mx-auto space-y-8">
        <div className="p-4 rounded-full bg-primary/10">
          <WifiOffIcon className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">You're Offline</h1>
        
        <p className="text-lg text-muted-foreground">
          Looks like you've lost your internet connection. Your progress will be saved when you're back online.
        </p>
        
        <div className="space-y-4 w-full">
          <Button 
            className="w-full" 
            onClick={handleRefresh}
            size="lg"
          >
            <RefreshCcwIcon className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Some features of Athonix may be available offline, but for the best experience, please reconnect to the internet.
          </p>
        </div>
      </div>
    </div>
  );
}
