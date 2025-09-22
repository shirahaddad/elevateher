export interface TeamMember {
  slug: string;
  name: string;
  title: string;
  image: string;
  linkedin: string;
  bio: string[];
}

export const TEAM: TeamMember[] = [
  {
    slug: 'shira',
    name: 'Shira Haddad (she/her)',
    title: 'Engineering Leader, Mentor, Coach',
    image: '/images/shira.webp',
    linkedin: 'https://www.linkedin.com/in/shirahaddad/',
    bio: [
      'With over 15 years of experience in systems design, architecture and product management, Shira helps tech professionals grow in their careers, develop leadership skills, and navigate organizational changes.',
      'Shira creates high performing teams, implements hiring best practices, and fosters inclusive culture. Her passion is supporting women in technology and developing the next generation of engineering leaders.',
      'She is currently completing her intermediate training with the Co-Active Training Institute (CTI) and is on track toward professional coaching certification.'
    ]
  },
  {
    slug: 'cassandra',
    name: 'Cassandra Dinh-Moore (she/her)',
    title: 'Career Coach & Developer of Talent',
    image: '/images/cassie.jpg',
    linkedin: 'https://www.linkedin.com/in/cassiedinh-moore/',
    bio: [
      'Cassandra Dinh-Moore brings a unique perspective to leadership development, combining her experience in tech with a deep understanding of organizational psychology. She has helped numerous women break through glass ceilings and establish themselves as influential leaders in their organizations.',
      'Her expertise in building high-performing teams and creating inclusive work environments has made her a sought-after advisor for both individual leaders and organizations looking to develop their female talent pipeline.',
      'Cassandra is passionate about creating sustainable change in the tech industry and regularly contributes to discussions about diversity, equity, and inclusion in leadership.'
    ]
  },
];

// Helper function to get just the names for the author dropdown
export const getAuthorNames = () => TEAM.map(member => member.name); 