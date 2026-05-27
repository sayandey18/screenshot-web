import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRequestPasswordResetOTP } from "@/features/auth/hooks/use-auth-mutations";
import { otpContext } from "@/features/auth/utils/otp-context";

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
  }),
});

export function ForgotPasswordForm({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate();
  const requestOTP = useRequestPasswordResetOTP();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    requestOTP.mutate(data.email, {
      onSuccess: () => {
        otpContext.set("otp:reset-password", {
          email: data.email,
          intent: "reset_password_verify",
          redirect: "/dashboard",
        });
        toast.success(`Verification code sent to ${data.email}`);
        form.reset();
        navigate({ to: "/forgot/verify" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send verification code.");
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-2", className)} {...props}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={requestOTP.isPending} aria-busy={requestOTP.isPending}>
          Continue
          {requestOTP.isPending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  );
}
