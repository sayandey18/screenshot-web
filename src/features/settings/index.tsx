import { Bell, Palette, Wrench, UserCog } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const tabs = [
  { label: "Profile", href: "/settings", icon: UserCog },
  { label: "Account", href: "/settings/account", icon: Wrench },
  { label: "Appearance", href: "/settings/appearance", icon: Palette },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
];

export function Settings() {
  return (
    <PageShell title="Settings" description="Manage your account settings and set e-mail preferences." tabs={tabs} />
  );
}
