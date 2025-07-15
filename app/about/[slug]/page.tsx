import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TEAM } from '@/lib/team';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const member = TEAM.find(m => m.slug === params.slug);
  
  return {
    title: member ? `${member.name} - Elevate(Her)` : 'Elevate(Her)',
  };
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const member = TEAM.find(m => m.slug === params.slug);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Image Section */}
          <div className="w-full md:w-1/3">
            <div className="relative h-[400px] w-[280px] mx-auto">
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 280px, 280px"
                className="object-cover rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold mb-2 text-purple-900 tracking-tight">{member.name}</h1>
            <p className="text-xl text-purple-600 mb-6">{member.title}</p>
            <div className="prose prose-lg max-w-none">
              {member.bio.map((paragraph, index) => (
                <p key={index} className="text-gray-600 mb-6">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Work with {member.name.split(' ')[0]}
          </Link>
        </div>
      </div>
    </div>
  );
} 