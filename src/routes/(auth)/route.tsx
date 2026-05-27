import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/hooks/api/use-session";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: async ({ context }) => {
    try {
      const session = await context.queryClient.ensureQueryData(sessionQueryOptions());

      if (session !== null) {
        throw redirect({
          to: "/dashboard",
        });
      }
    } catch (e: unknown) {
      if (isRedirect(e)) {
        throw e;
      }
    }
  },
  component: () => <Outlet />,
});
