export function unwrapAuthResult<T>({ data, error }: { data: T; error: unknown }) {
  if (error) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Auth error";

    throw new Error(message);
  }

  return data;
}
