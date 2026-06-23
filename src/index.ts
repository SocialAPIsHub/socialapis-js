// socialapis-sdk — TypeScript/JavaScript SDK for Facebook + Instagram public data.
//
// Quick start:
//
//     import { Facebook, Instagram } from "socialapis-sdk";
//
//     const fb = new Facebook({ apiToken: "..." });
//     const page = await fb.getPageInfo("EngenSA");
//     console.log(page.title, page.followers_count);
//
//     const ig = new Instagram({ apiToken: "..." });
//     const profile = await ig.getProfileDetails("instagram");
//     console.log(profile.username, profile.followers_count);
//
// Migration aliases for users coming from the abandoned scrapers:
//
//     import { FacebookScraper, InstagramScraper } from "socialapis-sdk";
//
// Free 200 calls / month: https://socialapis.io/auth/signup
// Full docs: https://docs.socialapis.io

export { Account } from "./account.js";
export type { ClientOptions } from "./client.js";
export {
  APIConnectionError,
  APIError,
  APIServerError,
  AuthenticationError,
  BadRequestError,
  InsufficientCreditsError,
  RateLimitError,
  SocialAPIsError,
} from "./errors.js";
export { Facebook } from "./facebook.js";
export { Instagram } from "./instagram.js";
export type { GroupInfo, PageInfo, ProfileInfo } from "./types.js";
export { VERSION } from "./version.js";

// ---------------------------------------------------------------------------
// Migration aliases
//
// `FacebookScraper` / `InstagramScraper` are exact references to `Facebook`
// / `Instagram`. They exist so devs migrating from popular abandoned
// libraries can swap a single import line and keep running.
// ---------------------------------------------------------------------------

import { Facebook } from "./facebook.js";
import { Instagram } from "./instagram.js";

export const FacebookScraper = Facebook;
export const InstagramScraper = Instagram;
