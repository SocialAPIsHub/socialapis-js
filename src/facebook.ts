// Public Facebook client. Method coverage mirrors the Python SDK:
// Pages, Groups, Posts, Search, Ads Library, Marketplace, Media.
//
// Each method is a thin wrapper that:
//   1. Normalises the primary identifier (slug ↔ URL)
//   2. Forwards arbitrary `extra` query params for forward-compat
//   3. Issues the HTTP call, returns parsed JSON
//
// Pagination: cursor-based via the response body. No `limit` parameter
// — the API decides page size. Pass the cursor back via `extra` on the
// next call.

import { BaseClient, asFacebookGroupUrl, asFacebookUrl, type ClientOptions } from "./client.js";
import type { GroupInfo, PageInfo } from "./types.js";

type Extra = Record<string, unknown> | undefined;

export class Facebook extends BaseClient {
  constructor(opts: ClientOptions) {
    super(opts);
  }

  // ====================================================================
  // PAGES
  // ====================================================================

  /** Return the numeric Facebook Page ID for a given URL or slug. */
  getPageId(page: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/pages/id", this.buildParams({ link: asFacebookUrl(page) }, extra));
  }

  /** Return public metadata for a Facebook Page as a typed PageInfo.
   *  Unwraps the API's `"0"`-keyed envelope before returning. */
  async getPageInfo(page: string, extra?: Extra): Promise<PageInfo> {
    const body = await this.get<Record<string, any>>(
      "/facebook/pages/details",
      this.buildParams({ link: asFacebookUrl(page) }, extra),
    );
    // The API wraps the payload under string key "0". Fall back to raw
    // body if upstream ever drops the envelope.
    const payload = body && typeof body["0"] === "object" && body["0"] !== null ? body["0"] : body;
    return payload as PageInfo;
  }

