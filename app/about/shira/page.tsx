import Image from 'next/image';
import Link from 'next/link';

export default function ShiraBio() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Image Section */}
          <div className="w-full md:w-1/3">
            <div className="relative h-[400px] w-[280px] mx-auto">
              <Image
                src="/images/shira.webp"
                alt="Shira Haddad"
                fill
                sizes="(max-width: 768px) 280px, 280px"
                className="object-cover rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold mb-2 text-purple-900 tracking-tight">Shira Haddad (she/her)</h1>
            <p className="text-xl text-purple-600 mb-6">Leadership Leader & Career Coach</p>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Engineering leader and career coach. With over 15 years of experience in systems design, architecture and product management, I help tech professionals grow in their careers, develop leadership skills, and navigate organizational changes.
              </p>
              <p className="text-gray-600 mb-6">
                I create high performing teams, implement hiring best practices, and foster inclusive culture. My passion is supporting women in technology and developing the next generation of engineering leaders.
              </p>
              <p className="text-gray-600">
                When not working with clients, Shira enjoys speaking at tech conferences, writing about leadership, and mentoring the next generation of tech leaders.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Work with Shira
          </Link>
        </div>
      </div>
    </div>
  );
} 