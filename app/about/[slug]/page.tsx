import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const teamMembers = {
  shira: {
    name: 'Shira Haddad (she/her)',
    title: 'Engineering Leader & Career Coach',
    bio: 'With over 15 years of experience in executive coaching and leadership development, Sarah has helped hundreds of women leaders achieve their career goals. She specializes in helping women navigate workplace challenges, develop their leadership style, and build confidence in their decision-making abilities.',
    image: '/images/shira.webp',
    linkedin: 'https://www.linkedin.com/in/shirahaddad/',
  },
  cassie: {
    name: 'Cassandra Dinh-Moore',
    title: 'Career Strategist & Professional Development Coach',
    bio: 'Cassie brings a unique perspective to career coaching, combining her background in organizational psychology with practical business experience. She helps women identify their strengths, develop strategic career plans, and build the skills needed to advance in their chosen fields.',
    image: '/images/cassie.jpg',
    linkedin: 'https://www.linkedin.com/in/cassiedinh-moore/',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return {
    title: 'Elevate(Her)',
  };
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const member = teamMembers[params.slug as keyof typeof teamMembers];

  if (!member) {
    notFound();
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px]">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">{member.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{member.title}</p>
              <p className="text-gray-700 mb-8">{member.bio}</p>
              <div className="flex gap-4">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Connect on LinkedIn →
                </a>
                <Link
                  href="/questionnaire"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Take the Questionnaire →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 