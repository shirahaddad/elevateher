import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function CareerAdvisingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Career Advising',
    '1:1 career coaching for women in tech: Bootstrap (3 sessions) and Configuration (6 sessions) packages. Strengths-based assessment, resume review, interview prep, and action planning.',
    '/services/career-advising',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
