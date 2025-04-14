import Link from 'next/link';

export default function Services() {
  return (
    <div 
      className="min-h-screen bg-white relative"
      style={{
        backgroundImage: 'url("/images/hero-background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/70" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 relative">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-purple-900 tracking-tight">Our Services</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Book your first free session with us and see how we can support your career growth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Individual Coaching */}
          <Link href="/services/coaching" className="block">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Individual Coaching</h2>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Tailored series plan
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Goals exploration
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Career roadmapping
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Two-coaches support system
                </li>
              </ul>
            </div>
          </Link>

          {/* Community */}
          <Link href="/services/community" className="block">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Community</h2>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Peer mentoring circles
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Networking events
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Support groups
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Online community access
                </li>
              </ul>
            </div>
          </Link>

          {/* Workshops */}
          <Link href="/services/workshops" className="block">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-purple-900">Workshops</h2>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Leadership development
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Communication skills
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Career transition
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  Strategic thinking
                </li>
              </ul>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8 sm:mt-12 md:mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
} 