interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p className="brand-accent-text text-[11px] font-semibold uppercase tracking-[0.28em]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-0.5">
        <h2 className="font-display text-[2.15rem] leading-tight text-[var(--brand-ink)]">{title}</h2>
        {description ? <p className="max-w-3xl text-[0.95rem] text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
