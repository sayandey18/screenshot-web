import { createFileRoute } from "@tanstack/react-router";
import { otpContext } from "@/features/auth/utils/otp-context";
import { ResetPasswordOTP } from "@/features/auth/forgot/components/reset-otp-form";

export const Route = createFileRoute("/(auth)/forgot/verify")({
  beforeLoad: () => {
    otpContext.validate("otp:reset-password", "reset_password_verify", "/forgot");
  },
  component: ResetPasswordOTP,
});
