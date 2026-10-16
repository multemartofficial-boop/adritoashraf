// Hand-maintained to mirror supabase/schema.sql. If you later use the Supabase CLI,
// `supabase gen types typescript` can replace this file.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type TestimonialType = "text" | "video";
export type ProjectType = "website" | "saas" | "erp" | "hr" | "other";
export type CardTheme = "sky" | "holo" | "aurum" | "peach" | "violet";
export type Currency = "USD" | "BDT";
export type EmailTemplateType =
  | "booking_received_client"
  | "booking_confirmed_client"
  | "booking_admin_notification"
  | "reminder_client"
  | "cancelled_client"
  | "cancelled_admin"
  | "rescheduled_client"
  | "rescheduled_admin";

export type NavLink = {
  label: string;
  href: string;
};
export type SocialLink = {
  platform: string;
  url: string;
};
export type AboutStat = {
  value: string;
  label: string;
};
export type AboutHeading = {
  accent?: string;
  strong?: string;
  muted?: string;
};
export type SectionKey =
  "portfolio" | "services" | "process" | "testimonials" | "booking" | "faq";
export type SectionText = AboutHeading & { tag?: string; description?: string };
export type SectionTexts = Partial<Record<SectionKey, SectionText>>;

export type AdminRow = {
  user_id: string;
  email: string;
  name: string;
  created_at: string;
};

