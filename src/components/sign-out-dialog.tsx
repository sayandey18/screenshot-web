import { useNavigate } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSignOut } from "@/features/settings/hooks/use-auth-mutations";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/sign-in", replace: true });
      },
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={handleSignOut}
      isLoading={signOut.isPending}
      className="sm:max-w-sm"
    />
  );
}
