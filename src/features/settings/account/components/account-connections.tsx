import { useState } from "react";
import { Plug, Unplug } from "lucide-react";
import { toast } from "sonner";
import { IconGithub, IconGoogle } from "@/assets/brand-icons";
import { useAccounts } from "@/hooks/api/use-accounts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLinkSocial, useUnlinkAccount } from "@/features/settings/hooks/use-auth-mutations";

const providers = [
  { id: "google", name: "Google", icon: IconGoogle },
  { id: "github", name: "GitHub", icon: IconGithub },
] as const;

export function AccountConnections() {
  const { data: accounts } = useAccounts();
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
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-red-600">Not connected</span>
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
      <Separator className="mt-6" />
    </div>
  );
}
