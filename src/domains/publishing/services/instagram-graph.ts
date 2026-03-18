import { getEnv } from "@/domains/shared/config/env";

type GraphMethod = "GET" | "POST";

type GraphRequest = {
  accessToken: string;
  method?: GraphMethod;
  params?: Record<string, string>;
  path: string;
};

type GraphResponseError = {
  error?: {
    code?: number;
    message?: string;
    type?: string;
  };
};

function getGraphApiBaseUrl() {
  const version = getEnv().INSTAGRAM_GRAPH_API_VERSION ?? "v23.0";

  return `https://graph.facebook.com/${version}`;
}

export async function instagramGraphRequest<T>(
  input: GraphRequest,
): Promise<T> {
  const params = new URLSearchParams({
    access_token: input.accessToken,
    ...(input.params ?? {}),
  });
  const method = input.method ?? "GET";
  const url = `${getGraphApiBaseUrl()}${input.path}${method === "GET" ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    body: method === "POST" ? params.toString() : undefined,
    headers:
      method === "POST"
        ? {
            "content-type": "application/x-www-form-urlencoded",
          }
        : undefined,
    method,
  });
  const payload = (await response.json()) as GraphResponseError & T;

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Instagram API request failed");
  }

  return payload;
}
