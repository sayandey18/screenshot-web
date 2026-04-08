import { createAuthClient } from "better-auth/react"
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:4000",
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        emailOTPClient(),
        twoFactorClient(),
    ],
})
