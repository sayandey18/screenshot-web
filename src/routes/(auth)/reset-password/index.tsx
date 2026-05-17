import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/password-input";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z
  .object({
    password: z.string().min(7, "Password must be at least 7 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
    });
    setIsLoading(false);
    if (error) {
      toast.error(error.message || "Failed to reset password.");
      return;
    }
    toast.success("Password has been reset successfully. Please sign in.");
    navigate({ to: "/sign-in" });
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Reset Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-2")}>
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
              <Button className="mt-2" disabled={isLoading}>
                Reset Password
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="mx-auto px-8 text-center text-sm text-balance text-muted-foreground">
            Remember your password?{" "}
            <Link to="/sign-in" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/(auth)/reset-password/")({
  component: ResetPasswordForm,
});
