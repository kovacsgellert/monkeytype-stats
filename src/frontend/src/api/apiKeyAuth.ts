export const API_KEY_AUTH_HEADER = "Authorization";
export const API_KEY_AUTH_PREFIX = "ApiKey ";

export function createApiKeyAuthHeaders(apiKey: string): HeadersInit {
  return {
    [API_KEY_AUTH_HEADER]: `${API_KEY_AUTH_PREFIX}${apiKey}`,
  };
}
