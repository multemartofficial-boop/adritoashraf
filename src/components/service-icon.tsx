import { Building2, Code2, Database, Globe, Layers, ShoppingCart, Smartphone, Users, type LucideIcon } from "lucide-react";

/** Icon set shared by the admin and the public Services section. */
export const SERVICE_ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  layers: Layers,
  building: Building2,
  code: Code2,
  smartphone: Smartphone,
  "shopping-cart": ShoppingCart,
  users: Users,
  database: Database,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICON_MAP[name] ?? Code2;
  return <Icon className={className} aria-hidden />;
}
