import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyForm } from "@/features/auth/components/verify-form";
import { useOtpFlow } from "@/features/auth/hooks/use-otp-flow";
import { otpContext } from "@/features/auth/utils/otp-context";

export function VerifyEmail() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const ctx = otpContext.get("otp:signup");
  const email = ctx?.email || "";

  const baseFlow = useOtpFlow({
    onVerify: async (code) => {
      const { error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });
      if (!error) {
        await queryClient.invalidateQueries({ queryKey: sessionQueryOptions().queryKey });
        await queryClient.refetchQueries({ queryKey: sessionQueryOptions().queryKey });
        const destination = otpContext.handleSuccess("otp:signup", "/dashboard");
        router.navigate({ to: destination, replace: true });
      }
      return { error };
    },
    onResend: async () => {
      return await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
    },
    cooldownDuration: 60,
  });

  return (
    <AuthLayout
      title="Verify your email"
      description={
        <>
          Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>
        </>
      }
    >
      <VerifyForm {...baseFlow} />
    </AuthLayout>
  );
}
