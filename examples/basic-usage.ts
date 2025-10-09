import { convertToMarkdown, saveToMarkdownFile } from '../src/index.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Basic usage example - Converting a PDF file to Markdown
 */
async function basicExample() {
  console.log('=== Basic Example: PDF to Markdown ===\n');

  try {
    // Example 1: Convert from file path
    const pdfPath = './sample-files/sample.pdf';
    const markdown = await convertToMarkdown(pdfPath);
    
    console.log('Converted PDF to Markdown:');
    console.log(markdown.substring(0, 200) + '...\n');

    // Save to file
    const outputPath = await saveToMarkdownFile(markdown, 'converted-pdf', './output');
    console.log(`✓ Saved to: ${outputPath}\n`);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Example with buffer input
 */
async function bufferExample() {
  console.log('=== Buffer Example: DOCX to Markdown ===\n');

  try {
    // Read file as buffer
    const buffer = readFileSync('./sample-files/sample.docx');
    
    // Convert with fileName option
    const markdown = await convertToMarkdown(buffer, {
      fileName: 'sample.docx'
    });
    
    console.log('Converted DOCX to Markdown:');
    console.log(markdown.substring(0, 200) + '...\n');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Example with base64 input
 */
async function base64Example() {
  console.log('=== Base64 Example: HTML to Markdown ===\n');

  try {
    const htmlContent = `
      <html>
        <body>
          <h1>Welcome to to-markdown</h1>
          <p>This is a <strong>simple</strong> example.</p>
          <ul>
            <li>Feature 1</li>
            <li>Feature 2</li>
          </ul>
        </body>
      </html>
    `;
    
    // Convert HTML string to base64
    const base64 = Buffer.from(htmlContent).toString('base64');
    const dataUrl = `data:text/html;base64,${base64}`;
    
    // Convert to markdown
    const markdown = await convertToMarkdown(dataUrl);
    
    console.log('Converted HTML to Markdown:');
    console.log(markdown);
    console.log();
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  console.log('\n🚀 to-markdown Examples\n');
  console.log('='.repeat(50) + '\n');

  await basicExample();
  await bufferExample();
  await base64Example();

  console.log('='.repeat(50));
  console.log('\n✓ All examples completed!\n');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { basicExample, bufferExample, base64Example };
