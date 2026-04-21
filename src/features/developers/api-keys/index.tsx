import { useCallback, useEffect, useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ContentSection } from "../components/content-section";
import { ApiKeyCreateDialog } from "./components/api-key-create-dialog";
import { ApiKeyDeleteDialog } from "./components/api-key-delete-dialog";
import { ApiKeyManageDialog } from "./components/api-key-manage-dialog";
import { ApiKeysTable } from "./components/api-keys-table";
import { apiKeySchema, type ApiKeyItem } from "./data/schema";

const route = getRouteApi("/_authenticated/developers/");

type ApiKeyListResult = {
  apiKeys?: unknown;
  total?: unknown;
};

type ApiClientResult<T> = {
  data?: T;
  error?: {
    message?: string;
  };
};

type CreateApiKeyValues = {
  name: string;
  expiresIn?: number;
};

type CreatedApiKeyResult = {
  key: string;
};

type ApiClientResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: {
        message?: string;
      };
    };

function hasData<T>(response: ApiClientResponse<T>): response is { data: T; error: null } {
  return response.error === null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function parseApiKeys(input: unknown): ApiKeyItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => apiKeySchema.safeParse(item))
    .filter((item) => item.success)
    .map((item) => item.data);
}

export function DevelopersApiKeys() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentRow, setCurrentRow] = useState<ApiKeyItem | null>(null);

  const currentPage = typeof search.page === "number" ? search.page : 1;

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);

    try {
      const offset = Math.max(0, (currentPage - 1) * 10);
      const response = (await authClient.apiKey.list({
        query: {
          limit: 10,
          offset,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      })) as ApiClientResult<ApiKeyListResult> | ApiKeyListResult;

      const normalizedResponse = response as ApiClientResponse<ApiKeyListResult>;

      if (!hasData(normalizedResponse)) {
        toast.error(normalizedResponse.error.message || "Failed to load API keys.");
        setApiKeys([]);
        setTotal(0);
        return;
      }

      const payload = normalizedResponse.data;
      const keys = parseApiKeys(payload.apiKeys);
      const rawTotal = payload.total;
      const normalizedTotal = typeof rawTotal === "number" ? rawTotal : keys.length;

      setApiKeys(keys);
      setTotal(normalizedTotal);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load API keys."));
      setApiKeys([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchApiKeys();
    });
  }, [fetchApiKeys]);

  const handleCreate = useCallback(
    async (values: CreateApiKeyValues): Promise<CreatedApiKeyResult | null> => {
      setIsCreating(true);

      try {
        const response = (await authClient.apiKey.create(values)) as ApiClientResponse<CreatedApiKeyResult>;
        if (!hasData(response)) {
          toast.error(response.error.message || "Failed to create API key.");
          return null;
        }

        const createdKey = typeof response.data.key === "string" ? response.data.key : null;

        toast.success("API key created successfully.");
        await fetchApiKeys();

        return createdKey ? { key: createdKey } : null;
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to create API key."));
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [fetchApiKeys]
  );

  const handleManage = useCallback(
    async (id: string, name: string) => {
      setIsManaging(true);

      try {
        const response = (await authClient.apiKey.update({ keyId: id, name })) as ApiClientResponse<unknown>;
        if (!hasData(response)) {
          toast.error(response.error.message || "Failed to update API key.");
          return;
        }

        toast.success("API key updated successfully.");
        setOpenManage(false);
        setCurrentRow(null);
        await fetchApiKeys();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update API key."));
      } finally {
        setIsManaging(false);
      }
    },
    [fetchApiKeys]
  );

  const handleToggleStatus = useCallback(
    async (row: ApiKeyItem) => {
      const isExpired = !!row.expiresAt && row.expiresAt.getTime() < Date.now();
      if (isExpired) return;

      const isDisabled = row.enabled === false;
      const nextEnabled = isDisabled;

      setIsDisabling(true);

      try {
        const response = (await authClient.apiKey.update({
          keyId: row.id,
          enabled: nextEnabled,
        })) as ApiClientResponse<unknown>;
        if (!hasData(response)) {
          toast.error(response.error.message || "Failed to update API key status.");
          return;
        }

        toast.success(nextEnabled ? "API key enabled successfully." : "API key disabled successfully.");
        await fetchApiKeys();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update API key status."));
      } finally {
        setIsDisabling(false);
      }
    },
    [fetchApiKeys]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setIsDeleting(true);

      try {
        const response = (await authClient.apiKey.delete({ keyId: id })) as ApiClientResponse<unknown>;
        if (!hasData(response)) {
          toast.error(response.error.message || "Failed to delete API key.");
          return;
        }

        toast.success("API key deleted successfully.");
        setOpenDelete(false);
        setCurrentRow(null);
        await fetchApiKeys();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete API key."));
      } finally {
        setIsDeleting(false);
      }
    },
    [fetchApiKeys]
  );

  const tableData = useMemo(() => apiKeys, [apiKeys]);

  const handleBulkDelete = useCallback(
    async (rows: ApiKeyItem[]) => {
      for (const row of rows) {
        const response = (await authClient.apiKey.delete({ keyId: row.id })) as ApiClientResponse<unknown>;
        if (!hasData(response)) {
          throw new Error(response.error.message || "Failed to delete selected API keys.");
        }
      }

      await fetchApiKeys();
    },
    [fetchApiKeys]
  );

  return (
    <ContentSection title="API Keys" desc="Create, manage, and delete API keys for your integrations.">
      <>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex justify-end">
            <Button className="space-x-1" onClick={() => setOpenCreate(true)}>
              <span>Create</span>
              <Plus size={18} />
            </Button>
          </div>

          <ApiKeysTable
            data={tableData}
            total={total}
            isLoading={isLoading}
            search={search}
            navigate={navigate}
            onManage={(row) => {
              setCurrentRow(row);
              setOpenManage(true);
            }}
            onToggleStatus={handleToggleStatus}
            onDelete={(row) => {
              setCurrentRow(row);
              setOpenDelete(true);
            }}
            onBulkDelete={handleBulkDelete}
          />
        </div>

        <ApiKeyCreateDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          onCreate={handleCreate}
          isLoading={isCreating}
        />

        <ApiKeyManageDialog
          currentRow={currentRow}
          open={openManage}
          onOpenChange={(open) => {
            setOpenManage(open);
            if (!open) setCurrentRow(null);
          }}
          onSave={handleManage}
          isLoading={isManaging}
        />

        <ApiKeyDeleteDialog
          currentRow={currentRow}
          open={openDelete}
          onOpenChange={(open) => {
            setOpenDelete(open);
            if (!open) setCurrentRow(null);
          }}
          onDelete={handleDelete}
          isLoading={isDeleting || isDisabling}
        />
      </>
    </ContentSection>
  );
}
