"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { DumbbellIcon, HomeIcon, MenuIcon, UserIcon, X, ZapIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to determine mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside or when changing to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded">
            <ZapIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-bold font-mono">
            Atho<span className="text-primary">nix</span>.ai
          </span>
        </Link>

        {/* HAMBURGER MENU ICON - Only visible on mobile */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="p-1"
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </Button>
        </div>

        {/* DESKTOP NAVIGATION - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-5">
          {isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <HomeIcon size={16} />
                <span>Home</span>
              </Link>

              <Link
                href="/generate-program"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <DumbbellIcon size={16} />
                <span>Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <UserIcon size={16} />
                <span>Profile</span>
              </Link>
              <Button
                asChild
                variant="outline"
                className="ml-2 border-primary/50 text-primary hover:text-white hover:bg-primary/10"
              >
                <Link href="/generate-program">Get Started</Link>
              </Button>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <Button
                  variant={"outline"}
                  className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>

      {/* MOBILE MENU - Only visible when hamburger is clicked */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg py-4 px-6 flex flex-col gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <HomeIcon size={18} />
                <span>Home</span>
              </Link>

              <Link
                href="/generate-program"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <DumbbellIcon size={18} />
                <span>Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon size={18} />
                <span>Profile</span>
              </Link>
              
              <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/generate-program">Get Started</Link>
                </Button>
                <UserButton />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <SignInButton>
                <Button
                  variant={"outline"}
                  className="w-full border-primary/50 text-primary hover:text-white hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;