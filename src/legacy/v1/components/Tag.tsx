export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag-pill">{children}</span>;
}

export function TagRow({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
      {tags.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
    </ul>
  );
}
