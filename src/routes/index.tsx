import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/hooks/api/use-session";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions());

    if (session) {
      throw redirect({ to: "/dashboard" });
    }

    throw redirect({ to: "/sign-in" });
  },
});
