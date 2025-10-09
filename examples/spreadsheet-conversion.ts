import { convertToMarkdown } from '../src/index.js';

/**
 * Example: Converting Excel files to Markdown tables
 */
async function excelExample() {
  console.log('=== Excel to Markdown Example ===\n');

  try {
    const markdown = await convertToMarkdown('./sample-files/data.xlsx');
    console.log('Converted Excel to Markdown:');
    console.log(markdown);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Example: Converting CSV files to Markdown tables
 */
async function csvExample() {
  console.log('\n=== CSV to Markdown Example ===\n');

  try {
    // Sample CSV data
    const csvContent = `Name,Age,City
John Doe,30,New York
Jane Smith,25,San Francisco
Bob Johnson,35,Chicago`;

    const buffer = Buffer.from(csvContent);
    const markdown = await convertToMarkdown(buffer, {
      fileName: 'data.csv'
    });
    
    console.log('Converted CSV to Markdown:');
    console.log(markdown);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

/**
 * Run spreadsheet examples
 */
async function runSpreadsheetExamples() {
  console.log('\n📊 Spreadsheet Conversion Examples\n');
  console.log('='.repeat(50) + '\n');

  await csvExample();
  // await excelExample(); // Uncomment if you have sample Excel file

  console.log('\n' + '='.repeat(50));
  console.log('\n✓ Spreadsheet examples completed!\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSpreadsheetExamples().catch(console.error);
}

export { excelExample, csvExample };
