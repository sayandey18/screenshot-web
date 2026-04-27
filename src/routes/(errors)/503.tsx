import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { MaintenanceError } from "@/features/errors/maintenance-error";

export const Route = createFileRoute("/(errors)/503")({
  head: () => ({
    meta: seo({ title: "503 Service Unavailable", noIndex: true }),
  }),
  component: MaintenanceError,
});
