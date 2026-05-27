import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { GeneralError } from "@/features/errors/general-error";

export const Route = createFileRoute("/(errors)/500")({
  head: () => ({
    meta: seo({ title: "500 Internal Server Error", noIndex: true }),
  }),
  component: GeneralError,
});
