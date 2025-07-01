"use client"
import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import { ArrowRightIcon, ActivityIcon, BrainIcon, DumbbellIcon, HeartPulseIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* Animated background elements */}
      
    {/* FYS badge removed */}
  
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,var(--border)_25px),linear-gradient(90deg,transparent_24px,var(--border)_25px)] bg-[size:25px_25px] opacity-[0.02]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
            {/* Decorative elements */}
            <div className="absolute -top-16 -left-16 w-64 h-64 border-l-2 border-t-2 border-primary/20 rounded-tl-3xl" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 border-r-2 border-b-2 border-primary/20 rounded-br-3xl" />
            
            {/* LEFT SIDE CONTENT */}
            <div className="lg:col-span-7 space-y-8 relative">
              <div className="inline-block px-4 py-1 bg-primary/10 rounded-full mb-6">
                <span className="text-primary font-mono text-sm">AI-POWERED FITNESS REVOLUTION</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <div className="overflow-hidden">
                  <span className="text-foreground inline-block transform transition-transform duration-700 translate-y-0 opacity-100">
                    Transform
                  </span>
                </div>
                <div className="overflow-hidden pt-2">
                  <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block transform transition-transform duration-700 translate-y-0 opacity-100">
                    Your Body
                  </span>
                </div>
                <div className="overflow-hidden pt-2">
                  <span className="text-foreground inline-block transform transition-transform duration-700 translate-y-0 opacity-100">
                    With Advanced
                  </span>
                </div>
                <div className="overflow-hidden pt-2">
                  <span className="transform transition-transform duration-700 translate-y-0 opacity-100">
                    <span className="text-foreground">AI</span>
                    <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Technology</span>
                  </span>
                </div>
              </h1>

              {/* Animated separator line */}
              <div className="relative h-px w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-70"></div>
                <div 
                  className="h-full w-1/2 bg-white animate-pulse"
                />
              </div>

              <p className="text-xl text-muted-foreground md:w-4/5 leading-relaxed">
                Experience the future of fitness with our AI assistant that creates 
                personalized diet plans and workout routines tailored to your unique body,
                goals, and preferences.
              </p>

              {/* STATS */}
              <div className="flex flex-wrap items-center gap-10 py-6 font-mono">
                <div className="flex flex-col group">
                  <div className="text-3xl text-primary transition-transform hover:scale-110">2000+</div>
                  <div className="text-xs uppercase tracking-wider mt-1">ACTIVE USERS</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col group">
                  <div className="text-3xl text-primary transition-transform hover:scale-110">2min/user</div>
                  <div className="text-xs uppercase tracking-wider mt-1">Creation Time</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col group">
                  <div className="text-3xl text-primary transition-transform hover:scale-110">100%</div>
                  <div className="text-xs uppercase tracking-wider mt-1">PERSONALIZED</div>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Button
                  size="lg"
                  asChild
                  className="overflow-hidden bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-secondary text-primary-foreground px-8 py-7 text-lg font-medium group relative"
                >
                  <Link href={"/generate-program"} className="flex items-center font-mono">
                    Build Your Program
                    <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 w-full h-full bg-white/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  </Link>
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary/30 text-foreground px-8 py-7 text-lg font-medium hover:bg-primary/10"
                >
                  
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="lg:col-span-5 relative">
              {/* Glowing outline */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur-xl opacity-30" />
              
              {/* CORNER PIECES with animation */}
              <div className="absolute -inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary animate-pulse" />
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary animate-pulse" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary animate-pulse" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary animate-pulse" />
              </div>

              {/* IMAGE CONTAINER */}
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="relative overflow-hidden rounded-lg bg-cyber-black shadow-2xl">
                  {/* Semi-transparent gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-10 mix-blend-overlay" />
                  
                  <img
                    src="/hero-ai3.png"
                    alt="AI Fitness Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Overlay */}
      <TerminalOverlay />
      
      {/* User Programs Section */}
      <UserPrograms />
    </div>
  );
};

export default HomePage;