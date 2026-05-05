import { apiKeyClient } from "@better-auth/api-key/client";
import { inferAdditionalFields, emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    apiKeyClient(),
    emailOTPClient(),
    twoFactorClient(),
    inferAdditionalFields({
      user: {
        plan: { type: "string" },
        company: { type: "string" },
        bio: { type: "string" },
      },
    }),
  ],
});
