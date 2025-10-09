import { convertToMarkdown } from '../src/index.js';

/**
 * Example: Converting Jupyter Notebooks to Markdown
 */
async function notebookExample() {
  console.log('=== Jupyter Notebook to Markdown Example ===\n');

  try {
    // Sample notebook structure
    const notebookData = {
      cells: [
        {
          cell_type: 'markdown',
          source: ['# Data Analysis Example\n', '\n', 'This notebook demonstrates basic data analysis.']
        },
        {
          cell_type: 'code',
          source: ['import pandas as pd\n', 'import numpy as np\n', '\n', 'df = pd.DataFrame({\'A\': [1, 2, 3]})']
        },
        {
          cell_type: 'markdown',
          source: ['## Results\n', '\n', 'The data has been loaded successfully.']
        },
        {
          cell_type: 'code',
          source: ['print(df.head())']
        }
      ]
    };

    const buffer = Buffer.from(JSON.stringify(notebookData));
    const markdown = await convertToMarkdown(buffer, {
      fileName: 'analysis.ipynb'
    });
    
    console.log('Converted Notebook to Markdown:');
    console.log(markdown);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Example: Converting HTML pages to Markdown
 */
async function htmlExample() {
  console.log('\n=== HTML to Markdown Example ===\n');

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Documentation</title>
        </head>
        <body>
          <h1>API Documentation</h1>
          <h2>Authentication</h2>
          <p>To authenticate, use the following endpoint:</p>
          <pre><code>POST /api/auth/login</code></pre>
          
          <h2>Available Endpoints</h2>
          <table>
            <tr>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Description</th>
            </tr>
            <tr>
              <td>GET</td>
              <td>/api/users</td>
              <td>Get all users</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>/api/users</td>
              <td>Create a user</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const buffer = Buffer.from(htmlContent);
    const markdown = await convertToMarkdown(buffer, {
      fileName: 'documentation.html'
    });
    
    console.log('Converted HTML to Markdown:');
    console.log(markdown);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Run advanced examples
 */
async function runAdvancedExamples() {
  console.log('\n⚡ Advanced Conversion Examples\n');
  console.log('='.repeat(50) + '\n');

  await notebookExample();
  await htmlExample();

  console.log('\n' + '='.repeat(50));
  console.log('\n✓ Advanced examples completed!\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAdvancedExamples().catch(console.error);
}

export { notebookExample, htmlExample };
