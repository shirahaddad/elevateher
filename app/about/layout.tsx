import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Meet the Elevate(Her) coaches. We help women in tech step into their power with purpose through a unique two-coaches approach: real-world tech leadership plus proven coaching methods.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
