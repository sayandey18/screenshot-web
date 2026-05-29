import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";

type PageTab = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PageShellProps = {
  title: string;
  description: string;
  tabs: PageTab[];
};

function SecondaryNav({ tabs }: { tabs: PageTab[] }) {
  const { pathname } = useLocation();

  return (
    <nav className="-mx-4 mb-4 no-scrollbar flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageShell({ title, description, tabs }: PageShellProps) {
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

      <Main>
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {tabs.length > 1 && (
          <div className="mt-4">
            <SecondaryNav tabs={tabs} />
          </div>
        )}

        <div className="mt-6">
          <Outlet />
        </div>
      </Main>
    </>
  );
}
