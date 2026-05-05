import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyForm } from "@/features/auth/components/verify-form";
import { useOtpFlow } from "@/features/auth/hooks/use-otp-flow";
import { otpContext } from "@/features/auth/utils/otp-context";

export function TwoFactor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ctx = otpContext.get("otp:login-2fa");
  const email = ctx?.email || "";

  const baseFlow = useOtpFlow({
    onVerify: async (code) => {
      const { error } = await authClient.twoFactor.verifyOtp({ code });
      if (!error) {
        try {
          await queryClient.invalidateQueries({ queryKey: sessionQueryOptions().queryKey });
          await queryClient.ensureQueryData(sessionQueryOptions());
          const destination = otpContext.handleSuccess("otp:login-2fa", "/");
          router.navigate({ to: destination, replace: true });
        } catch (_e) {
          return { error: { message: "Failed to initialize session." } };
        }
      }
      return { error };
    },
    onResend: async () => {
      return await authClient.twoFactor.sendOtp();
    },
    cooldownDuration: 60,
  });

  return (
    <AuthLayout
      title="Two-factor authentication"
      description={`Enter the 6-digit code we sent to <span className="font-medium text-foreground">${email}</span>`}
    >
      <VerifyForm {...baseFlow} />
    </AuthLayout>
  );
}
