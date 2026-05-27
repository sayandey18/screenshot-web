import { Code2, Webhook } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const tabs = [
  { label: "API Keys", href: "/developers", icon: Code2 },
  { label: "Webhook", href: "/developers/webhook", icon: Webhook },
];

export function Developers() {
  return (
    <PageShell title="Developers" description="Manage API keys and developer integrations for your account." tabs={tabs} />
  );
}
