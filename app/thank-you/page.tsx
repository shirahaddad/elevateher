'use client';

import { Suspense, useSearchParams } from 'next/navigation';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const isWorkshopRegistration = searchParams.get('source') === 'workshop-registration';

  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Thank You!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isWorkshopRegistration
              ? "A calendar event will be sent to you shortly."
              : "We've received your information and will be in touch soon."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ThankYouFallback() {
  return (
    <div className="min-h-screen py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-purple-900 tracking-tight">Thank You!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;ve received your information and will be in touch soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ThankYou() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouContent />
    </Suspense>
  );
} 