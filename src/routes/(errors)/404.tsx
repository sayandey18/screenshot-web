import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { NotFoundError } from "@/features/errors/not-found-error";

export const Route = createFileRoute("/(errors)/404")({
  head: () => ({
    meta: seo({ title: "404 Not Found", noIndex: true }),
  }),
  component: NotFoundError,
});
