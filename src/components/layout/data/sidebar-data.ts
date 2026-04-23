import { SquareLibrary, Activity, HelpCircle, Settings, Users, Orbit, Terminal } from "lucide-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      title: "",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: SquareLibrary,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: Activity,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        {
          title: "Subscription",
          url: "/subscription",
          icon: Orbit,
        },
        {
          title: "Developers",
          url: "/developers",
          icon: Terminal,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "Help Center",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
