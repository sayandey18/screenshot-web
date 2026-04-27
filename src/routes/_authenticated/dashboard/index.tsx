import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Dashboard } from "@/features/dashboard";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: seo({
      title: "Dashboard",
      description: "Overview of your analytics, activity, and recent data.",
    }),
  }),
  component: Dashboard,
});
