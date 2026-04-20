import { type QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { type useAuthStore } from "@/stores/auth-store";
import { GeneralError } from "@/features/errors/general-error";
import { NotFoundError } from "@/features/errors/not-found-error";
import { RootComponent } from "@/features/root";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  authStore: typeof useAuthStore;
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
