import type { HTMLAttributes } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { type FallbackProps } from "react-error-boundary";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GeneralErrorProps = HTMLAttributes<HTMLDivElement> &
  Partial<Pick<FallbackProps, "resetErrorBoundary">> & {
    minimal?: boolean;
  };

// export function GeneralError({ error, resetErrorBoundary }: FallbackProps) {
//   const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
//   return (
//     <div className="flex min-h-screen items-center justify-center p-4">
//       <Card className="max-w-md">
//         <CardHeader>
//           <CardTitle>Something went wrong</CardTitle>
//           <CardDescription>{message}</CardDescription>
//         </CardHeader>
//         <CardContent className="flex gap-2">
//           <Button onClick={resetErrorBoundary}>Try again</Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
//

export function GeneralError({ className, minimal = false, resetErrorBoundary, ...props }: GeneralErrorProps) {
  const navigate = useNavigate();
  const { history } = useRouter();
  return (
    <div className={cn("h-svh w-full", className)} {...props}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && <h1 className="text-[7rem] leading-tight font-bold">500</h1>}
        <span className="font-medium">Oops! Something went wrong {`:')`}</span>
        <p className="text-center text-muted-foreground">
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            {resetErrorBoundary && <Button onClick={resetErrorBoundary}>Try Again</Button>}
            <Button variant="outline" onClick={() => history.go(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate({ to: "/" })}>Back to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
}
