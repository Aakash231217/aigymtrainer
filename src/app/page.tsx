"use client"
import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import { ArrowRightIcon, ActivityIcon, BrainIcon, DumbbellIcon, HeartPulseIcon } from "lucide-react";
import SalesAgent from "@/components/SalesAgent";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden bg-gradient-to-b from-background to-background/95">
      {/* Animated background elements */}
      
    <style jsx global>{`
      @keyframes fysBadgeTextShimmer-fys-badge-6817bdb4215068749ede38aa-1746386377862 {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }

      #fys-badge-6817bdb4215068749ede38aa-1746386377862:hover .fys-badge-inner {
         transform: translateY(-1px);
         box-shadow: 0 6px 10px -2px rgba(0, 0, 0, 0.2), 0 3px 6px -2px rgba(0, 0, 0, 0.2);
      }
    `}</style>
    <a
      id="fys-badge-6817bdb4215068749ede38aa-1746386377862"
      href="https://findyoursaas.com/tool/6817bdb4215068749ede38aa/athonix"
      target="_blank"
      style={{
        textDecoration: "none",
        display: "inline-block",
        color: "inherit"
      }}
    >
      <div
        className="fys-badge-inner"
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#374151",
          border: "1px solid #4B5563",
          borderRadius: "6px",
          padding: "6px 10px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          lineHeight: 1,
        }}
      >
        <img src="https://findyoursaas.com/logo.png"
             alt="FYS Logo"
             style={{
               width: "18px",
               height: "18px",
               borderRadius: "50%",
               marginRight: "6px",
               display: "block"
             }}/>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#F3F4F6", whiteSpace: "nowrap" }}>
          Featured on FYS
        </span>
      </div>
    </a>
  
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
                  <div className="text-3xl text-primary transition-transform hover:scale-110">500+</div>
                  <div className="text-xs uppercase tracking-wider mt-1">ACTIVE USERS</div>
                </div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                <div className="flex flex-col group">
                  <div className="text-3xl text-primary transition-transform hover:scale-110">3min</div>
                  <div className="text-xs uppercase tracking-wider mt-1">GENERATION</div>
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
                    alt="AI Fitness Coach"
                    className="size-full object-cover object-center"
                  />

                  {/* SCAN LINES */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,transparent_calc(50%-1px),var(--cyber-glow-primary)_50%,transparent_calc(50%+1px),transparent_100%)] bg-[length:100%_8px] animate-scanline pointer-events-none z-20" />
                  
                  {/* Horizontal scan effect - using CSS animation instead of framer-motion */}
                  <div
                    className="absolute inset-0 h-20 bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none z-20 animate-scan-vertical"
                  />

                  {/* DECORATIONS ON TOP THE IMAGE */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border border-primary/60 rounded-full animate-pulse" />
                    
                    {/* Targeting reticle */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="30" stroke="rgba(var(--primary), 0.3)" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="20" stroke="rgba(var(--primary), 0.3)" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(var(--primary), 0.2)" strokeWidth="0.5" strokeDasharray="2 4" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(var(--primary), 0.2)" strokeWidth="0.5" strokeDasharray="2 4" />
                    </svg>

                    {/* Data readouts */}
                    <div className="absolute top-4 right-4 bg-background/30 backdrop-blur-sm p-2 rounded border border-primary/30 font-mono text-xs animate-pulse">
                      <div className="text-primary">ANALYZING PHYSIQUE</div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-background/30 backdrop-blur-sm p-2 rounded border border-primary/30 font-mono text-xs">
                      <div className="text-primary mb-1">BODY METRICS:</div>
                      <div className="text-foreground/70">OPTIMIZING...</div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                {/* TERMINAL OVERLAY */}
                <TerminalOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-primary/10 rounded-full mb-4">
              <span className="text-primary font-mono text-sm">OUR TECHNOLOGY</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Advanced AI-Powered <span className="text-primary">Features</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our cutting-edge technology creates truly personalized fitness experiences that adapt to your unique body and goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background/50 backdrop-blur-sm p-8 rounded-lg border border-border relative group hover:border-primary/50 transition-colors">
              <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
              
              <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <BrainIcon className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Body Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your unique physique, metabolism, and genetic factors to create 
                truly personalized programs that maximize results
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background/50 backdrop-blur-sm p-8 rounded-lg border border-border relative group hover:border-primary/50 transition-colors">
              <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
              
              <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <DumbbellIcon className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dynamic Workouts</h3>
              <p className="text-muted-foreground">
                Intelligent workout plans that adapt to your progress, equipment availability, 
                and schedule for optimal fitness gains
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background/50 backdrop-blur-sm p-8 rounded-lg border border-border relative group hover:border-primary/50 transition-colors">
              <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
              
              <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <ActivityIcon className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Nutrition Science</h3>
              <p className="text-muted-foreground">
                Precision nutrition plans based on cutting-edge dietary science that align with 
                your taste preferences and lifestyle
              </p>
            </div>

            {/* Feature 4 - AI Sales Assistant */}
            <div className="bg-background/50 backdrop-blur-sm p-8 rounded-lg border border-border relative group hover:border-primary/50 transition-colors">
              <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
              
              <div className="size-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <HeartPulseIcon className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Personal Consultant</h3>
              <p className="text-muted-foreground">
                Chat with our AI fitness consultant to discover the perfect program for your goals
                and get personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Agent Section */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Fitness <span className="text-primary">Consultant</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chat with our AI consultant to discover the perfect fitness program for your goals.
              Get personalized recommendations and start your transformation journey today.
            </p>
          </div>
          <SalesAgent />
        </div>
      </section>

      {/* User Programs with enhanced styling */}
      <div className="relative z-10">
        <UserPrograms />
      </div>
      
      {/* Call to action */}
      <section className="relative z-10 py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative rounded-xl bg-gradient-to-br from-background to-background/80 border border-primary/20 p-12 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
              
              {/* Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24px,var(--border)_25px),linear-gradient(90deg,transparent_24px,var(--border)_25px)] bg-[size:25px_25px] opacity-[0.02]" />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your <span className="text-primary">fitness journey</span>?</h2>
                <p className="text-muted-foreground mb-6">
                  Join thousands of satisfied users who have achieved their fitness goals with our
                  AI-powered personalized programs.
                </p>
                
                {/* Social proof */}

                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">110+ users</span> activated their program this week
                  </p>
            
              </div>
              
              <Button
                size="lg"
                asChild
                className="overflow-hidden bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-7 text-lg font-medium group whitespace-nowrap"
              >
                <Link href={"/generate-program"} className="flex items-center font-mono">
                  Start Now
                  <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      
      {/* Add this to your global CSS for the vertical scan animation */}
      <style jsx global>{`
        @keyframes scan-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scan-vertical {
          animation: scan-vertical 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
