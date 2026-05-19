import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordOTP } from "@/features/auth/forgot/components/reset-otp-form";
import { otpContext } from "@/features/auth/utils/otp-context";

export const Route = createFileRoute("/(auth)/forgot/verify")({
  beforeLoad: () => {
    otpContext.validate("otp:reset-password", "reset_password_verify", "/forgot");
  },
  component: ResetPasswordOTP,
});
