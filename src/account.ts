// Account-level endpoints — usage, credits, rate-limit info. Different
// from the Facebook / Instagram clients because these calls are about
// YOUR socialapis.io account, not scraped data. All free — don't
// consume credits.

import { BaseClient, type ClientOptions } from "./client.js";

export class Account extends BaseClient {
  constructor(opts: ClientOptions) {
    super(opts);
  }

  /** Current credit balance, usage, plan, billing period. Free — no credit charged. */
  getUsage(): Promise<Record<string, any>> {
    return this.get("/usage", new URLSearchParams());
  }

  /** Auto top-up settings + recent history + lifetime spend. Free. */
  getTopUps(): Promise<Record<string, any>> {
    return this.get("/usage/top-ups", new URLSearchParams());
  }

  /** Your plan's rate limit, concurrent-task cap, allowed top-up packages. Free. */
  getLimits(): Promise<Record<string, any>> {
    return this.get("/usage/limits", new URLSearchParams());
  }
}
