import { useState } from "react";
import { Plug, Unplug } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/api/use-accounts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkSocial, useUnlinkAccount } from "@/features/settings/hooks/use-auth-mutations";

const providers = [
  { id: "google", name: "Google", icon: IconGoogle },
  { id: "github", name: "GitHub", icon: IconGithub },
] as const;

export function AccountConnections() {
  const { data: accounts, isLoading } = useAccounts();
  const linkSocial = useLinkSocial();
  const unlinkAccount = useUnlinkAccount();

  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  function getAccount(providerId: string) {
    return accounts?.find((a) => a.providerId === providerId);
  }

  function handleLink(provider: "google" | "github") {
    setPendingProvider(provider);
    linkSocial.mutate(
      { provider, callbackURL: `${window.location.origin}/settings/account` },
      {
        onSettled: () => {
          setTimeout(() => setPendingProvider(null), 2000);
        },
      }
    );
  }

  function handleUnlink(providerId: string) {
    setPendingProvider(providerId);
    unlinkAccount.mutate(
      { providerId },
      {
        onSettled: () => {
          setTimeout(() => setPendingProvider(null), 2000);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to unlink account");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="mb-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-4">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your social accounts to sign in quickly and keep your profile synced.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {providers.map((provider) => {
          const connected = !!getAccount(provider.id);
          const Icon = provider.icon;
          const isPending = pendingProvider === provider.id;

          return (
            <div
              key={provider.id}
              className="group relative flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-muted-foreground/20 hover:bg-muted/30"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-muted bg-muted/50">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{provider.name}</p>
                  <span
                    className={cn(
                      "inline-block size-1.5 rounded-full",
                      connected ? "bg-green-500" : "bg-muted-foreground/30"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      connected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}
                  >
                    {connected ? "Connected" : "Not connected"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {connected ? `Connected via ${provider.name}` : "Link your account for quick sign-in"}
                </p>
              </div>
              <Button
                type="button"
                variant={connected ? "ghost" : "default"}
                size="sm"
                className={cn(
                  "shrink-0 gap-1.5 shadow-xs",
                  connected ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "shadow-sm"
                )}
                disabled={isPending}
                aria-busy={isPending}
                onClick={() => (connected ? handleUnlink(provider.id) : handleLink(provider.id))}
              >
                {isPending ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : connected ? (
                  <>
                    <Unplug className="size-3.5" />
                    Unlink
                  </>
                ) : (
                  <>
                    <Plug className="size-3.5" />
                    Link
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
