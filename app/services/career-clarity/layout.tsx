import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function CareerClarityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Career Clarity',
    '1:1 coaching for women in tech to gain clarity on your career direction—whether you\'re leveling up where you are or exploring what\'s next. Bootstrap (3), Configuration (6), and Command Line (9) session packages.',
    '/services/career-clarity',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
