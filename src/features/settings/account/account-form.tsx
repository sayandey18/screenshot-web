import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/api/use-accounts";
import { useSession } from "@/hooks/api/use-session";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/password-input";
import { useChangePassword, useRevokeOtherSessions } from "@/features/settings/hooks/use-auth-mutations";
import { ActionDialog } from "./components/action-dialog";

const accountFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required to change password"),
    newPassword: z.string().min(7, "Password must be at least 7 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    twoFactorEnabled: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const { data: session } = useSession();
  const { data: accounts } = useAccounts();
  const changePassword = useChangePassword();
  const revokeOtherSessions = useRevokeOtherSessions();

  const [is2faDialogOpen, setIs2faDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactorEnabled: !!session?.user?.twoFactorEnabled,
    },
  });

  useEffect(() => {
    if (session?.user) {
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactorEnabled: !!session.user.twoFactorEnabled,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  async function onUpdatePassword(data: AccountFormValues) {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    });

    toast.success("Password updated successfully.");
    form.reset({
      ...form.getValues(),
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  const handleRevokeOtherSessions = async () => {
    toast.promise(revokeOtherSessions.mutateAsync(), {
      loading: "Revoking sessions...",
      success: "Successfully logged out of all other devices.",
      error: (err) => {
        const message = err instanceof Error ? err.message : "Failed to revoke sessions.";
        return message;
      },
    });
  };

  const hasCredentialAccount = accounts?.some((account) => account.providerId === "credential");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onUpdatePassword)} className="space-y-8">
        {hasCredentialAccount && (
          <div className="relative">
            <h3 className="mb-4 text-lg font-medium">Change Password</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
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
              </div>
              <Button type="submit" disabled={changePassword.isPending} aria-busy={changePassword.isPending}>
                Update password
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <h3 className="mb-4 text-lg font-medium">Two-Factor Authentication</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-base font-medium">Two-Factor Authentication</p>
                    <FormDescription>Add an extra layer of security to your account during sign in.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={() => setIs2faDialogOpen(true)} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="relative">
          <h3 className="mb-4 text-lg font-medium text-destructive">Danger Zone</h3>
          <div className="space-y-4">
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 font-normal">
              <div className="space-y-0.5">
                <p className="text-base font-medium">Log out all devices</p>
                <FormDescription>This will terminate all your sessions except for the current one.</FormDescription>
              </div>
              <FormControl>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeOtherSessions}
                  disabled={revokeOtherSessions.isPending}
                >
                  {revokeOtherSessions.isPending ? "Revoking..." : "Log out everywhere"}
                </Button>
              </FormControl>
            </FormItem>

            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-base font-medium">Delete account</p>
                <FormDescription>This will permanently delete your account and all your data.</FormDescription>
              </div>
              <FormControl>
                <Button type="button" variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete permanently
                </Button>
              </FormControl>
            </FormItem>
          </div>
        </div>

        <ActionDialog
          open={is2faDialogOpen}
          onOpenChange={setIs2faDialogOpen}
          type="2fa"
          enabled={!!session?.user?.twoFactorEnabled}
          onSuccess={() => {
            // Success handler if needed
          }}
        />

        <ActionDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} type="delete-account" />
      </form>
    </Form>
  );
}
