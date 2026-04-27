import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { UnauthorisedError } from "@/features/errors/unauthorized-error";

export const Route = createFileRoute("/(errors)/401")({
  head: () => ({
    meta: seo({ title: "401 Unauthorised", noIndex: true }),
  }),
  component: UnauthorisedError,
});
