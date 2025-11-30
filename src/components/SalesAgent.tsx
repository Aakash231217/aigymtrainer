import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { getSalesResponse } from '@/lib/gemini';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  action?: 'generate_plan' | 'learn_more';
}

const SalesAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize messages from localStorage
  useEffect(() => {
    const isClient = typeof window !== 'undefined';
if (isClient) {
      const saved = localStorage.getItem('athonix_chat_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          const restored = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(restored);
        } catch (e) {
          setMessages([]);
        }
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Convert Date objects to ISO strings for storage
      const serializable = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : (typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toISOString())
      }));
      localStorage.setItem('athonix_chat_history', JSON.stringify(serializable));
    }
  }, [messages]);

  // Load initial welcome message if no history exists
  useEffect(() => {
    if (messages.length === 0) {
      const loadWelcomeMessage = async () => {
      try {
        const response = await getSalesResponse("Send a warm welcome message");
        setMessages([{
          text: response.text.replace(/^json\s*\{.*?\}\s*$/i, ''), // Remove any JSON wrapper
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Error loading welcome message:', error);
        setMessages([{
          text: "Welcome to Athonix! 👋 I'm your personal fitness assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date()
        }]);
      }
      };
      loadWelcomeMessage();
    }
  }, [messages.length]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis?.addEventListener('voiceschanged', () => {
        setVoices(speechSynthesis?.getVoices() ?? []);
      });
      // Initialize voices
      setVoices(speechSynthesis?.getVoices() ?? []);
    }
    return () => {
      if (typeof window !== 'undefined') {
        speechSynthesis?.cancel();
      }
    };
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
    if (!speechSynthesis) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

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

    speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
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
      const response = await getSalesResponse(inputText);
      
      // Remove typing indicator and add response
      const responseText = response.text.replace(/^json\s*\{.*?\}\s*$/i, '');
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
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('athonix_chat_history');
                }
                setMessages([]);
                speechSynthesis?.cancel();
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
            key={index}
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
