// Public Instagram client. Method coverage mirrors the Python SDK:
// Profiles, Posts, Reels, Highlights, Search, Locations.
//
// Same design as Facebook: thin wrappers, identifier normalisation,
// `extra` query-param forwarding for forward-compat.

import { BaseClient, asInstagramUrl, type ClientOptions } from "./client.js";
import type { ProfileInfo } from "./types.js";

type Extra = Record<string, unknown> | undefined;

export class Instagram extends BaseClient {
  constructor(opts: ClientOptions) {
    super(opts);
  }

  // ====================================================================
  // PROFILES
  // ====================================================================

  /** Return the numeric Instagram user ID for a username or profile URL. */
  getUserId(profile: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/instagram/user/id",
      this.buildParams({ link: asInstagramUrl(profile) }, extra),
    );
  }

  /** Return public Instagram profile metadata as a typed ProfileInfo.
   *  Unwraps the API's `"data"`-keyed envelope before returning. */
  async getProfileDetails(username: string, extra?: Extra): Promise<ProfileInfo> {
    const body = await this.get<Record<string, any>>(
      "/instagram/profile/details",
      this.buildParams({ username }, extra),
    );
    const payload =
      body && typeof body["data"] === "object" && body["data"] !== null ? body["data"] : body;
    return payload as ProfileInfo;
  }

  /** Return recent posts from an Instagram profile. */
  getProfilePosts(username: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/profile/posts", this.buildParams({ username }, extra));
  }

  /** Return Reels for an Instagram profile. Takes numeric user_id (use getUserId first). */
  getProfileReels(userId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/profile/reels", this.buildParams({ user_id: userId }, extra));
  }

  /** Return all Story Highlights for a profile. */
  getProfileHighlights(userId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/profile/highlights", this.buildParams({ user_id: userId }, extra));
  }

  /** Return all stories within a specific Highlight. */
  getHighlightDetails(highlightId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/instagram/highlight/details",
      this.buildParams({ highlight_id: highlightId }, extra),
    );
  }

  // ====================================================================
  // POSTS
  // ====================================================================

  /** Extract the shortcode/ID from any Instagram post URL. */
  getPostId(post: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/post/id", this.buildParams({ link: post }, extra));
  }

  /** Return full Instagram post details: media, engagement, caption, author. */
  getPostDetails(shortcode: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/post/details", this.buildParams({ shortcode }, extra));
  }

  // ====================================================================
  // REELS
  // ====================================================================

  /** Return the trending Reels feed (or chained-author feed via user_id in extra). */
  getReelsFeed(extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/reels/feed", this.buildParams({}, extra));
  }

  /** Return all Reels using a specific audio/music track. */
  getReelsByAudio(audioId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/reels/audio", this.buildParams({ audio_id: audioId }, extra));
  }

  // ====================================================================
  // SEARCH + LOCATIONS
  // ====================================================================

  /** Search Instagram for popular results (users, hashtags, places). */
  search(keyword: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/instagram/search", this.buildParams({ keyword }, extra));
  }

  /** Return posts tagged at a specific Instagram location. Pass `tab: "ranked"` or `"recent"`. */
  getLocationPosts(locationId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/instagram/location/posts",
      this.buildParams({ location_id: locationId }, extra),
    );
  }

  /** Return Instagram locations near a given location. */
  getNearbyLocations(locationId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/instagram/location/nearby",
      this.buildParams({ location_id: locationId }, extra),
    );
  }
}
