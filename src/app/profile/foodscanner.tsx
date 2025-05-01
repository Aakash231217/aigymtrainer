"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, XIcon, ArrowRightIcon, LoaderIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CornerElements from "@/components/CornerElements";

// Environment variables would be used in a real implementation
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";

interface NutritionInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  additionalInfo?: string[];
}

const FoodScanner = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when the camera is activated
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else if (streamRef.current) {
      stopCamera();
    }
    
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment", // Use the back camera if available
          width: { ideal: 720 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please check permissions and try again.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and store it
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        setIsCameraActive(false);
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setNutritionInfo(null);
    setIsCameraActive(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCapturedImage(null);
    setNutritionInfo(null);
    setError(null);
    if (streamRef.current) {
      stopCamera();
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    if (!GEMINI_API_KEY) {
      setError("API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        
        if (!base64data) {
          throw new Error("Failed to convert image");
        }
        
        // Prepare request to Google Gemini API
        const requestData = {
          contents: [
            {
              parts: [
                {
                  text: "Please analyze this food image and provide detailed nutritional information. Return the data in this exact JSON format: {\"name\": \"Food Name\", \"calories\": number, \"protein\": number in grams, \"carbs\": number in grams, \"fat\": number in grams, \"servingSize\": \"standard serving size\", \"additionalInfo\": [\"any special notes\"]}"
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64data
                  }
                }
              ]
            }
          ]
        };
        
        // Send request to Gemini API
        const apiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestData)
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API error: ${apiResponse.status}`);
        }
        
        const apiData = await apiResponse.json();
        const responseText = apiData.candidates[0]?.content?.parts[0]?.text;
        
        if (!responseText) {
          throw new Error("No response from API");
        }
        
        // Extract JSON from response (Gemini might wrap it in markdown code blocks)
        const jsonMatch = responseText.match(/```json\s*({[\s\S]*?})\s*```/) || 
                          responseText.match(/{[\s\S]*?}/);
                          
        if (!jsonMatch) {
          throw new Error("Could not extract JSON from response");
        }
        
        // Parse the nutrition data
        const nutritionData: NutritionInfo = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        setNutritionInfo(nutritionData);
        
      };
    } catch (err) {
      console.error("Error analyzing food:", err);
      setError("Failed to analyze the food. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => {
          setIsDialogOpen(true);
          setIsCameraActive(true);
        }}
        className="flex items-center gap-2 bg-primary hover:bg-primary/80"
      >
        <CameraIcon size={16} />
        Scan Food
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Food Scanner</DialogTitle>
          </DialogHeader>
          
          <div className="relative border border-border p-4 rounded-lg">
            <CornerElements />
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="aspect-square bg-black/90 rounded-md overflow-hidden relative">
              {isCameraActive && (
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Captured food" 
                  className="w-full h-full object-cover"
                />
              )}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                  <LoaderIcon className="h-12 w-12 animate-spin mb-2" />
                  <p className="text-sm">Analyzing food...</p>
                </div>
              )}
            </div>
            
            {/* Camera controls */}
            <div className="flex justify-center mt-4 gap-2">
              {isCameraActive && (
                <Button onClick={captureImage} className="bg-primary hover:bg-primary/80">
                  Capture
                </Button>
              )}
              
              {capturedImage && !nutritionInfo && !isAnalyzing && (
                <>
                  <Button onClick={resetCapture} variant="outline">
                    <XIcon className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  
                  <Button onClick={analyzeImage} className="bg-primary hover:bg-primary/80">
                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </>
              )}
              
              {nutritionInfo && (
                <Button onClick={resetCapture} variant="outline">
                  Scan Another
                </Button>
              )}
            </div>
            
            {/* Nutrition information display */}
            {nutritionInfo && (
              <div className="mt-6 p-4 border border-primary/30 bg-primary/5 rounded-lg space-y-3">
                <h3 className="text-lg font-bold text-primary text-center">
                  {nutritionInfo.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center p-2 bg-background/50 border border-border rounded">
                    <span className="text-sm text-muted-foreground">Calories</span>
                    <span className="text-lg font-bold">{nutritionInfo.calories}</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 bg-background/50 border border-border rounded">
                    <span className="text-sm text-muted-foreground">Serving</span>
                    <span className="text-sm font-medium">{nutritionInfo.servingSize}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-background/50 border border-border rounded">
                    <span className="text-xs text-muted-foreground">Protein</span>
                    <span className="text-lg font-mono">{nutritionInfo.protein}g</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 bg-background/50 border border-border rounded">
                    <span className="text-xs text-muted-foreground">Carbs</span>
                    <span className="text-lg font-mono">{nutritionInfo.carbs}g</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 bg-background/50 border border-border rounded">
                    <span className="text-xs text-muted-foreground">Fat</span>
                    <span className="text-lg font-mono">{nutritionInfo.fat}g</span>
                  </div>
                </div>
                
                {nutritionInfo.additionalInfo && nutritionInfo.additionalInfo.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs text-muted-foreground mb-1">Additional Information</h4>
                    <ul className="text-sm space-y-1">
                      {nutritionInfo.additionalInfo.map((info, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary text-xs">•</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FoodScanner;