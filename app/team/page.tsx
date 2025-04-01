import Image from 'next/image';
import Link from 'next/link';

export default function Team() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Work with Us</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16">
          {/* Shira Haddad */}
          <Link href="/about/shira" className="block">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 max-w-[320px] mx-auto">
              <div className="relative h-[240px] w-[168px] mx-auto">
                <Image
                  src="/images/shira.jpg"
                  alt="Shira Haddad"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-900">Shira Haddad</h2>
                <span className="inline-block text-purple-600 font-semibold hover:text-purple-700 text-base">
                  Bio →
                </span>
              </div>
            </div>
          </Link>

          {/* Cassandra Dinh-Moore */}
          <Link href="/about/cassandra" className="block">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 max-w-[320px] mx-auto">
              <div className="relative h-[240px] w-[168px] mx-auto">
                <Image
                  src="/images/cassie.jpg"
                  alt="Cassandra Dinh-Moore"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-900">Cassandra Dinh-Moore</h2>
                <span className="inline-block text-purple-600 font-semibold hover:text-purple-700 text-base">
                  Bio →
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            I'm Ready
          </Link>
        </div>

        <p>We&apos;re here to support your journey.</p>
      </div>
    </div>
  );
} 