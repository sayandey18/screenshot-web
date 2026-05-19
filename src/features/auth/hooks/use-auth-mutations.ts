import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { sessionKeys } from "@/hooks/api/query-keys";

export const useSignInEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
    },
  });
};

export const useSignUpEmail = () =>
  useMutation({
    mutationFn: async ({ name, email, password, callbackURL }: { name: string; email: string; password: string; callbackURL: string }) => {
      const result = await authClient.signUp.email({ name, email, password, callbackURL });
      if (result.error) throw result.error;
      return result;
    },
  });

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

export const useSendEmailVerificationOTP = () =>
  useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
      if (error) throw new Error(error.message);
    },
  });

export const useVerifyEmailOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
    },
  });
};

export const useSend2FAOTP = () =>
  useMutation({
    mutationFn: async () => {
      const { error } = await authClient.twoFactor.sendOtp();
      if (error) throw new Error(error.message);
    },
  });

export const useVerify2FAOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const { error } = await authClient.twoFactor.verifyOtp({ code });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
    },
  });
};

export const useSignOut = () =>
  useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message);
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { error } = await authClient.changePassword({ currentPassword, newPassword });
      if (error) throw new Error(error.message);
    },
  });
