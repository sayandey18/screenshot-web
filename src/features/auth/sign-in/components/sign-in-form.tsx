import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { IconFacebook, IconGithub } from "@/assets/brand-icons";
import { useAuthStore } from "@/stores/auth-store";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { otpContext } from "../../utils/otp-context";

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
  }),
  password: z.string().min(1, "Please enter your password").min(7, "Password must be at least 7 characters long"),
});

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
  onTwoFactorRequired: (email: string) => void;
}

export function SignInForm({ className, redirectTo, onTwoFactorRequired, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    await authClient.signIn.email(
      { email: data.email, password: data.password },
      {
        async onSuccess(ctx) {
          // Intercept unverified users after succeeding passwords and force them to verify
          if (ctx.data.user && !ctx.data.user.emailVerified) {
            setIsLoading(false);
            toast.error("Please verify your email to continue.");
            // Send OTP implicitly
            authClient.emailOtp.sendVerificationOtp({
              email: data.email,
              type: "email-verification",
            });
            // Configure route guard state
            otpContext.set("otp:signup", {
              intent: "sign_up_verify",
              email: data.email,
              redirect: redirectTo ?? "/",
            });
            // Go to verification route, which was explicitly mapped earlier!
            navigate({ to: "/sign-up/verify" });
            return;
          }

          if (ctx.data.twoFactorRedirect) {
            setIsLoading(false);
            // 2FA is enabled for this user — send OTP and show OTP step
            authClient.twoFactor.sendOtp();
            onTwoFactorRequired(data.email);
          } else {
            // No 2FA — session is active, navigate to destination
            try {
              await useAuthStore.getState().fetchSession();
              navigate({ to: redirectTo ?? "/", replace: true });
            } catch (_error) {
              setIsLoading(false);
              toast.error("Failed to initialize session. Please try again.");
            }
          }
        },
        onError(ctx) {
          setIsLoading(false);

          // Intercept unverified users blocked by the auth system itself (if requireEmailVerification is strict)
          if (ctx.error.code === "EMAIL_NOT_VERIFIED" || ctx.error.status === 403) {
            toast.error("Please verify your email to continue.");
            authClient.emailOtp.sendVerificationOtp({
              email: data.email,
              type: "email-verification",
            });
            otpContext.set("otp:signup", {
              intent: "sign_up_verify",
              email: data.email,
              redirect: redirectTo ?? "/",
            });
            navigate({ to: "/sign-up/verify" });
            return;
          }

          toast.error(ctx.error.message);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-3", className)} {...props}>
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot"
                className="absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconGithub className="h-4 w-4" /> GitHub
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconFacebook className="h-4 w-4" /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  );
}
