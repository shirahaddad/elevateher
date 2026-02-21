import { getServiceSchema, ORGANIZATION_ID } from '@/lib/schema';
import { StructuredDataScript } from '@/components/StructuredData';

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getServiceSchema(
    'Job Search Support',
    'Structured job search support for women in tech: targeted strategy, resume and LinkedIn optimisation, tailored applications and messaging, and interview preparation and practice.',
    '/services/job-search',
    ORGANIZATION_ID
  );
  return (
    <>
      <StructuredDataScript data={schema} />
      {children}
    </>
  );
}
