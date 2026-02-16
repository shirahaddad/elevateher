import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function MentoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Mentoring',
    'Mentoring for women in tech: single sessions or 10-session series. Goal clarification, personalized advice, and actionable steps for your career.',
    '/services/mentoring',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