  /** Return recent posts from a Facebook Page (cursor-paginated). */
  getPagePosts(page: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/pages/posts",
      this.buildParams({ link: asFacebookUrl(page) }, extra),
    );
  }

  /** Return Reels (short videos) from a Facebook Page. */
  getPageReels(page: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/pages/reels",
      this.buildParams({ link: asFacebookUrl(page) }, extra),
    );
  }

  /** Return long-form videos from a Facebook Page. */
  getPageVideos(page: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/pages/videos",
      this.buildParams({ link: asFacebookUrl(page) }, extra),
    );
  }

  // ====================================================================
  // GROUPS
  // ====================================================================

  /** Return the numeric Facebook Group ID. */
  getGroupId(group: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/groups/id",
      this.buildParams({ link: asFacebookGroupUrl(group) }, extra),
    );
  }

  /** Return rich metadata for a Facebook Group. NO envelope on this endpoint. */
  async getGroupDetails(group: string, extra?: Extra): Promise<GroupInfo> {
    const body = await this.get<Record<string, any>>(
      "/facebook/groups/details",
      this.buildParams({ link: asFacebookGroupUrl(group) }, extra),
    );
    return body as GroupInfo;
  }

  /** Return lightweight Group metadata (name, id, url, image). Cheaper than getGroupDetails. */
  getGroupMetadata(group: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/groups/metadata",
      this.buildParams({ link: asFacebookGroupUrl(group) }, extra),
    );
  }

  /** Return recent posts from a Facebook Group. */
  getGroupPosts(group: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/groups/posts",
      this.buildParams({ link: asFacebookGroupUrl(group) }, extra),
    );
  }

  /** Return videos posted to a Facebook Group. Takes a numeric group_id. */
  getGroupVideos(groupId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/groups/videos", this.buildParams({ group_id: groupId }, extra));
  }

  // ====================================================================
  // POSTS
  // ====================================================================

  /** Extract the numeric Facebook post ID from a post URL. */
  getPostId(post: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/id", this.buildParams({ link: post }, extra));
  }

  /** Return full details of a Facebook post (reactions, media, author). */
  getPostDetails(post: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/details", this.buildParams({ link: post }, extra));
  }

  /** Return extended post details (views, video URLs, music info, author verification). */
  getPostDetailsExtended(post: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/details/extended", this.buildParams({ link: post }, extra));
  }

  /** Return comments on a Facebook post or reel. Pass `include_reply_info: "true"` via extra
   *  for reply cursors. */
  getPostComments(post: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/comments", this.buildParams({ link: post }, extra));
  }

  /** Return replies to a specific comment. Both inputs come from getPostComments. */
  getCommentReplies(
    commentFeedbackId: string,
    expansionToken: string,
    extra?: Extra,
  ): Promise<Record<string, any>> {
    return this.get(
      "/facebook/posts/comments/replies",
      this.buildParams(
        { comment_feedback_id: commentFeedbackId, expansion_token: expansionToken },
        extra,
      ),
    );
  }

  /** Return all media attachments (photos, videos) from a post. */
  getPostAttachments(postId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/attachments", this.buildParams({ post_id: postId }, extra));
  }

  /** Return title, reactions, and play counts for a video post. */
  getVideoPostDetails(videoId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/posts/video", this.buildParams({ video_id: videoId }, extra));
  }

  // ====================================================================
  // SEARCH
  // ====================================================================

  /** Search Facebook pages by keyword. Geo-filter via `location_id` in extra. */
  searchPages(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/search/pages", this.buildParams({ query }, extra));
  }

  /** Search Facebook profiles by keyword. */
  searchPeople(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/search/people", this.buildParams({ query }, extra));
  }

  /** Search Facebook for locations matching a keyword. */
  searchLocations(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/search/locations", this.buildParams({ query }, extra));
  }

  /** Search Facebook posts by keyword, with optional location + time filters. */
  searchPosts(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/search/posts", this.buildParams({ query }, extra));
  }

  /** Search Facebook videos by keyword, with optional recency / live filters. */
  searchVideos(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/search/videos", this.buildParams({ query }, extra));
  }

  // ====================================================================
  // META ADS LIBRARY
  // ====================================================================

  /** Return all country codes supported by the Meta Ads Library. */
  getAdsCountries(extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/ads/countries", this.buildParams({}, extra));
  }

  /** Search ads in the Meta Ad Library by keyword. */
  searchAds(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/ads/search", this.buildParams({ query }, extra));
  }

  /** Return Ads-Library metadata for a Facebook Page. */
  getAdsPageDetails(pageId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/ads/page-details", this.buildParams({ page_id: pageId }, extra));
  }

  /** Return detailed info for a specific archived ad: creative, spend, impressions. */
  getAdArchiveDetails(
    adArchiveId: string,
    pageId: string,
    extra?: Extra,
  ): Promise<Record<string, any>> {
    return this.get(
      "/facebook/ads/archive-details",
      this.buildParams({ ad_archive_id: adArchiveId, page_id: pageId }, extra),
    );
  }

  /** Search ads in the Ad Library by keyword + country. */
  searchAdsByKeywords(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/ads/keywords", this.buildParams({ query }, extra));
  }

  // ====================================================================
  // MARKETPLACE
  // ====================================================================

  /** Search Facebook Marketplace listings. */
  searchMarketplace(query: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/marketplace/search", this.buildParams({ query }, extra));
  }

  /** Return full info for a Marketplace listing. */
  getListingDetails(listingId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/marketplace/listing",
      this.buildParams({ listing_id: listingId }, extra),
    );
  }

  /** Return seller profile, ratings, reviews, and badges from Marketplace. */
  getSellerDetails(sellerId: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get(
      "/facebook/marketplace/seller",
      this.buildParams({ seller_id: sellerId }, extra),
    );
  }

  /** Return all Marketplace categories with SEO URLs and IDs. */
  getMarketplaceCategories(extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/marketplace/categories", this.buildParams({}, extra));
  }

  /** Resolve a city name to GPS coordinates for use as a Marketplace location filter. */
  getCityCoordinates(city: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/marketplace/city-coordinates", this.buildParams({ city }, extra));
  }

  /** Search Marketplace vehicle listings. Required filters via extra: lat/lng. */
  searchVehicles(extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/marketplace/vehicles", this.buildParams({}, extra));
  }

  /** Search Marketplace rental-property listings. */
  searchRentals(extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/marketplace/rentals", this.buildParams({}, extra));
  }

  // ====================================================================
  // MEDIA
  // ====================================================================

  /** Resolve a Facebook video/photo URL to a direct downloadable media URL. */
  downloadMedia(url: string, extra?: Extra): Promise<Record<string, any>> {
    return this.get("/facebook/media/download", this.buildParams({ url }, extra));
  }
}
