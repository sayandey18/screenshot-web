import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: async ({ context }) => {
    try {
      let state = context.authStore.getState();

      if (state.isLoading || state.session === null) {
        try {
          await context.authStore.getState().fetchSession();
        } catch (_error) {
          // Swallow fetch error
        }
        state = context.authStore.getState();
      }

      if (state.session !== null) {
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
