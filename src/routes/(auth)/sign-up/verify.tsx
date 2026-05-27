import { createFileRoute } from "@tanstack/react-router";
import { otpContext } from "@/features/auth/utils/otp-context";
import { VerifyEmail } from "@/features/auth/verify";

export const Route = createFileRoute("/(auth)/sign-up/verify")({
  beforeLoad: () => {
    otpContext.validate("otp:signup", "sign_up_verify", "/sign-up");
  },
  component: VerifyEmail,
});
