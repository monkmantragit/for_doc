import Script from 'next/script';

interface SchemaMarkupProps {
  schema: any | any[];
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  
  return (
    <>
      {schemas.map((s, index) => (
        <Script
          key={index}
          id={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(s, null, 2)
          }}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}