"use strict";
import { action } from "./_generated/server"; 
// FIX 1.2: Import supporting types
import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai"; 
import { v } from "convex/values";
import { z } from "zod";

// Validate env var
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Define schema for the AI's expected response
const nutritionInfoSchema = z.object({
  name: z.string(),
  //
  // BUG FIX: Use z.coerce.number() to be more robust against AI responses
  //
  calories: z.coerce.number(),
  protein: z.coerce.number(),
  carbs: z.coerce.number(),
  fat: z.coerce.number(),
  servingSize: z.string(),
  additionalInfo: z.array(z.string()).optional(),
});
export type NutritionInfo = z.infer<typeof nutritionInfoSchema>;

export const analyzeImage = action({
  args: {
    base64data: v.string(),
  },
  handler: async (_, args): Promise<NutritionInfo> => {
    try {
      const model = genAI.getGenerativeModel({
        //
        // BUG FIX: Replaced invalid model name
        //
        model: "gemini-1.5-flash-latest", 
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `Please analyze this food image and provide detailed nutritional information. Return the data in this exact JSON format: {"name": "Food Name", "calories": number, "protein": number in grams, "carbs": number in grams, "fat": number in grams, "servingSize": "standard serving size", "additionalInfo": ["any special notes"]}`;

      // FIX 1.2: Correctly shape the request payload
      // The API expects 'parts' to be an array of 'Part' objects
      const parts: Part[] = [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: args.base64data,
          },
        },
      ];
      
      // FIX 1.2: Wrap the parts in a 'Content' object with a 'role'
      const request = {
        contents: [{ role: "user", parts }],
      };

      const result = await model.generateContent(request);
      const responseText = result.response.text();
      const responseJson = JSON.parse(responseText);

      // Validate the AI's response against our schema
      const validatedData = nutritionInfoSchema.parse(responseJson);
      return validatedData;

    } catch (error) {
      console.error("Error analyzing food in Convex action:", error);
      
      // FIX 1.3: Safely handle the 'unknown' error type
      let errorMessage = "Failed to analyze the food";
      if (error instanceof z.ZodError) {
        errorMessage = `AI returned invalid data: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },
});