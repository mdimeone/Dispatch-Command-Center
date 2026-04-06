interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-0.5">
        <h2 className="font-display text-[2.15rem] leading-tight text-slate-950">{title}</h2>
        {description ? <p className="max-w-3xl text-[0.95rem] text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
