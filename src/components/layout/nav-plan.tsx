import { Crown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

type NavPlanProps = {
  plan: {
    name: string;
    used: number;
    limit: number;
  };
};

export function NavPlan({ plan }: NavPlanProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            "flex flex-col gap-2 rounded-md border border-sidebar-border bg-gray-50 p-3 transition-all",
            isCollapsed && "hidden"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <Crown className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-foreground uppercase">{plan.name}</span>
            </div>
            <button className="text-muted-foreground transition-colors hover:text-foreground">
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] leading-none font-medium">
              <span className="text-muted-foreground">Used</span>
              <span className="text-foreground">
                {plan.used} / {plan.limit}
              </span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-sidebar-border/90">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${(plan.used / plan.limit) * 100}%` }}
              />
            </div>
          </div>

          {/* <Button size="sm" className="h-8 w-full text-xs font-bold shadow-none">
            Upgrade
          </Button> */}
        </div>

        {/* Collapsed view */}
        {isCollapsed && (
          <SidebarMenuButton
            tooltip={`${plan.name} (${Math.round((plan.used / plan.limit) * 100)}% used)`}
            className="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <Crown className="h-4 w-4" />
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
