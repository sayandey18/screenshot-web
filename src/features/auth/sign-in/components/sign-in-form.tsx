import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useSend2FAOTP, useSignInEmail } from "@/features/auth/hooks/use-auth-mutations";
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
  const navigate = useNavigate();
  const lastLoginMethod = authClient.getLastUsedLoginMethod();
  const signIn = useSignInEmail();
  const send2FAOTP = useSend2FAOTP();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleEmailNotVerified(email: string) {
    toast.error("Please verify your email to continue.");
    authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    otpContext.set("otp:signup", {
      intent: "sign_up_verify",
      email,
      redirect: redirectTo ?? "/",
    });
    navigate({ to: "/sign-up/verify" });
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    signIn.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (result) => {
          if (result.data.user && !result.data.user.emailVerified) {
            handleEmailNotVerified(data.email);
            return;
          }

          if ("twoFactorRedirect" in result.data && result.data.twoFactorRedirect) {
            send2FAOTP.mutate(undefined, {
              onSuccess: () => {
                onTwoFactorRequired(data.email);
              },
              onError: () => {
                toast.error("Failed to send verification code. Please try again.");
              },
            });
          } else {
            navigate({ to: redirectTo ?? "/", replace: true });
          }
        },
        onError: (error) => {
          const code = (error as { code?: string }).code;
          const status = (error as { status?: number }).status;
          const message = error.message;
          if (code === "EMAIL_NOT_VERIFIED" || status === 403) {
            handleEmailNotVerified(data.email);
            return;
          }

          toast.error(message);
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
        <Button className="relative mt-2" disabled={signIn.isPending} aria-busy={signIn.isPending}>
          {signIn.isPending && <Loader2 className="animate-spin" />}
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
            disabled={signIn.isPending}
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
            disabled={signIn.isPending}
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
