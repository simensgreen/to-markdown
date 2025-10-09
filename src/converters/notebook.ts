import { formatMarkdown } from '../utils/markdown.js';

/**
 * Jupyter notebook cell interface
 */
interface NotebookCell {
  cell_type: string;
  source: string[];
}

/**
 * Jupyter notebook structure
 */
interface JupyterNotebook {
  cells?: NotebookCell[];
}

/**
 * Converts Jupyter Notebook buffer to Markdown
 * @param buffer - IPYNB file buffer
 * @returns Markdown string
 */
export async function convertIpynbToMarkdown(buffer: Buffer): Promise<string> {
  try {
    const jsonData: JupyterNotebook = JSON.parse(buffer.toString('utf-8'));
    const mdOutput: string[] = [];
    let title: string | null = null;

    if (jsonData.cells) {
      for (const cell of jsonData.cells) {
        const cellType = cell.cell_type;
        const sourceLines = cell.source || [];

        if (cellType === 'markdown') {
          const mdContent = sourceLines.join('');
          mdOutput.push(mdContent);

          if (!title) {
            for (const line of sourceLines) {
              if (line.startsWith('# ')) {
                title = line.replace('# ', '').trim();
                break;
              }
            }
          }
        } else if (cellType === 'code') {
          mdOutput.push('```python\n' + sourceLines.join('') + '\n```');
        } else if (cellType === 'raw') {
          mdOutput.push('```\n' + sourceLines.join('') + '\n```');
        }
      }
    }

    let markdown = mdOutput.join('\n\n');
    markdown = formatMarkdown(markdown);

    return markdown;
  } catch (err: any) {
    throw new Error(`Failed to convert IPYNB: ${err.message}`);
  }
}
