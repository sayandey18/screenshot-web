import { createFileRoute } from "@tanstack/react-router";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/(public)/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Landing Page</h1>
      <p className="text-muted-foreground">Under construction</p>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
