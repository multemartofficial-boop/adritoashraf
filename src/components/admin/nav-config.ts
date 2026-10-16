import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarOff,
  Clock,
  FolderKanban,
  Gift,
  HelpCircle,
  Images,
  LayoutDashboard,
  ListOrdered,
  Mail,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = {
  label: string;
  items: NavItem[];
  statusFilter?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Content",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Gift Pages", href: "/admin/landing-pages", icon: Gift },
      { label: "Services", href: "/admin/services", icon: Briefcase },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquareQuote,
      },
      { label: "How I Work", href: "/admin/process", icon: ListOrdered },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "About Me", href: "/admin/about-me", icon: UserRound },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Bookings",
    statusFilter: true,
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
      { label: "Availability", href: "/admin/availability", icon: Clock },
      {
        label: "Blocked Dates",
        href: "/admin/blocked-dates",
        icon: CalendarOff,
      },
      { label: "Email Templates", href: "/admin/email-templates", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Redirects", href: "/admin/redirects", icon: ArrowRightLeft },
      { label: "Media Library", href: "/admin/media", icon: Images },
      {
        label: "Account & Security",
        href: "/admin/account",
        icon: ShieldCheck,
      },
    ],
  },
];

export const BOOKING_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}
