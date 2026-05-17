import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/password-input";
import { useResetPasswordWithOTP } from "@/features/auth/hooks/use-auth-mutations";
import { otpContext } from "@/features/auth/utils/otp-context";

const formSchema = z
  .object({
    password: z.string().min(7, "Password must be at least 7 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate();
  const resetPassword = useResetPasswordWithOTP();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const ctx = otpContext.get("otp:reset-password");
    if (!ctx?.email || !ctx?.otp) {
      toast.error("Session expired. Please try again.");
      navigate({ to: "/forgot" });
      return;
    }

    resetPassword.mutate(
      { email: ctx.email, otp: ctx.otp, password: data.password },
      {
        onSuccess: () => {
          otpContext.clear("otp:reset-password");
          toast.success("Password has been reset successfully. Please sign in.");
          navigate({ to: "/sign-in" });
        },
        onError: (error) => {
          toast.error(error.message || "Failed to reset password.");
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-2", className)} {...props}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={resetPassword.isPending}>
          Reset Password
          {resetPassword.isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  );
}
