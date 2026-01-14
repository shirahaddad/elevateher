import Link from 'next/link';
import Image from 'next/image';
import { workshopService } from '@/lib/api/services/workshops/workshop.service';
import WaitlistForm from '@/components/workshops/WaitlistForm';
export const revalidate = 60;

export default async function Workshops() {
  const [nextWorkshop, pastPage] = await Promise.all([
    workshopService.getNextWorkshop(),
    workshopService.listPastWorkshops({ page: 1, limit: 1 }),
  ]);
  const hasPast = Number((pastPage as any)?.total || 0) > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <Link 
          href="/services" 
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
          Back to Services
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Workshops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive sessions to enhance your leadership skills and career development.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Section 1: Upcoming Workshop (NEXT) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M12 3l2.6 5.2L20 10.8l-5.4 2.6L12 19l-2.6-5.6L4 10.8l5.4-2.6L12 3z" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-900 mb-2 line-clamp-3 leading-snug">
                {nextWorkshop ? (
                  <Link 
                    href={`/services/workshops/${nextWorkshop.slug}`} 
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-sm"
                  >
                    {nextWorkshop.title}
                  </Link>
                ) : (
                  <span>No upcoming workshop yet</span>
                )}
              </h2>
              <p className="text-gray-600 mb-6">
                {nextWorkshop?.start_at
                  ? `Join our next live workshop, on ${new Intl.DateTimeFormat('en-US', {
                      timeZone: 'America/New_York',
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(nextWorkshop.start_at))}`
                  : 'Stay tuned for our next date.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative w-full h-56 rounded-lg overflow-hidden">
                {nextWorkshop?.hero_image_key ? (
                  <Image
                    src={nextWorkshop.hero_image_key}
                    alt={nextWorkshop.title}
                    fill
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              {nextWorkshop && (
                <Link
                  href={`/services/workshops/${nextWorkshop.slug}`}
                  className="block w-full text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-purple-700"
                >
                  Learn more
                </Link>
              )}
              <p className="text-xs text-gray-500 text-center">
                {nextWorkshop ? 'Learn more about the session details and register.' : 'Join the waitlist below for updates.'}
              </p>
            </div>
          </div>

          {/* Section 2: Show Interest in Future Workshops (Short Form) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Interested in Future Workshops?</h2>
              <p className="text-gray-600 mb-6">
                Sign up for early access and we'll notify you when dates of our next workshops are announced.
              </p>
            </div>

            <WaitlistForm />
          </div>

          {/* Section 3: Invite ElevateHer to Your Organization */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 8h10M7 12h4m1 8l-1-1h1m-1 1h1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Invite Elevate(Her) to Your Organization</h2>
              <p className="text-gray-600 mb-6">
                Bring our workshops to your team. We offer customized sessions for organizations of all sizes.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Workshop Topics Include:</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Leadership
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Communication
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Team Management
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Collaboration
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Conflict Resolution
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Feedback
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Emotional Intelligence
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Adaptability
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Personal Branding
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Career Advancement
                  </div>
                </div>
              </div>



              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Interested in bringing these workshops to your organization?
                </p>
                <p className="text-gray-600">
                  Contact us at <a href="mailto:info@elevateher.tech" className="text-purple-600 hover:text-purple-700 underline">info@elevateher.tech</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Link to Past Workshops */}
        {hasPast && (
          <div className="mt-12 text-center">
            <Link
              href="/services/workshops/past"
              className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium"
            >
              <span>See past workshops</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 