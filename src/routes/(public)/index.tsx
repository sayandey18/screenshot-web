import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Landing Page</h1>
      <p className="text-muted-foreground">Under construction</p>
    </div>
  );
}
