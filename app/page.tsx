import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-purple-900/60" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              ELEVATE(HER).TECH
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-medium tracking-wide">
              EMPOWER | INNOVATE | LEAD
            </p>
            <Link
              href="/team"
              className="inline-block bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Work with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-purple-900">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 1 on 1 Coaching */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-purple-900">1 on 1 Coaching</h3>
              <p className="text-gray-600 mb-6">
                Personalized guidance to help you navigate your tech career journey
                and achieve your goals.
              </p>
              <Link
                href="/services/coaching"
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Learn More →
              </Link>
            </div>

            {/* Community */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-purple-900">Community</h3>
              <p className="text-gray-600 mb-6">
                Join a supportive network of women in tech, share experiences, and
                grow together.
              </p>
              <Link
                href="/services/community"
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Learn More →
              </Link>
            </div>

            {/* Workshops */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-purple-900">Workshops</h3>
              <p className="text-gray-600 mb-6">
                Interactive sessions designed to enhance your skills and boost your
                confidence in tech.
              </p>
              <Link
                href="/services/workshops"
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
