import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function ExecCoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Executive Coaching',
    'Executive coaching for tech leaders with over a decade of engineering leadership experience, aligned with ICF principles. Clarify values, expand perspective, and lead with confidence.',
    '/services/exec-coaching',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
