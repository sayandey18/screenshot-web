import { Outlet } from "@tanstack/react-router";
import { CreditCard, FileText, Package } from "lucide-react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitch } from "@/components/theme-switch";
import { SidebarNav } from "./components/sidebar-nav";

const sidebarNavItems = [
  {
    title: "Plans",
    href: "/subscription",
    icon: <Package size={18} />,
  },
  {
    title: "Invoices",
    href: "/subscription/invoices",
    icon: <FileText size={18} />,
  },
  {
    title: "Billing",
    href: "/subscription/billing",
    icon: <CreditCard size={18} />,
  },
];

export function Subscription() {
  return (
    <>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your plan, invoices, and billing details. Designed for smooth Dodo Payments integration.
          </p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex min-h-0 w-full overflow-y-hidden p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  );
}
