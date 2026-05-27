import { useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { VerifyForm } from "@/features/auth/components/verify-form";
import { useOtpFlow } from "@/features/auth/hooks/use-otp-flow";
import { otpContext } from "@/features/auth/utils/otp-context";

export function ResetPasswordOTP() {
  const router = useRouter();
  const ctx = otpContext.get("otp:reset-password");
  const email = ctx?.email || "";

  const baseFlow = useOtpFlow({
    onVerify: async (code) => {
      const { error } = await authClient.emailOtp.checkVerificationOtp({ email, otp: code, type: "forget-password" });
      if (!error) {
        otpContext.set("otp:reset-password", {
          email,
          otp: code,
          intent: "reset_password_set_password",
          redirect: ctx?.redirect || "/dashboard",
        });
        router.navigate({ to: "/reset-password", replace: true });
      }
      return { error };
    },
    onResend: async () => {
      return await authClient.emailOtp.requestPasswordReset({ email });
    },
    cooldownDuration: 60,
  });

  return (
    <AuthLayout
      title="Reset Password"
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
