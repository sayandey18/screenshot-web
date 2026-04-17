import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location, context }) => {
    let session = context.authStore.getState().session;

    if (!session) {
      try {
        await context.authStore.getState().fetchSession();
        session = context.authStore.getState().session;
      } catch (_error) {
        throw redirect({
          to: "/sign-in",
          search: { redirect: location.href },
        });
      }
    }

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
