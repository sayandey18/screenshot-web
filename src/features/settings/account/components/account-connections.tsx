import { useState } from "react";
import { Plug, Unplug } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/api/use-accounts";
import { Badge } from "@/components/ui/badge";
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

  function isConnected(providerId: string) {
    return accounts?.some((a) => a.providerId === providerId) ?? false;
  }

  function handleLink(provider: "google" | "github") {
    setPendingProvider(provider);
    linkSocial.mutate(
      { provider, callbackURL: `${window.location.origin}/settings/account` },
      { onSettled: () => setPendingProvider(null) }
    );
  }

  function handleUnlink(providerId: string) {
    setPendingProvider(providerId);
    unlinkAccount.mutate(
      { providerId },
      {
        onSettled: () => setPendingProvider(null),
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to unlink account");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="relative">
        <h3 className="mb-3 text-lg font-medium">Connected Accounts</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="size-7 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-px w-full" />
      </div>
    );
  }

  return (
    <div className="relative">
      <h3 className="mb-3 text-lg font-medium">Connected Accounts</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const Icon = provider.icon;
          const isPending = pendingProvider === provider.id;

          return (
            <div key={provider.id} className="relative flex items-center gap-3 rounded-lg border p-3">
              <Icon className="size-7 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{provider.name}</p>
                <p className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
                  {connected ? (
                    <Badge
                      variant="outline"
                      className={cn("border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400")}
                    >
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={cn("border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400")}
                    >
                      Not connected
                    </Badge>
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant={connected ? "destructive" : "outline"}
                size="sm"
                className="shrink-0 gap-1.5"
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
