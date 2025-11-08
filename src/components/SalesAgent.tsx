"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, ArrowRight } from "lucide-react";
import Link from 'next/link';
//
// NEW BUG FIX: Import useAction from convex/react and the new api
//
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';


// FIX #8 (Bug #8): Define a strong type for Message instead of 'any'
interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date; // Keep Date object for sorting, can be stringified for storage
  isTyping?: boolean;
  action?: 'generate_plan' | 'learn_more';
}

// FIX #8 (Bug #8): Define a type for the saved message format
interface SavedMessage {
  text: string;
  isUser: boolean;
  timestamp: string; // Store as ISO string
  isTyping?: boolean;
  action?: 'generate_plan' | 'learn_more';
}

const SalesAgent = () => {
  //
  // NEW BUG FIX: Get the server action from Convex
  //
  const getSalesResponse = useAction(api.chat.getSalesResponse);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  //
  // BUG FIX: Ref to track if component is mounted
  //
  const isMounted = useRef(true);

  // Initialize messages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('athonix_chat_history');
      if (saved) {
        // FIX #8 (Bug #8): Safely parse and validate the saved messages
        const parsed: SavedMessage[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects
          const loadedMessages = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(loadedMessages);
        }
      }
    } catch (err) {
      // FIX #15 (Bug #15): Use console.error for actual errors
      console.error('Failed to load saved chat history:', err);
      // If parsing fails, clear the saved value to avoid repeated errors
      try {
        localStorage.removeItem('athonix_chat_history');
      } catch {
        // ignore
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      // FIX #8 (Bug #8): Convert Date objects to strings for safe JSON storage
      const messagesToSave: SavedMessage[] = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      localStorage.setItem('athonix_chat_history', JSON.stringify(messagesToSave));
    }
  }, [messages]);

  // Load initial welcome message if no history exists
  useEffect(() => {
    //
    // BUG FIX: Set mounted ref to true
    //
    isMounted.current = true;

    if (messages.length === 0) {
      const loadWelcomeMessage = async () => {
      try {
        //
        // NEW BUG FIX: Call the real server action
        //
        const response = await getSalesResponse({ prompt: "Send a warm welcome message" });
        
        //
        // BUG FIX: Check if component is still mounted before setting state
        //
        if (isMounted.current) {
          // FIX #5 (Bug #5): Removed brittle regex
          setMessages([{
            text: response.text, 
            isUser: false,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        // FIX #15 (Bug #15): Use console.error
        console.error('Error loading welcome message:', error);
        
        //
        // BUG FIX: Check if component is still mounted before setting state
        //
        if (isMounted.current) {
          setMessages([{
            text: "Welcome to Athonix! 👋 I'm your personal fitness assistant. How can I help you today?",
            isUser: false,
            timestamp: new Date()
          }]);
        }
      }
      };
      loadWelcomeMessage();
    }
    
    //
    // BUG FIX: Cleanup function to set mounted ref to false
    //
    return () => {
      isMounted.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on init when messages are empty

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ss = window.speechSynthesis;
      const onVoicesChanged = () => setVoices(ss?.getVoices() ?? []);
      ss?.addEventListener('voiceschanged', onVoicesChanged);
      // Initialize voices
      setVoices(ss?.getVoices() ?? []);

      return () => {
        ss?.cancel();
        try {
          ss?.removeEventListener('voiceschanged', onVoicesChanged);
        } catch {
          // ignore
        }
      };
    }
    // nothing to clean up on server
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a message
  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    const ss = window.speechSynthesis;
    if (!ss) return;

    // Cancel any ongoing speech
    ss.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Find a male voice
    const maleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') || 
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('james')
    );
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    ss.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    const currentInput = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText("");

    // Show typing indicator
    const typingMessage: Message = {
      text: "...",
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    // Get response from Gemini
    try {
      //
      // NEW BUG FIX: Call the real server action with the user's prompt
      //
      const response = await getSalesResponse({ prompt: currentInput });
      
      // FIX #5 (Bug #5): Removed brittle regex
      const responseText = response.text;
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        const newMessage: Message = {
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          action: response.suggestPlan ? 'generate_plan' : undefined
        };
        return [...filtered, newMessage];
      });

      // Speak the response
      speak(responseText);
    } catch (error) {
      // FIX #15 (Bug #15): Use console.error
      console.error('Error getting sales response:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [...filtered, {
          text: "I apologize, but I'm having trouble processing your request. Could you please try again?",
          isUser: false,
          timestamp: new Date()
        }];
      });
    }
  };

  const ActionButton = ({ action }: { action: Message['action'] }) => {
    if (action === 'generate_plan') {
      return (
        <Button
          className="mt-2 w-full bg-primary hover:bg-primary/90"
          asChild
        >
          <Link href="/generate-program" className="flex items-center justify-center gap-2">
            Generate Your Custom Plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto bg-background/95 backdrop-blur-sm border-primary/20">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5">
        <div>
          <h2 className="text-xl font-semibold">Athonix Fitness Assistant</h2>
          <p className="text-sm text-muted-foreground">Your path to personalized fitness</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('athonix_chat_history');
                setMessages([]);
                if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
              }}
            >
              Clear Chat
            </Button>
          )}
          {isSpeaking && (
            <div className="text-sm text-primary animate-pulse">
              Speaking...
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            // FIX #8 (Bug #8): Use a more stable key than index
            key={message.timestamp.toISOString() + index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-[80%] p-3 rounded-lg ${message.isTyping ? 'animate-pulse' : ''} ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.isTyping ? (
                  <span className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </span>
                ) : (
                  message.text
                )}
              </div>
              {!message.isUser && message.action && (
                <ActionButton action={message.action} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SalesAgent;