export interface TeamMember {
  slug: string;
  name: string;
  title: string;
  image: string;
  linkedin: string;
}

export const TEAM: TeamMember[] = [
  {
    slug: 'shira',
    name: 'Shira Haddad (she/her)',
    title: 'Engineering Leader & Career Coach',
    image: '/images/shira.webp',
    linkedin: 'https://www.linkedin.com/in/shirahaddad/',
  },
  {
    slug: 'cassandra',
    name: 'Cassandra Dinh-Moore (she/her)',
    title: 'Career Strategist & Professional Development Coach',
    image: '/images/cassie.jpg',
    linkedin: 'https://www.linkedin.com/in/cassiedinh-moore/',
  },
];

// Helper function to get just the names for the author dropdown
export const getAuthorNames = () => TEAM.map(member => member.name); 