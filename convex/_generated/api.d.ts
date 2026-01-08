/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as diet from "../diet.js";
import type * as dietManagement from "../dietManagement.js";
import type * as fitnessTracking from "../fitnessTracking.js";
import type * as gamification from "../gamification.js";
import type * as http from "../http.js";
import type * as mentalHealth from "../mentalHealth.js";
import type * as ordering from "../ordering.js";
import type * as plans from "../plans.js";
import type * as supplements from "../supplements.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";
import type * as workoutManagement from "../workoutManagement.js";
import type * as workouts from "../workouts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  diet: typeof diet;
  dietManagement: typeof dietManagement;
  fitnessTracking: typeof fitnessTracking;
  gamification: typeof gamification;
  http: typeof http;
  mentalHealth: typeof mentalHealth;
  ordering: typeof ordering;
  plans: typeof plans;
  supplements: typeof supplements;
  userProfiles: typeof userProfiles;
  users: typeof users;
  workoutManagement: typeof workoutManagement;
  workouts: typeof workouts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
