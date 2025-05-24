import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface SalesResponse {
  text: string;
  suggestPlan: boolean;
}

// Create a sales agent model with appropriate context
export async function getSalesResponse(userMessage: string): Promise<SalesResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a fitness assistant for Athonix, an AI-powered fitness platform certified by Oxford nutritionists OHSC. Our key features:
      - Personalized workout plans
      - AI-driven nutrition guidance
      - Progress tracking
      - Dynamic plan adjustments

      Respond to this message: ${userMessage}

      Instructions:
      1. Be friendly and professional
      2. If they mention muscle gain, weight loss, or any fitness goal, suggest a personalized plan
      3. Keep responses concise (2-3 sentences)
      4. Focus on understanding their needs
      5. DO NOT include any JSON syntax in your response
      6. DO NOT prefix your response with any special characters or formatting

      Just provide a natural, conversational response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Check if the message contains keywords that suggest offering a plan
    const text = response.text();
    const suggestPlan = /weight|muscle|strength|fit|health|workout|exercise|train/i.test(userMessage);
    
    return {
      text,
      suggestPlan
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Return a fallback response if the API fails
    return {
      text: "I'd be happy to help you explore our fitness solutions at Athonix. What specific health or fitness goals are you looking to achieve?",
      suggestPlan: false
    };
  }
}
