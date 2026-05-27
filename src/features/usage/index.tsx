import { useMemo } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { UsageDialogs } from "./components/usage-dialogs";
import { UsageProvider } from "./components/usage-provider";
import { UsageTable } from "./components/usage-table";
import type { UsageLogsQuery } from "./data/schema";
import { useUsageLogs } from "./hooks/use-usage";

const route = getRouteApi("/_authenticated/usage/");

export function Usage() {
  const search = route.useSearch();

  const query = useMemo<UsageLogsQuery>(() => {
    const selectedStatus = Array.isArray(search.status) ? search.status : [];

    return {
      page: search.page ?? 1,
      limit: search.pageSize ?? 10,
      status: selectedStatus.length === 1 ? selectedStatus[0] : "all",
      range: search.range ?? "all",
    };
  }, [search.page, search.pageSize, search.range, search.status]);

  const { data, isLoading, isFetching, isError } = useUsageLogs(query);

  return (
    <UsageProvider>
      <Header fixed>
        <Search className="me-auto" />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Usage</h2>
            <p className="text-muted-foreground">Here&apos;s a list of your API screenshot logs.</p>
          </div>
        </div>

        {isLoading ? <div className="text-sm text-muted-foreground">Loading usage logs...</div> : null}
        {isError ? <div className="text-sm text-destructive">Failed to load usage logs.</div> : null}

        {data ? (
          <div className="space-y-2">
            {isFetching ? <p className="text-xs text-muted-foreground">Refreshing data...</p> : null}
            <UsageTable
              data={data.requests}
              total={data.pagination.total}
              totalPages={Math.max(1, data.pagination.totalPages)}
            />
          </div>
        ) : null}
      </Main>

      <UsageDialogs />
    </UsageProvider>
  );
}
