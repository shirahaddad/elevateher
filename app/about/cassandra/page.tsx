import Image from 'next/image';
import Link from 'next/link';

export default function CassandraBio() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Image Section */}
          <div className="w-full md:w-1/3">
            <div className="relative h-[400px] w-[280px] mx-auto">
              <Image
                src="/images/cassie.jpg"
                alt="Cassandra Dinh-Moore"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold mb-2 text-purple-900 tracking-tight">Cassandra Dinh-Moore (she/her)</h1>
            <p className="text-xl text-purple-600 mb-6">Career Coach & Developer of Talent</p>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Cassandra Dinh-Moore brings a unique perspective to leadership development, combining her experience in tech with a deep understanding of organizational psychology. She has helped numerous women break through glass ceilings and establish themselves as influential leaders in their organizations.
              </p>
              <p className="text-gray-600 mb-6">
                Her expertise in building high-performing teams and creating inclusive work environments has made her a sought-after advisor for both individual leaders and organizations looking to develop their female talent pipeline.
              </p>
              <p className="text-gray-600">
                Cassandra is passionate about creating sustainable change in the tech industry and regularly contributes to discussions about diversity, equity, and inclusion in leadership.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/questionnaire"
            className="inline-block bg-purple-600 text-white px-10 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Work with Cassandra
          </Link>
        </div>
      </div>
    </div>
  );
} 