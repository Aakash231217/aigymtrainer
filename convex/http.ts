import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v } from "convex/values";
import { z } from "zod"; // Using zod for robust validation

// FIX #3 (Bug #3): Validate env var at startup
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(geminiApiKey);

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const body = await request.text();
    const payload = JSON.parse(body);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } = evt.data;

      const email = email_addresses[0].email_address;

      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        // FIX #11 (Bug #11): Replaced console.log with console.error for actual errors
        console.error("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        // FIX #11 (Bug #11): Replaced console.log with console.error
        console.error("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

// FIX #6 & #7 (Bugs #6, #7): Define Zod schemas for validation (replaces 'any')
const workoutRoutineSchema = z.object({
  name: z.string(),
  sets: z.coerce.number().int().positive().default(1),
  reps: z.coerce.number().int().positive().default(10),
});

const exerciseDaySchema = z.object({
  day: z.string(),
  routines: z.array(workoutRoutineSchema),
});

const workoutPlanSchema = z.object({
  schedule: z.array(z.string()),
  exercises: z.array(exerciseDaySchema),
});

const dietMealSchema = z.object({
  name: z.string(),
  foods: z.array(z.string()),
});

const dietPlanSchema = z.object({
  dailyCalories: z.coerce.number().int().positive(),
  meals: z.array(dietMealSchema),
});


// FIX #6 & #7 (Bugs #6, #7): Replaced 'validateWorkoutPlan' with Zod parsing.
// This is much safer than the 'any' type and manual parsing.
function parseWorkoutPlan(plan: unknown): z.infer<typeof workoutPlanSchema> {
  return workoutPlanSchema.parse(plan);
}

// FIX #6 & #7 (Bugs #6, #7): Replaced 'validateDietPlan' with Zod parsing.
function parseDietPlan(plan: unknown): z.infer<typeof dietPlanSchema> {
  return dietPlanSchema.parse(plan);
}


http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      const {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      } = payload;

      // FIX #11 (Bug #11): Removed noisy console.log of the payload
      // console.log("Payload is here:", payload);

      const model = genAI.getGenerativeModel({
        //
        // NEW BUG FIX: Replaced invalid model name
        //
        model: "gemini-1.5-flash-latest",
        generationConfig: {
          temperature: 0.4, 
          topP: 0.9,
          responseMimeType: "application/json",
        },
      });

      const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const workoutResult = await model.generateContent(workoutPrompt);
      const workoutPlanText = workoutResult.response.text();

      // FIX #6 (Bug #6): Use safe Zod parsing instead of 'any'
      const workoutPlanJson = JSON.parse(workoutPlanText);
      const workoutPlan = parseWorkoutPlan(workoutPlanJson);

      const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const dietResult = await model.generateContent(dietPrompt);
      const dietPlanText = dietResult.response.text();

      // FIX #6 (Bug #6): Use safe Zod parsing instead of 'any'
      const dietPlanJson = JSON.parse(dietPlanText);
      const dietPlan = parseDietPlan(dietPlanJson);

      // save to our DB: CONVEX
      const planId = await ctx.runMutation(api.plans.createPlan, {
        userId: user_id,
        dietPlan,
        isActive: true,
        workoutPlan,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;