import { type UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { type OtpFormValues } from "../hooks/use-otp-flow";

interface VerifyFormProps extends React.HTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<OtpFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onResend: () => void;
  isLoading: boolean;
  isResending: boolean;
  cooldown: number;
}

export function VerifyForm({
  form,
  onSubmit,
  onResend,
  isLoading,
  isResending,
  cooldown,
  className,
  ...props
}: VerifyFormProps) {
  const code = form.watch("code");

  return (
    <div className={cn("grid gap-3", className)}>
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-3" {...props}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} autoFocus {...field}>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="mt-2" disabled={code?.length < 6 || isLoading}>
            {isLoading && <Loader2 className="mr-2 animate-spin" />}
            Verify
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Haven&apos;t received it?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || cooldown > 0}
          className="underline underline-offset-4 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </p>
    </div>
  );
}
