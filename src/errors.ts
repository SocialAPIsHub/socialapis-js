// Typed exception hierarchy mirrors the Python SDK (socialapis-sdk).
// Catch broadly (`SocialAPIsError`) or narrowly (`RateLimitError`,
// `AuthenticationError`, `InsufficientCreditsError`) for retry/UX
// dispatch.

export class SocialAPIsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocialAPIsError";
    // Maintain proper prototype chain when targeting older transpilers
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Network failure, timeout, or non-JSON response from the API. Safe to retry with backoff. */
export class APIConnectionError extends SocialAPIsError {
  constructor(message: string) {
    super(message);
    this.name = "APIConnectionError";
  }
}

export interface APIErrorOptions {
  statusCode: number;
  requestId?: string;
  body?: Record<string, unknown>;
}

/** Base class for any HTTP error response from the API. */
export class APIError extends SocialAPIsError {
  readonly statusCode: number;
  readonly requestId?: string;
  readonly body: Record<string, unknown>;

  constructor(message: string, opts: APIErrorOptions) {
    super(message);
    this.name = "APIError";
    this.statusCode = opts.statusCode;
    this.requestId = opts.requestId;
    this.body = opts.body ?? {};
  }
}

/** 4xx (excluding 401 / 402 / 429). Client-side mistake — NOT safe to retry without fixing input. */
export class BadRequestError extends APIError {
  constructor(message: string, opts: APIErrorOptions) {
    super(message, opts);
    this.name = "BadRequestError";
  }
}

/** 401 — invalid or missing API token. Retrying won't help; fix the token. */
export class AuthenticationError extends APIError {
  constructor(message: string, opts: APIErrorOptions) {
    super(message, opts);
    this.name = "AuthenticationError";
  }
}

/** 402 — credit balance exhausted. Retrying after refill / upgrade works. */
export class InsufficientCreditsError extends APIError {
  constructor(message: string, opts: APIErrorOptions) {
    super(message, opts);
    this.name = "InsufficientCreditsError";
  }
}

export interface RateLimitErrorOptions extends APIErrorOptions {
  retryAfterSeconds?: number;
}

/** 429 — request rate exceeded. Retrying after `retryAfterSeconds` is safe + idempotent. */
export class RateLimitError extends APIError {
  readonly retryAfterSeconds?: number;

  constructor(message: string, opts: RateLimitErrorOptions) {
    super(message, opts);
    this.name = "RateLimitError";
    this.retryAfterSeconds = opts.retryAfterSeconds;
  }
}

/** 5xx — the API failed. Safe to retry with exponential backoff. */
export class APIServerError extends APIError {
  constructor(message: string, opts: APIErrorOptions) {
    super(message, opts);
    this.name = "APIServerError";
  }
}
