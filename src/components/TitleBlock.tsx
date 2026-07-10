import { ReactNode } from "react";

type Field = {
  label: string;
  value: ReactNode;
  /** Emphasize a value in the redline color (sparing use). */
  emphasis?: boolean;
};

type TitleBlockProps = {
  fields: Field[];
  className?: string;
  /** Compact variant uses tighter padding and a two-column grid. */
  dense?: boolean;
};

/**
 * A bordered engineering-drawing title block. Fields render as a small grid
 * of LABEL / value pairs, mono-typed like a real drawing sheet corner.
 */
export function TitleBlock({ fields, className = "", dense = false }: TitleBlockProps) {
  return (
    <dl
      className={`grid ${
        dense ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
      } divide-hairline text-left ${className}`}
      aria-label="Drawing title block"
    >
      {fields.map((f, i) => (
        <div
          key={f.label}
          className={`border-hairline px-3 py-1.5 ${
            i % 2 === 0 ? "sm:border-r" : ""
          } ${i >= 2 ? "border-t" : ""}`}
        >
          <dt className="mono-label text-graphite">{f.label}</dt>
          <dd
            className={`mt-0.5 font-mono text-[0.78rem] leading-tight ${
              f.emphasis ? "text-redline" : "text-ink"
            }`}
          >
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
