import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { UsageDetailsDialog } from "./components/usage-details-dialog";
import { UsageTable } from "./components/usage-table";
import { getUsage } from "./data/queries";

const route = getRouteApi("/_authenticated/usage/");

export function Usage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const session = useAuthStore((state) => state.session);

  const page = typeof search.page === "number" ? search.page : 1;
  const pageSize = 10;

  const statusFilter = Array.isArray(search.status) ? search.status : [];
  const browserFilter = Array.isArray(search.browser) ? search.browser : [];
  const month = typeof search.month === "string" ? search.month : undefined;

  // Backend expects a single optional status/browser.
  // Keep URL schema aligned with toolbar-style arrays and pass the first selection when present.
  const selectedStatus = statusFilter.length > 0 ? statusFilter[0] : undefined;
  const selectedBrowser = browserFilter.length > 0 ? browserFilter[0] : undefined;

  const [selectedUsageId, setSelectedUsageId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const userId = typeof session?.user?.id === "string" ? session.user.id : "";

  const usageQuery = useQuery({
    queryKey: [
      "usage",
      userId,
      page,
      pageSize,
      month ?? "",
      selectedStatus ?? "",
      selectedBrowser ?? "",
      typeof search.filter === "string" ? search.filter : "",
    ],
    queryFn: () =>
      getUsage({
        userId,
        page,
        pageSize,
        month,
        status: selectedStatus,
        browser: selectedBrowser,
        filter: typeof search.filter === "string" ? search.filter : undefined,
      }),
    enabled: Boolean(userId),
  });

  const rows = usageQuery.data?.rows ?? [];
  const total = usageQuery.data?.total ?? 0;

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usage</h2>
            <p className="text-muted-foreground">Here&apos;s a list of your API screenshot activity logs.</p>
          </div>
        </div>

        <UsageTable
          data={rows}
          total={total}
          page={page}
          pageSize={pageSize}
          isLoading={usageQuery.isLoading}
          search={search as Record<string, unknown>}
          navigate={navigate}
          onOpenDetails={(id) => {
            setSelectedUsageId(id);
            setIsDetailsOpen(true);
          }}
        />
      </Main>

      <UsageDetailsDialog
        usageId={selectedUsageId}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedUsageId(null);
          }
        }}
      />
    </>
  );
}
