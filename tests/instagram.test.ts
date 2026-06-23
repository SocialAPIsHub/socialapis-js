import { describe, expect, it } from "vitest";
import { Instagram, InstagramScraper } from "../src/index.js";

// Mirrors the real envelope: payload under "data".
const SAMPLE_PROFILE_PAYLOAD = {
  id: "25025320",
  pk: "25025320",
  fbid: "17841400039600391",
  username: "instagram",
  full_name: "Instagram",
  biography: "Discover what's new on Instagram",
  followers_count: 685_000_000,
  following_count: 229,
  media_count: 7_900,
  is_verified: true,
  is_private: false,
  profile_pic_url: "https://scontent.cdninstagram.com/profile.jpg",
};
const SAMPLE_PROFILE_RESPONSE = {
  success: true,
  data: SAMPLE_PROFILE_PAYLOAD,
  message: "OK",
  meta: { statusCode: 200 },
};

function mockFetch(handler: (url: string, init: RequestInit) => Response) {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
    Promise.resolve(handler(String(input), init ?? {}));
}

describe("Instagram.getProfileDetails", () => {
  it("returns typed ProfileInfo with real field names", async () => {
    const fetchImpl = mockFetch(
      () =>
        new Response(JSON.stringify(SAMPLE_PROFILE_RESPONSE), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    const ig = new Instagram({ apiToken: "t", fetch: fetchImpl });
    const profile = await ig.getProfileDetails("instagram");
    expect(profile.id).toBe("25025320");
    expect(profile.username).toBe("instagram");
    expect(profile.full_name).toBe("Instagram");
    expect(profile.followers_count).toBe(685_000_000);
    expect(profile.media_count).toBe(7_900);
    expect(profile.is_verified).toBe(true);
  });
});

describe("Instagram endpoint routing", () => {
  it("getUserId normalises username to URL", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ id: "25025320" }), { status: 200 });
    });
    const ig = new Instagram({ apiToken: "t", fetch: fetchImpl });
    await ig.getUserId("instagram");
    expect(capturedUrl).toContain(encodeURIComponent("https://www.instagram.com/instagram"));
  });

  it("search hits /instagram/search with keyword param", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ users: [] }), { status: 200 });
    });
    const ig = new Instagram({ apiToken: "t", fetch: fetchImpl });
    await ig.search("travel");
    expect(capturedUrl).toContain("/instagram/search");
    expect(capturedUrl).toContain("keyword=travel");
  });

  it("getLocationPosts forwards tab kwarg", async () => {
    let capturedUrl = "";
    const fetchImpl = mockFetch((url) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ posts: [] }), { status: 200 });
    });
    const ig = new Instagram({ apiToken: "t", fetch: fetchImpl });
    await ig.getLocationPosts("454547536", { tab: "ranked" });
    expect(capturedUrl).toContain("location_id=454547536");
    expect(capturedUrl).toContain("tab=ranked");
  });
});

describe("InstagramScraper alias", () => {
  it("InstagramScraper === Instagram", () => {
    expect(InstagramScraper).toBe(Instagram);
  });
});
