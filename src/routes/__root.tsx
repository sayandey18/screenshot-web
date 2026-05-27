import { type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { GeneralError } from "@/features/errors/general-error";
import { NotFoundError } from "@/features/errors/not-found-error";
import { RootComponent } from "@/features/root";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: seo({ title: undefined, description: "A powerful screenshot API tool" }),
  }),
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
