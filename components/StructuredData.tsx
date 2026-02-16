/**
 * Renders a script tag with JSON-LD structured data for SEO and AI discoverability.
 * Use in server components; pass schema object from lib/schema.
 */
export function StructuredDataScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
