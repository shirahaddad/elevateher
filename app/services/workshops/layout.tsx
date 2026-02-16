import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function WorkshopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Workshops',
    'Interactive workshops for women in tech to enhance leadership skills and career development. Group sessions and past workshop resources.',
    '/services/workshops',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
