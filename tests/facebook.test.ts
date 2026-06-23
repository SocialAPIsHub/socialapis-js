// All HTTP calls mocked via a fake `fetch`. No live API calls in CI.

import { describe, expect, it } from "vitest";
import {
  AuthenticationError,
  BadRequestError,
  Facebook,
  FacebookScraper,
  InsufficientCreditsError,
  RateLimitError,
} from "../src/index.js";

// Mirrors the real envelope: payload under string key "0".
const SAMPLE_PAGE_PAYLOAD = {
  ad_page_id: "206441436112629",
  user_id: "100064888920170",
  title: "Engen SA | Cape Town",
  url: "https://www.facebook.com/EngenSA",
  category: ["Petroleum Service"],
  bio: "Energy that drives Africa forward.",
  followers_count: 119_000,
  likes_count: 1_234_567,
  image: "https://scontent.fbcdn.net/profile.jpg",
  is_business_page_active: false,
};
const SAMPLE_PAGE_RESPONSE = {
  "0": SAMPLE_PAGE_PAYLOAD,
  message: "Request completed successfully with status: OK (200)",
  meta: { statusCode: 200, creditsCharged: 1 },
};

function mockFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return Promise.resolve(handler(String(input), init ?? {}));
  };
}

describe("Facebook.getPageInfo", () => {
  it("returns a typed PageInfo with real field names", async () => {
    const fetchImpl = mockFetch(() => {
      return new Response(JSON.stringify(SAMPLE_PAGE_RESPONSE), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    const page = await fb.getPageInfo("EngenSA");
    expect(page.ad_page_id).toBe("206441436112629");
    expect(page.title).toBe("Engen SA | Cape Town");
    expect(page.followers_count).toBe(119_000);
    expect(page.likes_count).toBe(1_234_567);
    expect(page.is_business_page_active).toBe(false);
  });

  it("normalises a bare slug to the canonical Facebook URL", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify(SAMPLE_PAGE_RESPONSE), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.getPageInfo("EngenSA");
    expect(capturedUrl).toContain("link=https%3A%2F%2Fwww.facebook.com%2FEngenSA");
  });

  it("accepts a full URL unchanged", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify(SAMPLE_PAGE_RESPONSE), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.getPageInfo("https://www.facebook.com/EngenSA");
    expect(capturedUrl).toContain("link=https%3A%2F%2Fwww.facebook.com%2FEngenSA");
  });

  it("sends the x-api-token header", async () => {
    let capturedToken = "";
    const fetchImpl = mockFetch((_url, init) => {
      const headers = init.headers as Record<string, string>;
      capturedToken = headers["x-api-token"] ?? "";
      return new Response(JSON.stringify(SAMPLE_PAGE_RESPONSE), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "my_secret", fetch: fetchImpl });
    await fb.getPageInfo("EngenSA");
    expect(capturedToken).toBe("my_secret");
  });

  it("throws if apiToken is empty", () => {
    expect(() => new Facebook({ apiToken: "" })).toThrow(/apiToken is required/);
  });
});

describe("Facebook endpoint routing", () => {
  it("getPagePosts hits /facebook/pages/posts", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ posts: [] }), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.getPagePosts("EngenSA");
    expect(capturedUrl).toContain("/facebook/pages/posts");
  });

  it("getGroupId normalises bare slug to /groups/ URL", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ id: "1" }), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.getGroupId("gieldagryplanszowe");
    expect(capturedUrl).toContain(encodeURIComponent("https://www.facebook.com/groups/gieldagryplanszowe"));
  });

  it("searchAds forwards extra query params", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ ads: [] }), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.searchAds("fitness", { country: "US", activeStatus: "Active" });
    expect(capturedUrl).toContain("query=fitness");
    expect(capturedUrl).toContain("country=US");
    expect(capturedUrl).toContain("activeStatus=Active");
  });

  it("extra kwargs are forward-compatible (future params just work)", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ posts: [] }), { status: 200 });
    });
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await fb.getPagePosts("EngenSA", { end_cursor: "abc123", some_future_param: "x" });
    expect(capturedUrl).toContain("end_cursor=abc123");
    expect(capturedUrl).toContain("some_future_param=x");
  });
});

describe("Facebook error mapping", () => {
  it("401 → AuthenticationError", async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(JSON.stringify({ error: "Invalid API token" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
    );
    const fb = new Facebook({ apiToken: "bad", fetch: fetchImpl });
    await expect(fb.getPageInfo("EngenSA")).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("402 → InsufficientCreditsError", async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(JSON.stringify({ error: "Out of credits" }), {
          status: 402,
          headers: { "content-type": "application/json" },
        }),
    );
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await expect(fb.getPageInfo("EngenSA")).rejects.toBeInstanceOf(InsufficientCreditsError);
  });

  it("429 → RateLimitError with retryAfterSeconds", async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { "content-type": "application/json", "retry-after": "12" },
        }),
    );
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    try {
      await fb.getPageInfo("EngenSA");
      throw new Error("expected RateLimitError");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfterSeconds).toBe(12);
    }
  });

  it("400 → BadRequestError", async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(JSON.stringify({ error: "Bad input" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
    );
    const fb = new Facebook({ apiToken: "t", fetch: fetchImpl });
    await expect(fb.getPageInfo("EngenSA")).rejects.toBeInstanceOf(BadRequestError);
  });
});

describe("Migration aliases", () => {
  it("FacebookScraper === Facebook (exact identity)", () => {
    expect(FacebookScraper).toBe(Facebook);
  });

  it("FacebookScraper instantiates like Facebook", () => {
    const fb = new FacebookScraper({ apiToken: "t" });
    expect(fb).toBeInstanceOf(Facebook);
  });
});
