import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-purple-900 tracking-tight">About Us</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            Our business is dedicated to supporting women in tech who are hoping to transition into leadership roles.
          </p>
          
          <p>
            Combining expertise in Engineering Management, HR, and DEI, we offer tailored career coaching, structured peer support, and a community-driven approach to professional growth.
          </p>
          
          <p>
            The combination of our skill sets provides a well-rounded coaching experience tailored to the unique challenges women in tech face.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl text-center"
          >
            Get Started
          </Link>
          <Link
            href="/team"
            className="inline-block bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl text-center"
          >
            Meet Our Team
          </Link>
        </div>
      </div>
    </div>
  );
} 