export type SiteSettingsRow = {
  id: number;
  site_name: string;
  owner_name: string;
  role: string;
  tagline: string;
  hero_intro: string;
  hero_line_1: string;
  hero_line_2: string;
  header_cta_label: string;
  header_cta_href: string;
  nav_links: NavLink[];
  marquee_items: string[];
  about_heading: AboutHeading;
  about_text: string;
  about_stats: AboutStat[];
  contact_email: string;
  phone: string;
  whatsapp: string;
  address: string;
  social_links: SocialLink[];
  footer_text: string;
  seo_title: string;
  seo_description: string;
  seo_focus_keyword: string;
  og_image: string;
  ga4_id: string;
  search_console_verification: string;
  about_quote: string;
  about_quote_author: string;
  default_currency: Currency;
  section_texts: SectionTexts;
  theme: Json;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  title_accent: string;
  slug: string;
  short_description: string;
  problem: string;
  solution: string;
  features: string[];
  tech_stack: string[];
  tags: string[];
  duration: string;
  role: string;
  live_url: string;
  cover_image: string;
  card_theme: CardTheme;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  og_image: string;
  cover_image_alt: string;
  canonical_url: string;
  noindex: boolean;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectImageRow = {
  id: string;
  project_id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  includes: string[];
  timeline: string;
  price_usd: number;
  price_bdt: number;
  icon: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProcessStepRow = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialRow = {
  id: string;
  type: TestimonialType;
  client_name: string;
  client_role: string;
  avatar_url: string;
  content: string;
  rating: number;
  video_url: string;
  poster_url: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type AvailabilityRuleRow = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BlockedDateRow = {
  id: string;
  date: string;
  reason: string;
  created_at: string;
  updated_at: string;
};

export type BookingSettingsRow = {
  id: number;
  slot_duration_minutes: number;
  buffer_minutes: number;
  max_bookings_per_day: number;
  min_notice_hours: number;
  max_days_ahead: number;
  cancel_notice_hours: number;
  timezone: string;
  meeting_link_default: string;
  auto_confirm: boolean;
  updated_at: string;
};

export type BookingRow = {
  id: string;
  reference_code: string;
  client_name: string;
  email: string;
  phone: string;
  service_id: string | null;
  project_type: ProjectType;
  budget_range: string;
  timeline_needed: string;
  project_description: string;
  reference_links: string[];
  attachment_path: string;
  client_timezone: string;
  start_time_utc: string;
  end_time_utc: string;
  status: BookingStatus;
  meeting_link: string;
  admin_notes: string;
  manage_token_hash: string;
  reminder_sent_at: string | null;
  cancelled_at: string | null;
  cancelled_by: "client" | "admin" | null;
  created_at: string;
  updated_at: string;
};

export type EmailTemplateRow = {
  id: string;
  type: EmailTemplateType;
  subject: string;
  body_html: string;
  body_text: string;
  created_at: string;
  updated_at: string;
};

export type AboutMeRow = {
  id: number;
  is_visible: boolean;
  tag: string;
  heading: AboutHeading;
  bio_1: string;
  bio_2: string;
  full_name: string;
  role: string;
  location: string;
  experience_years: string;
  email: string;
  availability_enabled: boolean;
  availability_text: string;
  experience_badge: string;
  skills: string[];
  social_links: SocialLink[];
  primary_cta_label: string;
  primary_cta_href: string;
  cv_url: string;
  image_url: string;
  updated_at: string;
};

export type RedirectRow = {
  id: string;
  from_path: string;
  to_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileRole = "user" | "admin";

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};

export type WebinarStatus = "draft" | "published";

export type WebinarRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  start_at: string | null;
  end_at: string | null;
  live_url: string;
  recording_url: string;
  status: WebinarStatus;
  created_at: string;
  updated_at: string;
};

export type WebinarResourceRow = {
  id: string;
  webinar_id: string;
  title: string;
  file_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WebinarAccessRow = {
  id: string;
  webinar_id: string;
  email: string;
  user_id: string | null;
  granted_at: string;
  granted_by: string | null;
};

export type DashboardStateRow = {
  key: string;
  value: Json;
  updated_at: string;
};

export type RateLimitRow = {
  key: string;
  window_start: string;
  count: number;
};

type ServerManaged = "created_at" | "updated_at";

type Table<
  Row,
  Required extends keyof Row,
  Generated extends keyof Row = never,
> = {
  Row: Row;
  Insert: Pick<Row, Required> &
    Partial<Omit<Row, Required | Generated | ServerManaged>>;
  Update: Partial<Omit<Row, Generated | ServerManaged>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: Table<AdminRow, "user_id" | "email">;
      site_settings: Table<SiteSettingsRow, never>;
      about_me: Table<AboutMeRow, never>;
      projects: Table<ProjectRow, "title" | "slug", "id">;
      project_images: Table<ProjectImageRow, "project_id" | "image_url", "id">;
      services: Table<ServiceRow, "title" | "slug", "id">;
      process_steps: Table<ProcessStepRow, "title", "id">;
      testimonials: Table<TestimonialRow, "client_name", "id">;
      faqs: Table<FaqRow, "question", "id">;
      availability_rules: Table<
        AvailabilityRuleRow,
        "weekday" | "start_time" | "end_time",
        "id"
      >;
      blocked_dates: Table<BlockedDateRow, "date", "id">;
      booking_settings: Table<BookingSettingsRow, never>;
      bookings: Table<
        BookingRow,
        | "reference_code"
        | "client_name"
        | "email"
        | "project_type"
        | "project_description"
        | "start_time_utc"
        | "end_time_utc"
        | "manage_token_hash",
        "id"
      >;
      email_templates: Table<
        EmailTemplateRow,
        "type" | "subject" | "body_html" | "body_text",
        "id"
      >;
      redirects: Table<RedirectRow, "from_path" | "to_path", "id">;
      dashboard_state: Table<DashboardStateRow, "key">;
      rate_limits: Table<RateLimitRow, "key">;
      signup_allowlist: Table<{ email: string; created_at: string }, "email">;
      profiles: Table<ProfileRow, "id", never>;
      webinars: Table<WebinarRow, "title" | "slug", "id">;
      webinar_resources: Table<
        WebinarResourceRow,
        "webinar_id" | "title" | "file_url",
        "id"
      >;
      webinar_access: Table<
        WebinarAccessRow,
        "webinar_id" | "email",
        "id" | "granted_at"
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      has_admin_role: { Args: Record<string, never>; Returns: boolean };
      has_webinar_access: { Args: { p_webinar_id: string }; Returns: boolean };
      hit_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: boolean;
      };
      create_booking: { Args: { p: Json }; Returns: BookingRow };
      reschedule_booking: {
        Args: { p_booking_id: string; p_start: string; p_end: string };
        Returns: BookingRow;
      };
    };
    Enums: {
      booking_status: BookingStatus;
      testimonial_type: TestimonialType;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
