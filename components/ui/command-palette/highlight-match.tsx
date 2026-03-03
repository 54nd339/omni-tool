'use client';

interface HighlightMatchProps {
  query: string;
  text: string;
}

export function HighlightMatch({ query, text }: HighlightMatchProps) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <span className="rounded-sm bg-accent px-0.5 text-accent-foreground">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}
