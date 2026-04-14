import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  href: string;
  variant: "danger" | "warning" | "info";
};

const variantStyles = {
  danger: {
    ring: "hover:ring-red-500/50",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
  },
  warning: {
    ring: "hover:ring-yellow-500/50",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
  },
  info: {
    ring: "hover:ring-blue-500/50",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
};

export function AlertCard({ label, value, description, icon: Icon, href, variant }: Props) {
  const styles = variantStyles[variant];

  return (
    <Link href={href}>
      <Card className={cn("cursor-pointer transition-all hover:ring-2", styles.ring)}>
        <CardContent className="flex items-center gap-4 p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
              styles.iconBg,
            )}
          >
            <Icon className={cn("h-6 w-6", styles.iconColor)} />
          </div>
          <div>
            <p className="font-mono text-3xl font-semibold tracking-tight">{value}</p>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
