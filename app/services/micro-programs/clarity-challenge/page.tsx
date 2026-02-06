import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity Challenge | Elevate(Her)',
  description: 'A 7-day guided challenge to get clarity on what matters most, see your transferable skills, and take one aligned step that creates real momentum.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClarityChallenge() {
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
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Clarity Challenge</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A Small Guided Journey With Big Results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left card — sign up / CTA (2/3 width) */}
          <div className="md:col-span-2 bg-purple-900 rounded-2xl shadow-xl p-8 border border-purple-800">
            <h2 className="text-2xl font-bold text-white mb-6">This Is for You If…</h2>
            <ul className="space-y-3 text-white text-purple-100 list-disc list-inside mb-6">
              <li>You feel unmotivated or restless in your current role</li>
              <li>You know you&apos;re capable of more but aren&apos;t sure what direction to take</li>
              <li>You&apos;re stuck between leadership, a pivot, or &quot;something else&quot;</li>
              <li>You&apos;re tired of overthinking and want clarity that leads to action</li>
            </ul>
            <div className="border-t border-white/30 pt-6 space-y-2 text-white text-purple-100">
              <p>You don&apos;t need to quit your job.</p>
              <p>You don&apos;t need a five-year plan.</p>
              <p className="font-semibold text-white">You just need clarity you can trust.</p>
            </div>
          </div>

          {/* Right card — CTA (1/3 width), clickable (Option A: refined white) */}
          <Link
            href="#signup"
            className="md:col-span-1 flex flex-col justify-center bg-purple-100 rounded-2xl shadow-xl p-8 border-l-4 border-purple-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 block"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-4 inline-flex items-center gap-2">
              Start Today
              <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </h2>
            <p className="text-sm text-gray-500">Price:</p>
            <p className="text-xl font-bold text-purple-900">$49</p>
          </Link>
        </div>

        {/* Full-width card — What You'll Walk Away With (more CTAs can go below later) */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 tracking-tight mb-4 pb-4 border-b border-purple-900/20">
              What You&apos;ll Walk Away With in 7 Days
            </h2>
            <ul className="space-y-3 text-purple-900 list-disc list-inside mb-6">
              <li>Clearly identify what matters most to you right now</li>
              <li>See your core, transferable skills more clearly</li>
              <li>Understand what&apos;s actually keeping you stuck</li>
              <li>Take one aligned step that creates real momentum</li>
              <li>Feel calmer, clearer, and more confident about what comes next</li>
            </ul>
            <p className="text-purple-900">
              This isn&apos;t about making a drastic move. It&apos;s about creating direction.
            </p>
          </div>
        </div>

        {/* How the Challenge Works — dark section with 3 panels */}
        <section className="mt-12 rounded-2xl bg-purple-900 overflow-hidden border border-purple-800">
          <div className="px-6 sm:px-8 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 pb-6 border-b border-white/20">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How the Challenge Works
              </h2>
              <p className="text-purple-200 text-sm sm:text-base">
                7 days of guided prompts (30–45 minutes/day)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-purple-800 mb-4">
                  <Image
                    src="/images/clarity-typing-on-laptop.png"
                    alt="Person typing on a laptop"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="text-white text-center text-sm sm:text-base">
                  Delivered via email (and optional community space)
                </p>
              </div>
              <div>
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-purple-800 mb-4">
                  <Image
                    src="/images/clarity-writing-in-journal.png"
                    alt="Person writing in a journal"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="text-white text-center text-sm sm:text-base">
                  Structured reflection + practical action
                </p>
              </div>
              <div>
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-purple-800 mb-4">
                  <Image
                    src="/images/clarity-get-it-done.png"
                    alt="Woman holding get it done sign"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="text-white text-center text-sm sm:text-base">
                  Designed to fit into real life
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom row: Start Today (33%) + What's Included (66%) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          <Link
            href="#signup"
            className="md:col-span-1 flex flex-col justify-center bg-purple-100 rounded-2xl shadow-xl p-8 border-l-4 border-purple-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 block order-2 md:order-1"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-4 inline-flex items-center gap-2">
              Start Today
              <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </h2>
            <p className="text-sm text-gray-500">Price:</p>
            <p className="text-xl font-bold text-purple-900">$49</p>
          </Link>
          <div className="md:col-span-2 bg-purple-900 rounded-2xl shadow-xl p-8 border border-purple-800 order-1 md:order-2">
            <h2 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-white/20">
              What&apos;s Included
            </h2>
            <ul className="space-y-3 text-white text-purple-100 list-disc list-inside">
              <li>Daily guided reflections</li>
              <li>A simple clarity framework you can reuse</li>
              <li>Skill-identification exercises</li>
              <li>One confidence-building action step</li>
              <li>Optional community support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
