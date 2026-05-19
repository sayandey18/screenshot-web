
import { useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Building2, Calendar, Clock, Crown, Package, RefreshCw, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContentSection } from "../components/content-section";
import type { SubscriptionStatus } from "../data/schema";
import { useCancelSubscription, useConfirmSwitch, useStartCheckout, useSubscription } from "../hooks/use-subscription";

const route = getRouteApi("/_authenticated/subscription/");

type PlanId = "STARTER" | "GROWTH" | "ENTERPRISE";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  icon: React.ReactNode;
  rank: number;
};

const plans: Plan[] = [
  {
    id: "STARTER",
    name: "Starter",
    price: "$0/month",
    tagline: "Perfect for individual developers",
    icon: <Sparkles size={16} />,
    rank: 1,
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "$8/month",
    tagline: "Perfect for growing businesses",
    icon: <Zap size={16} />,
    rank: 2,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "$15/month",
    tagline: "Perfect for large scale businesses",
    icon: <Crown size={16} />,
    rank: 3,
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

function formatDate(isoDate: string | null | undefined) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export function SubscriptionPlans() {
  const navigate = route.useNavigate();
  const search = route.useSearch();

  useEffect(() => {
    if (!search.success) return;
    void navigate({ search: (prev) => ({ ...prev, success: undefined }), replace: true });
    toast.success("Your subscription has been updated.");
  }, [search.success, navigate]);

  const { data: subscription, isLoading } = useSubscription();
  const { mutate: startCheckout, isPending: isCheckingOut } = useStartCheckout();
  const { mutate: confirmSwitch, isPending: isConfirmingSwitch } = useConfirmSwitch();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [targetSwitchPlan, setTargetSwitchPlan] = useState<Plan | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<PlanId | null>(null);

  const activePlanId = subscription?.plan ?? "STARTER";
  const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) ?? plans[0], [activePlanId]);
  const isCancellationScheduled = Boolean(
    subscription?.cancelSchedule || subscription?.status === "cancellation_scheduled"
  );
  const isOnPaidPlan = activePlan.id !== "STARTER";

  const isBusy = isLoading || isCheckingOut || isConfirmingSwitch || isCancelling;

  const getCta = (plan: Plan) => {
    if (plan.id === activePlanId) {
      return { label: "Current Plan", variant: "secondary" as const, disabled: true };
    }

    const isUpgrade = plan.rank > activePlan.rank;
    return {
      label: isUpgrade ? "Upgrade" : "Downgrade",
      variant: isUpgrade ? ("default" as const) : ("outline" as const),
      disabled: false,
    };
  };

  const handleSelectPlan = (targetPlan: Plan) => {
    if (targetPlan.id === activePlanId) return;

    if (!isOnPaidPlan && targetPlan.id !== "STARTER") {
      setPendingPlanId(targetPlan.id);
      startCheckout({ plan: targetPlan.id });
      return;
    }

    if (isOnPaidPlan && targetPlan.id === "STARTER") {
      setCancelDialogOpen(true);
      return;
    }

    setTargetSwitchPlan(targetPlan);
    setPendingPlanId(targetPlan.id);
    setSwitchDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);
    setPendingPlanId(null);
    cancelSubscription();
  };

  const handleConfirmSwitch = () => {
    if (!targetSwitchPlan || targetSwitchPlan.id === "STARTER") return;
    confirmSwitch(
      { plan: targetSwitchPlan.id },
      {
        onSuccess: () => {
          setSwitchDialogOpen(false);
          setTargetSwitchPlan(null);
          setPendingPlanId(null);
        },
        onError: () => {
          setPendingPlanId(null);
        },
      }
    );
  };

  return (
    <ContentSection
      title="Plans"
      desc="Choose a plan that fits your usage now and scale when you need more."
      header={false}
    >
      <>
        <div className="space-y-6">
          <Card className="overflow-hidden border-muted/60 pb-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Active Subscription</CardTitle>
                  <CardDescription>Current subscription details and upcoming billing timeline.</CardDescription>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-24 rounded-full" />
                ) : subscription ? (
                  <Badge variant={statusToBadgeVariant(subscription.status)}>{statusLabel(subscription.status)}</Badge>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className={cn(activePlan.id === "STARTER" && "pb-6")}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="flex items-center gap-1 pb-1">
                    <Package className="size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Subscription</p>
                  </div>
                  <p className="text-sm font-medium">{activePlan.name}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 pb-1">
                    <RefreshCw className="size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Cycle</p>
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-4 w-16" />
                  ) : (
                    <p className="text-sm font-medium capitalize">{subscription?.billingCycle ?? "-"}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 pb-1">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-4 w-24" />
                  ) : (
                    <p className="text-sm font-medium">{formatDate(subscription?.nextBillingDate)}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1 pb-1">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Provider</p>
                  </div>
                  <p className="text-sm font-medium">{activePlan.id === "STARTER" ? "-" : "Dodo Payments"}</p>
                </div>
              </div>
            </CardContent>

            {!isLoading && activePlan.id !== "STARTER" && (
              <CardFooter
                className={
                  isCancellationScheduled
                    ? "bg-amber-100/80 px-6 py-2.5 dark:bg-amber-950/30"
                    : "border-t px-6 py-4 pt-4!"
                }
              >
                {isCancellationScheduled ? (
                  <div className="flex w-full items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
                    <Clock className="size-4 shrink-0" />
                    <span className="font-medium">NOTE: </span>
                    <span>Your current plan will remain active until the next billing date.</span>
                  </div>
                ) : (
                    <Button
                      variant="outline"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={isBusy || subscription?.status === "cancelled"}
                      aria-busy={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                    </Button>
                )}
              </CardFooter>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const cta = getCta(plan);
              const isCurrent = plan.id === activePlanId;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex h-full flex-col gap-3 overflow-hidden border-muted/60 shadow-sm transition-shadow hover:shadow-md",
                    isCurrent && "border-primary ring-1 ring-primary/30"
                  )}
                >
                  {isCurrent ? (
                    <Badge
                      variant="default"
                      className="absolute top-6 right-0 z-10 rounded-none border-0 px-2 py-1 text-[0.6rem] font-bold tracking-[0.25em] shadow-sm"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      CURRENT
                    </Badge>
                  ) : null}

                  <CardHeader>
                    <div className="flex items-center gap-2 pr-8">
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/5 text-primary">
                        {plan.icon}
                      </div>

                      <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{plan.price}</p>

                      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      variant={cta.variant}
                      className="w-full"
                      disabled={cta.disabled || isBusy}
                      onClick={() => handleSelectPlan(plan)}
                      aria-busy={isCheckingOut}
                    >
                      {isBusy && pendingPlanId === plan.id ? "Updating..." : cta.label}
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
          handleConfirm={handleConfirmCancel}
          isLoading={isCancelling}
        />

        <ConfirmDialog
          open={switchDialogOpen}
          onOpenChange={(open) => {
            setSwitchDialogOpen(open);
            if (!open && !isConfirmingSwitch) {
              setPendingPlanId(null);
            }
          }}
          title="Confirm plan switch"
          desc={
            <div className="space-y-2">
              <p>Your subscription will switch to the selected paid plan on confirmation.</p>
              {targetSwitchPlan ? (
                <p>
                  Target plan: <span className="font-medium">{targetSwitchPlan.name}</span>
                </p>
              ) : null}
            </div>
          }
          cancelBtnText="Keep Current Plan"
          confirmText="Confirm Switch"
          handleConfirm={handleConfirmSwitch}
          isLoading={isConfirmingSwitch}
        />
      </>
    </ContentSection>
  );
}
