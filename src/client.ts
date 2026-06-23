// Internal HTTP client used by both Facebook + Instagram + Account
// public classes. Centralizes URL building, default headers, error
// mapping, and the `_extra` query-param merging logic so each method
// stays a one-liner.

import {
  APIConnectionError,
  APIError,
  APIServerError,
  AuthenticationError,
  BadRequestError,
  InsufficientCreditsError,
  RateLimitError,
} from "./errors.js";
import { VERSION } from "./version.js";

const DEFAULT_BASE_URL = "https://api.socialapis.io";
const DEFAULT_TIMEOUT_MS = 30_000;
const USER_AGENT = `socialapis-js/${VERSION}`;

export interface ClientOptions {
  /** API token from https://socialapis.io/auth/signup */
  apiToken: string;
  /** Override base URL (for staging or mock servers). Defaults to https://api.socialapis.io */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeoutMs?: number;
  /** Custom fetch implementation (mainly for testing). Defaults to globalThis.fetch. */
  fetch?: typeof fetch;
}

export class BaseClient {
  protected readonly apiToken: string;
  protected readonly baseUrl: string;
  protected readonly timeoutMs: number;
  protected readonly fetchImpl: typeof fetch;

  constructor(opts: ClientOptions) {
    if (!opts.apiToken) {
      throw new Error(
        "apiToken is required. Get a free key at https://socialapis.io/auth/signup (200 calls/month, no card).",
      );
    }
    this.apiToken = opts.apiToken;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /** Internal: build query string from primary + extra params, dropping nullish values. */
  protected buildParams(
    primary: Record<string, string | number | null | undefined>,
    extra?: Record<string, unknown>,
  ): URLSearchParams {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(primary)) {
      if (v !== null && v !== undefined) params.set(k, String(v));
    }
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v !== null && v !== undefined) params.set(k, String(v));
      }
    }
    return params;
  }

  /** Internal: issue a GET request and return the parsed JSON. Maps HTTP errors to typed exceptions. */
  protected async get<T = Record<string, any>>(path: string, params: URLSearchParams): Promise<T> {
    if (!path.startsWith("/")) {
      throw new Error(`path must start with '/', got: ${path}`);
    }
    const url = `${this.baseUrl}${path}${params.toString() ? `?${params.toString()}` : ""}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          "x-api-token": this.apiToken,
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new APIConnectionError(`Request timed out after ${this.timeoutMs}ms`);
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new APIConnectionError(`Request failed: ${msg}`);
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const body = await safeJson(response);
      const message =
        extractMessage(body) || (await safeText(response)) || response.statusText || "HTTP error";
      const requestId = response.headers.get("x-request-id") ?? undefined;
      const opts = { statusCode: response.status, requestId, body };

      switch (response.status) {
        case 401:
          throw new AuthenticationError(message, opts);
        case 402:
          throw new InsufficientCreditsError(message, opts);
        case 429: {
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
          throw new RateLimitError(message, { ...opts, retryAfterSeconds });
        }
        default:
          if (response.status >= 500) throw new APIServerError(message, opts);
          if (response.status >= 400) throw new BadRequestError(message, opts);
          throw new APIError(message, opts);
      }
    }

    return (await response.json()) as T;
  }
}

async function safeJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const data = await response.clone().json();
    return typeof data === "object" && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.clone().text();
  } catch {
    return "";
  }
}

function extractMessage(body: Record<string, unknown>): string | undefined {
  for (const key of ["error", "message", "detail"] as const) {
    const v = body[key];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "object" && v !== null && "message" in v) {
      const inner = (v as { message: unknown }).message;
      if (typeof inner === "string" && inner.length > 0) return inner;
    }
  }
  return undefined;
}

/** Canonicalize a Facebook page slug or full URL to the API's expected `link` form. */
export function asFacebookUrl(value: string, base = "https://www.facebook.com"): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("identifier is required");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}

/** Canonicalize a Facebook group identifier to the `link` form for the /groups/ endpoints. */
export function asFacebookGroupUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("group identifier is required");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://www.facebook.com/groups/${trimmed.replace(/^\/+/, "")}`;
}

/** Canonicalize an Instagram profile identifier to a profile URL. */
export function asInstagramUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("identifier is required");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://www.instagram.com/${trimmed.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}
