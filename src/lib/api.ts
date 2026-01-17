// lib/api.ts
export interface ApiOptions extends RequestInit {
  body?: any; // allow object for JSON payloads
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const token = localStorage.getItem('token');
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) throw new Error('API base URL is not defined!');

  // Normalize headers
  const customHeaders: Record<string, string> = {};

  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      customHeaders[key] = value;
    });
  } else if (Array.isArray(options.headers)) {
    options.headers.forEach(([key, value]) => {
      customHeaders[key] = value;
    });
  } else if (options.headers) {
    Object.assign(customHeaders, options.headers);
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...customHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Convert body to JSON if it's an object
  const body =
    options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body;

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    body,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}
