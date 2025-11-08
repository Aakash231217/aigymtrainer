"use client";

import React, { useMemo } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!publishableKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}
if (!convexUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_CONVEX_URL");
}

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  
  const convex = useMemo(() => 
    // FIX 1.6: Add non-null assertion (!)
    // This is now safe because we've already validated 'convexUrl' outside the component.
    new ConvexReactClient(convexUrl!), 
  []);

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;