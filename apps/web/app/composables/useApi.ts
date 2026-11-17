export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  return <T>(url: string, opts: Parameters<typeof $fetch>[1] = {}) =>
    $fetch<T>(url, {
      baseURL: config.public.apiBase,
      ...opts,
      headers: {
        ...(opts.headers as Record<string, string>),
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
    });
}