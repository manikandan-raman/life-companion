import type { ApiResponse } from "@/types";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || errorData.message || "An error occurred"
    );
  }
  return response.json();
}

function buildUrl(endpoint: string, params?: FetchOptions["params"]): string {
  // For relative URLs (starting with /), just append query params directly
  // This works in the browser without needing a base URL
  let url = endpoint;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }
  
  return url;
}

export const api = {
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const response = await fetch(buildUrl(endpoint, params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      credentials: "include",
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const response = await fetch(buildUrl(endpoint, params), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const response = await fetch(buildUrl(endpoint, params), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const response = await fetch(buildUrl(endpoint, params), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const response = await fetch(buildUrl(endpoint, params), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      credentials: "include",
      ...fetchOptions,
    });
    return handleResponse<T>(response);
  },
};

export { ApiError };
