import { Link } from "@tanstack/react-router";
import { Crown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuotaResponse } from "@/hooks/api/use-quota";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

type NavPlanProps = {
  quota?: QuotaResponse;
};

export function NavPlan({ quota }: NavPlanProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const planName = quota?.plan ?? "Loading...";
  const used = quota?.quota.used ?? 0;
  const limit = quota?.quota.limit ?? 0;
  const percentUsed = quota?.quota.percentUsed ?? 0;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            "flex flex-col gap-2 rounded-md border border-sidebar-border bg-white p-3 transition-all dark:bg-accent",
            isCollapsed && "hidden"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <Crown className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-foreground uppercase">{planName}</span>
            </div>
            <Link
              to="/subscription"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="View subscription"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] leading-none font-medium">
              <span className="text-muted-foreground">Used</span>
              <span className="text-foreground">
                {used.toLocaleString()} / {limit.toLocaleString()}
              </span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-sidebar-border/90 dark:bg-muted-foreground">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Collapsed view */}
        {isCollapsed && (
          <SidebarMenuButton
            tooltip={`${planName} (${Math.min(percentUsed, 100).toFixed(1)}% used)`}
            className="bg-sidebar-accent text-sidebar-accent-foreground"
            asChild
          >
            <Link to="/subscription">
              <Crown className="h-4 w-4" />
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
