import { createFileRoute } from "@tanstack/react-router";
import { DevelopersWebhook } from "@/features/developers/webhook";

export const Route = createFileRoute("/_authenticated/developers/webhook")({
  component: DevelopersWebhook,
});
