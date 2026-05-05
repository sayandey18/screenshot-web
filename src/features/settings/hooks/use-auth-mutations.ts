import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { unwrapAuthResult } from "@/lib/auth-helpers";
import { sessionKeys } from "@/hooks/api/query-keys";

type UpdateProfileInput = {
  name: string;
  company?: string;
  bio?: string;
};

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
};

const invalidateSession = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: sessionKeys.current });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const result = await authClient.updateUser(input);
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await invalidateSession(queryClient);
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/profile/avatar", formData);
      return response.data;
    },
    onSuccess: async () => {
      await invalidateSession(queryClient);
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete("/profile/avatar");
      return response.data;
    },
    onSuccess: async () => {
      await invalidateSession(queryClient);
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const result = await authClient.changePassword(input);
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
  });

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.revokeOtherSessions();
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await invalidateSession(queryClient);
    },
  });
};

export const useEnableTwoFactor = () =>
  useMutation({
    mutationFn: async (password?: string) => {
      const result = await authClient.twoFactor.enable({ password });
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
  });

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password?: string) => {
      const result = await authClient.twoFactor.disable({ password });
      return unwrapAuthResult(result as { data: typeof result.data; error: unknown });
    },
    onSuccess: async () => {
      await invalidateSession(queryClient);
    },
  });
};
