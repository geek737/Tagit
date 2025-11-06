import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
    },
  },
});

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  url: string,
  method: RequestMethod = "GET",
  data?: any
) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    throw new Error(`${res.status}: ${await res.text()}`);
  }

  return res.json();
}
