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
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
    
    // Check for API key first
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
      
      // Use Promise to handle the FileReader asynchronously
      const base64data = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) {
            resolve(base64);
          } else {
            reject(new Error("Failed to convert image to base64"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      
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
      
      // Check for API errors and get detailed error message if possible
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => null);
        console.error("API Error Response:", errorData);
        throw new Error(
          `API error (${apiResponse.status}): ${errorData?.error?.message || apiResponse.statusText}`
        );
      }
      
      const apiData = await apiResponse.json();
      console.log("API Response:", apiData); // Helpful for debugging
      
      // Check for missing data in the response
      if (!apiData.candidates || !apiData.candidates[0]?.content?.parts) {
        throw new Error("Invalid response format from API");
      }
      
      const responseText = apiData.candidates[0].content.parts[0]?.text;
      
      if (!responseText) {
        throw new Error("No text content in API response");
      }
      
      // Log the full response text for debugging
      console.log("Response Text:", responseText);
      
      // Extract JSON from response (handling different formats)
      let nutritionData: NutritionInfo;
      
      try {
        // First try finding JSON within markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                         responseText.match(/{[\s\S]*?}/);
        
        if (!jsonMatch) {
          throw new Error("Could not extract JSON from response");
        }
        
        const jsonString = jsonMatch[1] || jsonMatch[0];
        console.log("Extracted JSON:", jsonString);
        
        try {
          // Try to parse the extracted JSON
          nutritionData = JSON.parse(jsonString);
        } catch (jsonMatch) {
          // If parsing fails, try to clean up the JSON string
          const cleanedJson = jsonString
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\/g, '\\');
          
          nutritionData = JSON.parse(cleanedJson);
        }
        
        // Validate the parsed nutrition data has required fields
        if (!nutritionData.name || 
            nutritionData.calories === undefined || 
            nutritionData.protein === undefined || 
            nutritionData.carbs === undefined || 
            nutritionData.fat === undefined) {
          throw new Error("Invalid nutrition data format");
        }
        
        setNutritionInfo(nutritionData);
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        // As a fallback, try to extract data from the text if JSON parsing fails
        throw new Error(
          `Failed to parse nutrition data: ${
            jsonError instanceof Error ? jsonError.message : String(jsonError)
          }`
        );
      }
    } catch (err) {
      console.error("Error analyzing food:", err);
      setError(
        `Failed to analyze the food: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
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