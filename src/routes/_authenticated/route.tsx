import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/hooks/api/use-session";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location, context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());

    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }

    return { session };
  },
  component: AuthenticatedLayout,
});
