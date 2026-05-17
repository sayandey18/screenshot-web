import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { Badge } from "@/components/ui/badge";
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
  const queryClient = useQueryClient();
  const lastLoginMethod = authClient.getLastUsedLoginMethod();

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
          if (ctx.data.user && !ctx.data.user.emailVerified) {
            setIsLoading(false);
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

          if (ctx.data.twoFactorRedirect) {
            setIsLoading(false);
            authClient.twoFactor.sendOtp();
            onTwoFactorRequired(data.email);
          } else {
            try {
              await queryClient.invalidateQueries({ queryKey: sessionQueryOptions().queryKey });
              await queryClient.ensureQueryData(sessionQueryOptions());
              navigate({ to: redirectTo ?? "/", replace: true });
            } catch (_error) {
              setIsLoading(false);
              toast.error("Failed to initialize session. Please try again.");
            }
          }
        },
        onError(ctx) {
          setIsLoading(false);

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
        <Button className="relative mt-2" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Sign in
          {lastLoginMethod === "email" && (
            <Badge className="absolute -top-2 -right-2 h-4 border-none bg-zinc-800 px-1 text-[10px] tracking-wider text-white uppercase shadow-sm transition-transform group-hover:scale-105">
              Last used
            </Badge>
          )}
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
          <Button
            variant="outline"
            type="button"
            className="group relative"
            disabled={isLoading}
            onClick={() => {
              authClient.signIn.social({
                provider: "github",
                callbackURL: `${window.location.origin}/dashboard`,
              });
            }}
          >
            <IconGithub className="h-4 w-4" /> GitHub
            {lastLoginMethod === "github" && (
              <Badge className="absolute -top-2 -right-2 h-4 border-none bg-zinc-800 px-1 text-[10px] tracking-wider text-white uppercase shadow-sm transition-transform group-hover:scale-105">
                Last used
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            className="group relative"
            disabled={isLoading}
            onClick={() => {
              authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/dashboard`,
              });
            }}
          >
            <IconGoogle className="h-4 w-4" /> Google
            {lastLoginMethod === "google" && (
              <Badge className="absolute -top-2 -right-2 h-4 border-none bg-zinc-800 px-1 text-[10px] tracking-wider text-white uppercase shadow-sm transition-transform group-hover:scale-105">
                Last used
              </Badge>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
