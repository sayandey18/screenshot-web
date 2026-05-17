import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async ({ email, redirectTo }: { email: string; redirectTo: string }) => {
      const { error } = await authClient.requestPasswordReset({ email, redirectTo });
      if (error) throw new Error(error.message);
    },
  });

export const useRequestPasswordResetOTP = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authClient.emailOtp.requestPasswordReset({ email });
      if (error) throw new Error(error.message);
    },
  });

export const useCheckResetPasswordOTP = () =>
  useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { error } = await authClient.emailOtp.checkVerificationOtp({ email, otp, type: "forget-password" });
      if (error) throw new Error(error.message);
    },
  });

export const useResetPasswordWithOTP = () =>
  useMutation({
    mutationFn: async ({ email, otp, password }: { email: string; otp: string; password: string }) => {
      const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
      if (error) throw new Error(error.message);
    },
  });
