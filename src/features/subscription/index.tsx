import { CreditCard, FileText, Package } from "lucide-react";
import { useSession } from "@/hooks/api/use-session";
import { PageShell } from "@/components/layout/page-shell";

const freeTabs = [
  { label: "Plans", href: "/subscription", icon: Package },
];

const paidTabs = [
  { label: "Plans", href: "/subscription", icon: Package },
  { label: "Invoices", href: "/subscription/invoices", icon: FileText },
  { label: "Billing", href: "/subscription/billing", icon: CreditCard },
];

export function Subscription() {
  const { data: session } = useSession();
  const isStarter = !session || session.user.plan === "STARTER";
  const tabs = isStarter ? freeTabs : paidTabs;

  return (
    <PageShell title="Subscription" description="Manage your plan, invoices, and billing details." tabs={tabs} />
  );
}
