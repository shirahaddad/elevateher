/**
 * Generates an excerpt from markdown content
 * @param content The markdown content to generate excerpt from
 * @param maxLength Maximum length of the excerpt (default: 150)
 * @returns Generated excerpt
 */
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/^#+\s+/gm, '') // Remove headings
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert links to text
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // If content is shorter than maxLength, return it
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete sentence within maxLength - 3 (for ellipsis)
  const truncated = plainText.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  // If we found a sentence end, use it, otherwise just truncate
  const excerpt = lastSentenceEnd > 0 
    ? truncated.substring(0, lastSentenceEnd + 1)
    : truncated;

  return excerpt + '...';
} 