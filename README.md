# socialapis-sdk — TypeScript/JavaScript SDK for Facebook + Instagram public data

[![npm](https://img.shields.io/npm/v/socialapis-sdk?cacheSeconds=300&label=npm&logo=npm)](https://www.npmjs.com/package/socialapis-sdk)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-blue.svg)](https://nodejs.org)

Modern TypeScript/JavaScript client for the [socialapis.io](https://socialapis.io)
REST API. Same surface as the Python [`socialapis-sdk`](https://pypi.org/project/socialapis-sdk/) — no OAuth, no scraper maintenance, runs anywhere `fetch` works (Node 18+, browsers, Bun, Deno).

```bash
npm install socialapis-sdk
```

```ts
import { Facebook, Instagram } from "socialapis-sdk";

const fb = new Facebook({ apiToken: "..." });
const page = await fb.getPageInfo("EngenSA");
console.log(page.title, page.followers_count, page.category);

const ig = new Instagram({ apiToken: "..." });
const profile = await ig.getProfileDetails("instagram");
console.log(profile.username, profile.followers_count);
```

**[Get a free API token →](https://socialapis.io/auth/signup)** — 200 calls/month, no credit card

## One-line migration

If you've been using stale Facebook/Instagram scraper packages, the migration aliases keep your import line greppable:

```ts
import { FacebookScraper, InstagramScraper } from "socialapis-sdk";

const fb = new FacebookScraper({ apiToken: "..." });
const page = await fb.getPageInfo("EngenSA");
```

`FacebookScraper` and `InstagramScraper` are exact aliases of `Facebook` and `Instagram` — identical behavior, identical types, just different names.

## What's covered (v0.1.0)

### Facebook client

**Pages**: `getPageId`, `getPageInfo` → `PageInfo`, `getPagePosts`, `getPageReels`, `getPageVideos`

**Groups**: `getGroupId`, `getGroupDetails` → `GroupInfo`, `getGroupMetadata`, `getGroupPosts`, `getGroupVideos`

**Posts**: `getPostId`, `getPostDetails`, `getPostDetailsExtended`, `getPostComments`, `getCommentReplies`, `getPostAttachments`, `getVideoPostDetails`

**Search**: `searchPages`, `searchPeople`, `searchLocations`, `searchPosts`, `searchVideos`

**Meta Ads Library**: `getAdsCountries`, `searchAds`, `getAdsPageDetails`, `getAdArchiveDetails`, `searchAdsByKeywords`

**Marketplace**: `searchMarketplace`, `getListingDetails`, `getSellerDetails`, `getMarketplaceCategories`, `getCityCoordinates`, `searchVehicles`, `searchRentals`

**Media**: `downloadMedia`

### Instagram client

**Profiles**: `getUserId`, `getProfileDetails` → `ProfileInfo`, `getProfilePosts`, `getProfileReels`, `getProfileHighlights`, `getHighlightDetails`

**Posts**: `getPostId`, `getPostDetails`

**Reels**: `getReelsFeed`, `getReelsByAudio`

**Search + Locations**: `search`, `getLocationPosts`, `getNearbyLocations`

### Account client

Free calls — don't consume credits.

`getUsage`, `getTopUps`, `getLimits`

## Pagination — no `limit`, cursor-based

Every list endpoint lets the API decide page size. To paginate, take the cursor from the response and pass it back as an extra param:

```ts
const fb = new Facebook({ apiToken: "..." });

let result = await fb.getPagePosts("EngenSA");
const posts = [...result.posts];
let cursor = result.next_cursor;

while (cursor) {
  result = await fb.getPagePosts("EngenSA", { cursor });
  posts.push(...result.posts);
  cursor = result.next_cursor;
}
```

## Forward-compat via `extra`

Every method accepts arbitrary extra params and forwards them as query string. If the API adds a new filter, you can use it the same day — no SDK release needed:

```ts
await fb.searchAds("fitness", {
  country: "US",
  activeStatus: "Active",
  some_new_filter: "x",
});
// → ?query=fitness&country=US&activeStatus=Active&some_new_filter=x
```

## Error handling

```ts
import {
  Facebook,
  AuthenticationError, // 401 — bad token
  InsufficientCreditsError, // 402 — out of credits
  RateLimitError, // 429 — slow down (carries retryAfterSeconds)
  BadRequestError, // 4xx — bad input
  APIServerError, // 5xx — retry safely
  APIConnectionError, // network — retry with backoff
} from "socialapis-sdk";

const fb = new Facebook({ apiToken: "..." });
try {
  const page = await fb.getPageInfo("EngenSA");
} catch (err) {
  if (err instanceof RateLimitError) {
    await new Promise((r) => setTimeout(r, (err.retryAfterSeconds ?? 5) * 1000));
  } else if (err instanceof InsufficientCreditsError) {
    console.error("Out of credits. Upgrade at https://socialapis.io/pricing");
  } else if (err instanceof AuthenticationError) {
    console.error("Bad token. Get one at https://socialapis.io/auth/signup");
  } else {
    throw err;
  }
}
```

Every typed exception carries `.statusCode`, `.requestId`, and `.body` for debugging. The `requestId` is what we log on our backend — paste it into a support email and we can find the exact call.

## Configuration

```ts
new Facebook({
  apiToken: "...",
  baseUrl: "https://api.socialapis.io", // for staging or local mock servers
  timeoutMs: 30_000, // request timeout, default 30s
  fetch: customFetch, // bring your own fetch impl (testing, retries)
});
```

## Browser / Bun / Deno

Works anywhere native `fetch` is available:

- **Node**: 18+
- **Browsers**: modern (Chrome 89+, Firefox 90+, Safari 14+)
- **Bun**: any version
- **Deno**: any version

No `node:` imports, no polyfills, no Node-only dependencies. ESM-first with a CJS fallback.

## Pricing

| Tier | Calls / month | Price |
|---|---|---|
| **Free** | 200 | $0 |
| Pro | 1,500 | $4.99 |
| Ultra | 30,000 | $49 |
| Mega | 120,000 | $179 |
| Enterprise | Custom | [Contact us](https://socialapis.io/contact-us) |

One credit per successful response. Failed calls (4xx caused by bad input) don't consume credits.

## Other languages

- **Python**: [`socialapis-sdk`](https://pypi.org/project/socialapis-sdk/) on PyPI — same surface
- **Go**: [`github.com/SocialAPIsHub/socialapis-go`](https://github.com/SocialAPIsHub/socialapis-go)
- **PHP**: not available yet — [tell us if you need it](https://socialapis.io/contact-us)
- Any language right now: hit the REST API directly with `curl` / `fetch`. Docs at [docs.socialapis.io](https://docs.socialapis.io).

## Support

- Docs: [docs.socialapis.io](https://docs.socialapis.io)
- Issues: [github.com/SocialAPIsHub/socialapis-js/issues](https://github.com/SocialAPIsHub/socialapis-js/issues)
- Email: [support@socialapis.io](mailto:support@socialapis.io)
- Telegram (fastest): [t.me/socialapis](https://t.me/socialapis)

## License

MIT — see [LICENSE](LICENSE).
