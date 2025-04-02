import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:h-screen flex items-center justify-center py-12 sm:py-16">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 tracking-tight">
              ELEVATE(HER).TECH
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 font-medium tracking-wide">
              EMPOWER | INNOVATE | LEAD
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 bg-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-purple-900">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* 1 on 1 Coaching */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-purple-900">1 on 1 Coaching</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
                Personalized guidance to help you navigate your tech career journey
                and achieve your goals.
              </p>
              <Link
                href="/services/coaching"
                className="text-purple-600 font-semibold hover:text-purple-700 text-sm sm:text-base"
              >
                Learn More →
              </Link>
            </div>

            {/* Community */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-purple-900">Community</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
                Join a supportive network of women in tech, share experiences, and
                grow together.
              </p>
              <Link
                href="/services/community"
                className="text-purple-600 font-semibold hover:text-purple-700 text-sm sm:text-base"
              >
                Learn More →
              </Link>
            </div>

            {/* Workshops */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 text-purple-900">Workshops</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
                Interactive sessions designed to enhance your skills and boost your
                confidence in tech.
              </p>
              <Link
                href="/services/workshops"
                className="text-purple-600 font-semibold hover:text-purple-700 text-sm sm:text-base"
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
