import { useLayout } from "@/context/layout-provider";
import { useQuota } from "@/hooks/api/use-quota";
import { useSession } from "@/hooks/api/use-session";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { AppTitle } from "./app-title";
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavPlan } from "./nav-plan";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { data: session } = useSession();
  const { data: quota } = useQuota();

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavPlan quota={quota} />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
