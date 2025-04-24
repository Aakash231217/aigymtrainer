import { v } from "convex/values";

export default {
  providers: [
    {
      domain: "https://safe-hippo-82.clerk.accounts.dev",
      applicationID: "convex",
      jwtTemplate: {
        convex: {
          issuer: "clerk",
          audience: "convex",
        }
      },
    },
  ],
};
