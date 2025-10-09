import { parseStringPromise } from 'xml2js';
import { formatMarkdown } from '../utils/markdown.js';

/**
 * Converts RSS/ATOM feed buffer to Markdown
 * @param buffer - XML/RSS/ATOM file buffer
 * @returns Markdown string
 */
export async function convertRssAtomToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const xmlContent = buffer.toString('utf-8');
    const result = await parseStringPromise(xmlContent);

    // RSS Feed
    if (result.rss && result.rss.channel && result.rss.channel[0]) {
      const channel = result.rss.channel[0];
      let md = '';

      if (channel.title) {
        md += `# ${channel.title[0]}\n`;
      }

      if (channel.description) {
        md += `${channel.description[0]}\n\n`;
      }

      if (channel.item) {
        for (const item of channel.item) {
          if (item.title) {
            md += `## ${item.title[0]}\n`;
          }
          if (item.pubDate) {
            md += `Published on: ${item.pubDate[0]}\n`;
          }
          if (item.description) {
            md += `\n${item.description[0]}\n\n`;
          }
        }
      }

      return formatMarkdown(md);
    }
    // ATOM Feed
    else if (result.feed) {
      const feed = result.feed;
      let md = '';

      if (feed.title) {
        md += `# ${feed.title[0]}\n`;
      }

      if (feed.subtitle) {
        md += `${feed.subtitle[0]}\n\n`;
      }

      if (feed.entry) {
        for (const entry of feed.entry) {
          if (entry.title) {
            md += `## ${entry.title[0]}\n`;
          }
          if (entry.updated) {
            md += `Updated on: ${entry.updated[0]}\n`;
          }
          if (entry.summary) {
            md += `\n${entry.summary[0]}\n\n`;
          } else if (entry.content) {
            md += `\n${entry.content[0]._ || entry.content[0]}\n\n`;
          }
        }
      }

      return formatMarkdown(md);
    }

    // Generic XML conversion
    return formatMarkdown(xmlContent);
  } catch (err: any) {
    throw new Error(`Failed to convert RSS/ATOM: ${err.message}`);
  }
}
