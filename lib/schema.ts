/**
 * JSON-LD structured data for SEO and AI discoverability.
 * Schema.org types: Organization, WebSite, Service, Article, Person.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://elevateher.tech';

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  '@id': string;
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[];
}

export function getOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Elevate(Her)',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/images/og-image.jpg'),
    description:
      'Elevate(Her) offers women in tech coaching, leadership development, and career mentorship. 1:1 coaching, workshops, and community for women in technology and STEM.',
    sameAs: ['https://twitter.com/elevatehertech', 'https://www.linkedin.com/company/elevateher'],
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  publisher: { '@id': string };
}

export function getWebSiteSchema(organizationId: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Elevate(Her)',
    url: absoluteUrl('/'),
    description:
      'Women in tech coaching, leadership development, and career mentorship. 1:1 coaching, workshops, and community.',
    publisher: { '@id': organizationId },
  };
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  url: string;
  provider: { '@id': string };
}

export function getServiceSchema(
  name: string,
  description: string,
  path: string,
  organizationId: string
): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absoluteUrl(path),
    provider: { '@id': organizationId },
  };
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: { '@type': 'Person'; name: string };
  publisher: { '@type': 'Organization'; name: string; logo?: { '@type': 'ImageObject'; url: string } };
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
}

export function getArticleSchema(
  headline: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified: string | undefined,
  authorName: string,
  imageUrl?: string
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: description.slice(0, 200),
    ...(imageUrl && { image: imageUrl }),
    datePublished,
    ...(dateModified && { dateModified }),
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Elevate(Her)',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/images/og-image.jpg') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(url) },
  };
}

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle: string;
  description: string;
  image?: string;
  url: string;
  sameAs?: string[];
}

export function getPersonSchema(
  name: string,
  jobTitle: string,
  description: string,
  path: string,
  imagePath?: string,
  sameAs?: string[]
): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    description: description.slice(0, 200),
    ...(imagePath && { image: absoluteUrl(imagePath) }),
    url: absoluteUrl(path),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };
}

/** Organization @id for reference in WebSite and Service. */
export const ORGANIZATION_ID = `${BASE_URL}#organization`;
