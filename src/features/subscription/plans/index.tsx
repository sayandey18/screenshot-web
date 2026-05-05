import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { subscriptionKeys, sessionKeys, quotaKeys } from "@/hooks/api/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContentSection } from "../components/content-section";
import type { SubscriptionStatus } from "../data/schema";
import { useSubscription, useCheckout, useCancelSubscription } from "../hooks/use-subscription";

const route = getRouteApi("/_authenticated/subscription/");

type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";

type Plan = {
  id: PlanId;
  price: string;
  tagline: string;
  icon: React.ReactNode;
  features: string[];
  rank: number;
  slug?: "growth-plan" | "enterprise-plan";
};

const plans: Plan[] = [
  {
    id: "STARTER",
    price: "$0/month",
    tagline: "Perfect for getting started with essential screenshot workflows.",
    icon: <Sparkles size={16} />,
    rank: 1,
    features: [
      "Up to 100 screenshots / month",
      "Basic workspace controls",
      "Community support",
      "Standard image retention",
    ],
  },
  {
    id: "GROWTH",
    price: "$8/month",
    tagline: "Built for growing teams that need automation and higher limits.",
    icon: <Zap size={16} />,
    rank: 2,
    features: ["Up to 10,000 screenshots / month", "Priority processing queue", "Team member roles", "Email support"],
  },
  {
    id: "ENTERPRISE",
    price: "$15/month",
    tagline: "Advanced controls and scale for production-grade workloads.",
    icon: <Crown size={16} />,
    rank: 3,
    features: ["Unlimited screenshots", "Advanced webhook controls", "SLA-backed support", "Audit logs and governance"],
  },
];

function statusToBadgeVariant(status: SubscriptionStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "trial":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "cancellation_scheduled":
      return "outline";
    default:
      return "outline";
  }
}

function statusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "trial":
      return "Trial";
    case "cancelled":
      return "Cancelled";
    case "cancellation_scheduled":
      return "Cancellation Scheduled";
    default:
      return "Unknown";
  }
}

export function SubscriptionPlans() {
  const queryClient = useQueryClient();

  const navigate = route.useNavigate();
  const search = route.useSearch();

  useEffect(() => {
    if (!search.success) return;
    void navigate({ search: (prev) => ({ ...prev, success: undefined }), replace: true });
    toast.success("Your subscription has been updated.");
  }, [search.success, navigate]);

  const { data: subscription, isLoading } = useSubscription();
  const { mutate: startCheckout, isPending: isCheckingOut } = useCheckout();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const activePlanId = subscription?.plan ?? "STARTER";

  const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) ?? plans[0], [activePlanId]);

  const getCta = (plan: Plan) => {
    if (plan.id === activePlanId) {
      return { label: "Current", variant: "default" as const, disabled: true };
    }
    const isUpgrade = plan.rank > activePlan.rank;
    return {
      label: isUpgrade ? "Upgrade" : "Downgrade",
      variant: isUpgrade ? ("default" as const) : ("outline" as const),
      disabled: false,
    };
  };

  const handleChangePlan = (targetPlan: Plan) => {
    if (targetPlan.id === activePlanId) return;

    if (!targetPlan.slug) {
      // Downgrading to STARTER — cancel the existing paid subscription
      setCancelDialogOpen(true);
      return;
    }

    // Upgrading — redirect to Dodo Payments hosted checkout
    startCheckout({ slug: targetPlan.slug });
  };

  const handleCancelSubscription = () => {
    setCancelDialogOpen(false);
    cancelSubscription(undefined, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
        void queryClient.invalidateQueries({ queryKey: sessionKeys.current });
        void queryClient.invalidateQueries({ queryKey: quotaKeys.current });
      },
    });
  };

  return (
    <ContentSection title="Plans" desc="Choose a plan that fits your usage now and scale when you need more.">
      <>
        <div className="space-y-6">
          <Card className="gap-4">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="mb-1">Active Subscription</CardTitle>
                  <CardDescription>Current subscription details and billing timeline.</CardDescription>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 rounded-full" />
                ) : subscription ? (
                  <Badge variant={statusToBadgeVariant(subscription.status)}>{statusLabel(subscription.status)}</Badge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="pb-1 text-xs text-muted-foreground">Subscription</p>
                <p className="text-sm font-medium">{activePlan.id}</p>
              </div>
              <div>
                <p className="pb-1 text-xs text-muted-foreground">Cycle</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-4 w-16" />
                ) : (
                  <p className="text-sm font-medium capitalize">{subscription?.billingCycle ?? "—"}</p>
                )}
              </div>
              <div>
                <p className="pb-1 text-xs text-muted-foreground">Upcoming Date</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-4 w-24" />
                ) : (
                  <p className="text-sm font-medium">
                    {subscription?.nextBillingDate
                      ? (() => {
                          const d = new Date(subscription.nextBillingDate);
                          const day = String(d.getUTCDate()).padStart(2, "0");
                          const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                          const year = d.getUTCFullYear();
                          return `${day}-${month}-${year}`;
                        })()
                      : "—"}
                  </p>
                )}
              </div>
              <div>
                <p className="pb-1 text-xs text-muted-foreground">Provider</p>
                <p className="text-sm font-medium">{activePlan.id === "STARTER" ? "—" : "Dodo Payments"}</p>
              </div>
            </CardContent>

            {/*{!isLoading && activePlan.id !== "STARTER" && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-sm text-destructive hover:text-destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={
                    isCancelling ||
                    subscription?.status === "cancellation_scheduled" ||
                    subscription?.status === "cancelled"
                  }
                >
                  {isCancelling ? "Cancelling…" : "Cancel Subscription"}
                </Button>
              </CardFooter>
            )}*/}
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const cta = getCta(plan);
              const isCurrent = plan.id === activePlanId;
              const isThisCheckingOut = isCheckingOut && !isCurrent;

              return (
                <Card key={plan.id} className={isCurrent ? "border-2 border-primary" : ""}>
                  <CardHeader>
                    {/*<CardAction>{isCurrent ? <Badge>Current</Badge> : null}</CardAction>*/}
                    <CardTitle className="flex items-center gap-2 text-base">
                      {plan.icon}
                      <span>{plan.name}</span>
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">{plan.price}</CardDescription>
                    <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    <Button
                      variant={cta.variant}
                      className="w-full"
                      disabled={cta.disabled || isThisCheckingOut || isLoading}
                      onClick={() => handleChangePlan(plan)}
                    >
                      {isThisCheckingOut ? "Redirecting…" : cta.label}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <ConfirmDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          title="Cancel Subscription?"
          desc="Your paid plan will remain active until the end of the current billing period. After that, your account will automatically revert to STARTER."
          cancelBtnText="Keep Subscription"
          confirmText="Schedule Cancellation"
          destructive
          handleConfirm={handleCancelSubscription}
        />
      </>
    </ContentSection>
  );
}
