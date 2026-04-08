import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export const otpFormSchema = z.object({
  code: z.string().min(6, "Please enter the 6-digit code.").max(6),
});

export type OtpFormValues = z.infer<typeof otpFormSchema>;

interface UseOtpFlowProps {
  onVerify: (code: string) => Promise<{ error?: any }>;
  onResend: () => Promise<{ error?: any }>;
  cooldownDuration?: number;
}

export function useOtpFlow({ onVerify, onResend, cooldownDuration = 60 }: UseOtpFlowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(cooldownDuration);
  const [lastSubmittedCode, setLastSubmittedCode] = useState<string | null>(null);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: "" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const code = form.watch("code");

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    const { error } = await onResend();
    setIsResending(false);
    if (error) {
      toast.error(error.message || "Failed to resend code");
    } else {
      toast.success("Verification code resent!");
      setCooldown(cooldownDuration);
    }
  }, [cooldown, cooldownDuration, onResend]);

  const onSubmit = useCallback(
    async (data: OtpFormValues) => {
      setIsLoading(true);
      setLastSubmittedCode(data.code);
      const { error } = await onVerify(data.code);

      if (error) {
        form.setValue("code", ""); // Clear the OTP to explicitly prevent loop and improve retry UX
        form.setError("code", { message: error.message || "Invalid verification code" });
        setIsLoading(false);
      } else {
        // Success handled by caller navigating
        setIsLoading(false);
      }
    },
    [onVerify, form]
  );

  // Auto-submit when length === 6
  useEffect(() => {
    if (code.length === 6 && !form.formState.isSubmitting && !isLoading && code !== lastSubmittedCode) {
      form.handleSubmit(onSubmit)();
    }
  }, [code, form, onSubmit, isLoading, lastSubmittedCode]);

  return {
    form,
    isLoading,
    isResending,
    cooldown,
    onResend: handleResend,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
