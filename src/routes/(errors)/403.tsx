import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { ForbiddenError } from "@/features/errors/forbidden";

export const Route = createFileRoute("/(errors)/403")({
  head: () => ({
    meta: seo({ title: "403 Forbidden", noIndex: true }),
  }),
  component: ForbiddenError,
});
