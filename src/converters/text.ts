import { load } from 'cheerio';
import { formatMarkdown } from '../utils/markdown.js';

/**
 * Converts plain text buffer to Markdown
 * @param buffer - Text file buffer
 * @returns Markdown string
 */
export function convertTextFileToMarkdown(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8').trim();
  } catch (err: any) {
    throw new Error(`Failed to convert text file: ${err.message}`);
  }
}

/**
 * Converts YouTube page HTML to Markdown
 * @param buffer - HTML buffer from YouTube page
 * @param url - YouTube URL
 * @returns Markdown string with video information
 */
export function convertYoutubeToMarkdown(buffer: Buffer, url: string): string {
  const html = buffer.toString('utf-8');
  const $ = load(html);

  let md = '# YouTube\n';

  const title = $('title').text();
  if (title) {
    md += `\n## ${title}\n`;
  }

  const desc = $('meta[name="description"]').attr('content');
  if (desc) {
    md += `\n### Description\n${desc}\n`;
  }

  // TODO: Add Youtube API for transcript

  return formatMarkdown(md);
}

/**
 * Converts Bing search results page to Markdown
 * @param buffer - HTML buffer from Bing search page
 * @param url - Bing search URL
 * @returns Markdown string with search results
 */
export function convertBingSerpToMarkdown(buffer: Buffer, url: string): string {
  const html = buffer.toString('utf-8');
  const $ = load(html);
  const query = new URL(url).searchParams.get('q') || '';

  let md = `## A Bing search for '${query}' found the following results:\n\n`;

  $('.b_algo').each((i, elem) => {
    const part = $(elem).text().trim();
    md += part + '\n\n';
  });

  return formatMarkdown(md);
}
