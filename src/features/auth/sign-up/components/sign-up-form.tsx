import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useSignUpEmail } from "@/features/auth/hooks/use-auth-mutations";

const formSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.email({
      error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
    }),
    password: z.string().min(1, "Please enter your password").min(7, "Password must be at least 7 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  onSuccess: (email: string) => void;
}

export function SignUpForm({ className, onSuccess, ...props }: SignUpFormProps) {
  const signUp = useSignUpEmail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    signUp.mutate(
      { name: data.name, email: data.email, password: data.password, callbackURL: `${window.location.origin}/dashboard` },
      {
        onSuccess: () => {
          onSuccess(data.email);
        },
        onError: (error) => {
          const code = (error as { code?: string }).code;
          const msg = error.message || "";
          if (
            code === "USER_ALREADY_EXISTS" ||
            msg.toLowerCase().includes("already exists") ||
            msg.toLowerCase().includes("already registered")
          ) {
            toast.error("Account already registered. Please sign in to verify your email.");
          } else {
            toast.error(msg || "An error occurred during sign up.");
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-3", className)} {...props}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <FormItem>
              <FormLabel>Password</FormLabel>
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
        <Button className="mt-2" disabled={signUp.isPending}>
          {signUp.isPending && <Loader2 className="mr-2 animate-spin" />}
          Create Account
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
            className="w-full"
            type="button"
            disabled={signUp.isPending}
            onClick={() => {
              authClient.signIn.social({
                provider: "github",
                callbackURL: `${window.location.origin}/dashboard`,
              });
            }}
          >
            <IconGithub className="h-4 w-4" /> GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={signUp.isPending}
            onClick={() => {
              authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/dashboard`,
              });
            }}
          >
            <IconGoogle className="h-4 w-4" /> Google
          </Button>
        </div>
      </form>
    </Form>
  );
}
