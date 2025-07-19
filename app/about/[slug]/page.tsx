import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TEAM } from '@/lib/team';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const member = TEAM.find(m => m.slug === resolvedParams.slug);
  
  return {
    title: member ? `${member.name} - Elevate(Her)` : 'Elevate(Her)',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const member = TEAM.find(m => m.slug === resolvedParams.slug);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
                  <Link 
            href="/about" 
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors mb-8 text-sm font-medium"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to About Us
          </Link>
        
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Work with {member.name.split(' ')[0]}
          </Link>
          
          <Link
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg 
              className="w-5 h-5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {member.name.split(' ')[0]}'s LinkedIn
          </Link>
        </div>
      </div>
    </div>
  );
} 