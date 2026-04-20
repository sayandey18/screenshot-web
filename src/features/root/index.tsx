import { useEffect } from "react";
import { Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/navigation-progress";

export function RootComponent() {
  const { fetchSession, isLoading } = useAuthStore();

  useEffect(() => {
    void fetchSession();

    const onFocus = () => {
      void fetchSession();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchSession();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = setInterval(
      () => {
        if (!document.hidden) {
          void fetchSession();
        }
      },
      10 * 60 * 1000
    ); // 10 minutes

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(intervalId);
    };
  }, [fetchSession]);

  return (
    <>
      <NavigationProgress />
      {isLoading ? (
        <div className="flex h-svh w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Outlet />
      )}
      <Toaster duration={5000} />
      {import.meta.env.MODE === "development" && (
        <>
          <ReactQueryDevtools buttonPosition="top-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </>
  );
}
