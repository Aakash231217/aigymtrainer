"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// FIX: Import convex hooks for polling
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const GenerateProgramPage = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  const { user, isLoaded } = useUser();
  const router = useRouter();

  // FIX: Poll for user plans to detect when the new plan is created
  const userId = user?.id;
  const userPlans = useQuery(api.plans.getUserPlans, userId ? { userId } : "skip");
  const initialPlansCountRef = useRef<number | null>(null);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // FIX: Capture initial plan count
  useEffect(() => {
    if (isLoaded && userPlans && initialPlansCountRef.current === null) {
      initialPlansCountRef.current = userPlans.length;
    }
  }, [userPlans, isLoaded]);

  // auto-scroll messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // FIX: Robust redirection logic
  useEffect(() => {
    if (callEnded) {
      // Fallback timeout in case polling takes too long (5 seconds)
      const fallbackTimer = setTimeout(() => {
         router.push("/profile");
      }, 5000);

      // Check if a new plan has appeared
      if (userPlans && initialPlansCountRef.current !== null) {
        if (userPlans.length > initialPlansCountRef.current) {
          clearTimeout(fallbackTimer);
          router.push("/profile");
        }
      }

      return () => clearTimeout(fallbackTimer);
    }
  }, [callEnded, userPlans, router]);

  // setup event listeners for vapi
  useEffect(() => {
    const handleCallStart = () => {
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    const handleCallEnd = () => {
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };
    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = () => {
      setConnecting(false);
      setCallActive(false);
    };

    try {
      vapi
        .on("call-start", handleCallStart)
        .on("call-end", handleCallEnd)
        .on("speech-start", handleSpeechStart)
        .on("speech-end", handleSpeechEnd)
        .on("message", handleMessage)
        .on("error", handleError);
    } catch (error) {
      console.error("Error initializing Vapi event listeners:", error);
    }


    return () => {
      try {
        vapi
          .off("call-start", handleCallStart)
          .off("call-end", handleCallEnd)
          .off("speech-start", handleSpeechStart)
          .off("speech-end", handleSpeechEnd)
          .off("message", handleMessage)
          .off("error", handleError);
      } catch (error) {
        console.error("Error cleaning up Vapi event listeners:", error);
      }
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
      return;
    }

    const vapiWorkflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
    if (!vapiWorkflowId) {
      console.error("Vapi Workflow ID is not set in environment variables.");
      setConnecting(false);
      return;
    }

    try {
      setConnecting(true);
      setMessages([]);
      setCallEnded(false);
      
      // Reset plan count reference when starting a new call
      if (userPlans) {
        initialPlansCountRef.current = userPlans.length;
      }

      const fullName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "There";

      await vapi.start(vapiWorkflowId, {
        variableValues: {
          full_name: fullName,
          user_id: user?.id,
        },
      });
    } catch (error) {
      console.log("Failed to start call", error);
      setConnecting(false);
    }
  };

  const userName = user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest";

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your personalized plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">Athonix AI</h2>
              <p className="text-sm text-muted-foreground mt-1">Fitness & Diet Coach</p>

              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                  isSpeaking ? "border-primary" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                  }`}
                />

                <span className="text-xs text-muted-foreground">
                  {isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                        ? "Generating your plan..."
                        : "Waiting..."}
                </span>
              </div>
            </div>
          </Card>

          <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              <div className="relative size-32 mb-4">
                {isLoaded && user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="User"
                    className="size-full object-cover rounded-full"
                  />
                ) : (
                  <div className="size-full rounded-full bg-card border border-border flex items-center justify-center">
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLoaded ? userName : "Loading..."}
              </p>

              <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
                <div className={`w-2 h-2 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-muted'}`} />
                <span className="text-xs text-muted-foreground">
                  {isLoaded ? "Ready" : "Loading..."}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {messages.length > 0 && (
          <div
            ref={messageContainerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
          >
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-1">
                    {msg.role === "assistant" ? "Athonix AI" : "You"}:
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-1">System:</div>
                  <p className="text-foreground">
                    Call ended. Analyzing data and generating your custom program...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex justify-center gap-4">
          <Button
            className={`w-40 text-xl rounded-3xl ${
              callActive
                ? "bg-destructive hover:bg-destructive/90"
                : callEnded
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
            } text-white relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded || !isLoaded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
            )}

            <span>
              {!isLoaded ? "Loading..." :
                callActive
                ? "End Call"
                : connecting
                  ? "Connecting..."
                  : callEnded
                    ? "Creating..."
                    : "Start Call"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default GenerateProgramPage;