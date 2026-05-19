import { HeadContent, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/api/use-session";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/navigation-progress";
import { RouteFocus } from "@/components/route-focus";

export function RootComponent() {
  const { isLoading } = useSession();

  return (
    <>
      <NavigationProgress />
      {isLoading ? (
        <div className="flex h-svh w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <HeadContent />
          <RouteFocus />
          <Outlet />
        </>
      )}
      <Toaster duration={5000} />
      {import.meta.env.MODE === "development" && (
        <>
          <ReactQueryDevtools buttonPosition="top-right" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </>
  );
}
