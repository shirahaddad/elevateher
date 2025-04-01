import Image from 'next/image';
import Link from 'next/link';

const teamMembers = {
  shira: {
    name: 'Shira Haddad',
    role: 'Leadership Guru & Career Coach',
    image: '/images/shira.jpg',
  },
  cassandra: {
    name: 'Cassandra Dinh-Moore',
    role: 'Career Coach & Developer of Talent',
    image: '/images/cassie.jpg',
  },
};

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-purple-900 mb-12">Our Team</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(teamMembers).map(([slug, member]) => (
            <Link 
              key={slug} 
              href={`/about/${slug}`}
              className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-[320px] mx-auto"
            >
              <div className="relative h-[240px] w-[168px] mx-auto">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 168px, 168px"
                  className="object-contain"
                  priority={slug === 'shira'}
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-2">{member.name}</h2>
                <p className="text-purple-600">{member.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 