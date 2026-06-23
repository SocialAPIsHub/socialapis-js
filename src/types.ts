// Response types for the headline endpoints. Field names match the
// LIVE API exactly (verified against a real token, 2026-06-22).
// Anything else the API returns is preserved on the response object —
// just access it by key.

/** `Facebook.getPageInfo()` — `GET /facebook/pages/details` response.
 *  The API wraps this payload under string key `"0"` in the envelope;
 *  the SDK unwraps before returning. */
export interface PageInfo {
  // Identifiers
  ad_page_id?: string;
  user_id?: string;
  // Display
  title?: string;
  url?: string;
  category?: string[] | string;
  status?: string;
  // Content
  bio?: string;
  description?: string;
  // Contact
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  maps_address?: string;
  // Engagement (API exposes both _count int and _display string)
  followers_count?: number;
  followers_display?: string;
  likes_count?: number;
  likes_display?: string;
  // Media
  image?: string;
  image_alt?: string;
  // Ratings
  rating?: string;
  rating_count?: number;
  rating_overall?: string;
  // Business
  business_hours?: string;
  business_price?: string;
  business_services?: string;
  is_business_page_active?: boolean;
  confirmed_owner_label?: string;
  // Linked socials
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  pinterest?: string;
  telegram?: string;
  youtube?: string;
  // Forward-compat: any extra fields the API returns are preserved here
  [key: string]: unknown;
}

/** `Facebook.getGroupDetails()` — `GET /facebook/groups/details` response.
 *  Note: this endpoint has NO envelope wrapper — payload sits at the top
 *  level alongside `message` and `meta`. */
export interface GroupInfo {
  group_id?: string;
  group_member_count?: string;
  group_total_members_info_text?: string;
  group_new_members_info_text?: string;
  description_text?: string;
  privacy_info_text?: Record<string, unknown>;
  created_time?: number;
  group_rules?: unknown[];
  group_history?: Record<string, unknown>;
  admin_tags?: unknown[];
  group_locations?: unknown[];
  number_of_posts_in_last_day?: number;
  number_of_posts_in_last_month?: number;
  [key: string]: unknown;
}

/** `Instagram.getProfileDetails()` — `GET /instagram/profile/details` response.
 *  The API wraps the payload under `"data"` in the envelope; SDK unwraps. */
export interface ProfileInfo {
  // Identifiers
  id?: string;
  pk?: string;
  fbid?: string;
  // Display
  username?: string;
  full_name?: string;
  biography?: string;
  category_name?: string;
  // Media URLs
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  external_url?: string;
  external_url_linkshimmed?: string;
  // Counts
  followers_count?: number;
  following_count?: number;
  media_count?: number;
  total_clips_count?: number;
  highlight_reel_count?: number;
  mutual_followers_count?: number;
  // Flags
  is_private?: boolean;
  is_verified?: boolean;
  is_business_account?: boolean;
  is_professional_account?: boolean;
  is_memorialized?: boolean;
  is_unpublished?: boolean;
  is_embeds_disabled?: boolean;
  is_joined_recently?: boolean;
  is_regulated_c18?: boolean;
  account_type?: number;
  // Features
  has_clips?: boolean;
  has_guides?: boolean;
  has_channel?: boolean;
  has_ar_effects?: boolean;
  // Business contact
  business_category_name?: string;
  business_email?: string;
  business_phone_number?: string;
  business_contact_method?: string;
  address_street?: string;
  city_name?: string;
  zip?: string;
  // Misc
  pronouns?: unknown[];
  account_badges?: unknown[];
  [key: string]: unknown;
}
