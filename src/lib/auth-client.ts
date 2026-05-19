import { apiKeyClient } from "@better-auth/api-key/client";
import {
  inferAdditionalFields,
  emailOTPClient,
  twoFactorClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    apiKeyClient(),
    emailOTPClient(),
    lastLoginMethodClient(),
    twoFactorClient(),
    inferAdditionalFields({
      user: {
        plan: { type: "string", required: false },
        company: { type: "string", required: false },
        bio: { type: "string", required: false },
      },
    }),
  ],
});
