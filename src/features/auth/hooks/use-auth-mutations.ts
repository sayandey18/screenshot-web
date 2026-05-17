import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async ({ email, redirectTo }: { email: string; redirectTo: string }) => {
      const { error } = await authClient.requestPasswordReset({ email, redirectTo });
      if (error) throw new Error(error.message);
    },
  });
