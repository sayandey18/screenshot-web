import { createFileRoute } from "@tanstack/react-router";
import { otpContext } from "@/features/auth/utils/otp-context";
import { ResetPassword } from "@/features/auth/reset-password";

export const Route = createFileRoute("/(auth)/reset-password/")({
  beforeLoad: () => {
    otpContext.validate("otp:reset-password", "reset_password_set_password", "/forgot");
  },
  component: ResetPassword,
});
