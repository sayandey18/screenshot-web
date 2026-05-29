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
            "flex flex-col gap-2 rounded-md border border-sidebar-border/50 bg-linear-to-b from-primary/10 to-primary/5 p-3 transition-all dark:from-primary/15 dark:to-primary/5",
            isCollapsed && "hidden"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                <Crown className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-foreground uppercase">{planName}</span>
            </div>
            <Link
              to="/subscription"
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="View subscription"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] leading-none font-semibold">
              <span className="text-muted-foreground">Used</span>
              <span className="text-foreground">
                {used.toLocaleString()} / {limit.toLocaleString()}
              </span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-sidebar-border/70">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary/70 to-primary transition-all duration-500 ease-in-out"
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
