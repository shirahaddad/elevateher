import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Community',
    'Join the Elevate(Her) community: a supportive network of women in tech. Share experiences, grow together, and access exclusive events and resources.',
    '/services/community',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
