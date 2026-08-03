/**
 * Reusable JSON-LD structured data component.
 * Renders a <script type="application/ld+json"> tag in the document head.
 * Usage: <JsonLd schema={{ "@context": "https://schema.org", ... }} />
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
