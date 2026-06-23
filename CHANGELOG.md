# Changelog

All notable changes to this project will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — Unreleased

Initial release. Full coverage of the SocialAPIs.io public REST surface in TypeScript/JavaScript — mirrors the Python SDK (`socialapis-sdk` on PyPI).

### Added — Facebook client

**Pages**: `getPageId`, `getPageInfo`, `getPagePosts`, `getPageReels`, `getPageVideos`

**Groups**: `getGroupId`, `getGroupDetails`, `getGroupMetadata`, `getGroupPosts`, `getGroupVideos`

**Posts**: `getPostId`, `getPostDetails`, `getPostDetailsExtended`, `getPostComments`, `getCommentReplies`, `getPostAttachments`, `getVideoPostDetails`

**Search**: `searchPages`, `searchPeople`, `searchLocations`, `searchPosts`, `searchVideos`

**Meta Ads Library**: `getAdsCountries`, `searchAds`, `getAdsPageDetails`, `getAdArchiveDetails`, `searchAdsByKeywords`

**Marketplace**: `searchMarketplace`, `getListingDetails`, `getSellerDetails`, `getMarketplaceCategories`, `getCityCoordinates`, `searchVehicles`, `searchRentals`

**Media**: `downloadMedia`

### Added — Instagram client

**Profiles**: `getUserId`, `getProfileDetails`, `getProfilePosts`, `getProfileReels`, `getProfileHighlights`, `getHighlightDetails`

**Posts**: `getPostId`, `getPostDetails`

**Reels**: `getReelsFeed`, `getReelsByAudio`

**Search + Locations**: `search`, `getLocationPosts`, `getNearbyLocations`

### Added — Account client

Free calls — don't consume credits.

`getUsage`, `getTopUps`, `getLimits`

### Added — Infrastructure

- Typed exception hierarchy: `SocialAPIsError`, `APIError`, `AuthenticationError`, `InsufficientCreditsError`, `RateLimitError`, `BadRequestError`, `APIServerError`, `APIConnectionError`
- TypeScript response interfaces with real API field names: `PageInfo`, `GroupInfo`, `ProfileInfo` (verified against the live API 2026-06-22)
- Migration aliases `FacebookScraper`, `InstagramScraper` — exact references to `Facebook` / `Instagram`
- Identifier normalisation — pass a slug or full URL; SDK coerces to API-expected form
- `extra` kwargs pass-through on every method — forward-compatible when API adds filters
- No `limit` parameter — cursor-based pagination via response body
- Per-endpoint envelope handling (FB pages wrap under `"0"`, IG profiles under `"data"`, FB groups have no wrapper)

### Added — Tooling

- Build: `tsup` (dual ESM + CJS + types output)
- Lint: `eslint` with `@typescript-eslint`
- Format: `prettier`
- Type check: `tsc --noEmit` (strict mode)
- Tests: `vitest` with mocked `fetch` (no live API calls in CI)
- CI: Node 18, 20, 22 matrix
- Release: npm publish on `v*.*.*` tag with provenance attestation
- Works in: Node 18+, browsers, Bun, Deno (all platforms with native `fetch`)
