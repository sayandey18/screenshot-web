import { Cable } from "lucide-react";

export function ComingSoon() {
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <Cable size="62" />
        <h1 className="text-3xl leading-tight font-bold">Coming Soon!</h1>
        <p className="text-center text-sm text-muted-foreground">
          This page has not been created yet. <br />
          Stay tuned though!
        </p>
      </div>
    </div>
  );
}
