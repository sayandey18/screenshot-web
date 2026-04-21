import { createFileRoute } from "@tanstack/react-router";
import { Developers } from "@/features/developers";

export const Route = createFileRoute("/_authenticated/developers")({
  component: Developers,
});
