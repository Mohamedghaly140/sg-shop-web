import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
};

export function SectionHeader({
  title,
  href,
  linkLabel = "View All",
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-12">
      <Tag className="font-heading text-3xl">{title}</Tag>
      {href && (
        <Link
          href={href}
          className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-current pb-px"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
