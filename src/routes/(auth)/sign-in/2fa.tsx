import { createFileRoute } from "@tanstack/react-router";
import { TwoFactor } from "@/features/auth/two-factor";
import { otpContext } from "@/features/auth/utils/otp-context";

export const Route = createFileRoute("/(auth)/sign-in/2fa")({
  beforeLoad: () => {
    otpContext.validate("otp:login-2fa", "sign_in_2fa", "/sign-in");
  },
  component: TwoFactor,
});
