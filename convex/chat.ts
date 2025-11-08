"use strict";
import { action } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v } from "convex/values";
import { z } from "zod";

// Validate env var
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Define schema for the AI's expected response
const salesResponseSchema = z.object({
  text: z.string(),
  suggestPlan: z.boolean(),
});
export type SalesResponse = z.infer<typeof salesResponseSchema>;

export const getSalesResponse = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_, args): Promise<SalesResponse> => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const fullPrompt = `You are a friendly and encouraging fitness sales assistant for a brand called "Athonix".
        Your goal is to be helpful and guide users to generate a fitness plan.
        - Be conversational and not overly robotic.
        - If the user asks about getting fit, losing weight, building muscle, or anything related to a plan, set "suggestPlan" to true.
        - If the user just says "hi" or asks a general question, keep "suggestPlan" as false.
        - Keep responses concise (2-3 sentences).

        User's last message: "${args.prompt}"

        Return your response in this exact JSON format:
        {"text": "Your response here", "suggestPlan": boolean}
        `;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();
      const responseJson = JSON.parse(responseText);

      // Validate the AI's response against our schema
      const validatedData = salesResponseSchema.parse(responseJson);
      return validatedData;
    } catch (error) {
      console.error("Error in getSalesResponse action:", error);

      // Fallback response in case of any error
      return {
        text: "I'm having a little trouble connecting right now. Please try again in a moment!",
        suggestPlan: false,
      };
    }
  },
});