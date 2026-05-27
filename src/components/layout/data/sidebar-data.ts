import { SquareLibrary, Activity, HelpCircle, Settings, Orbit, Terminal } from "lucide-react";
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
          title: "Usage",
          url: "/usage",
          icon: Activity,
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
          title: "Support",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
