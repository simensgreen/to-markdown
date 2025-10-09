# Examples

This directory contains various examples demonstrating how to use `@cognipeer/to-markdown` library.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)
Demonstrates fundamental usage patterns:
- Converting files from file paths
- Converting from buffers
- Converting from base64 data
- Saving converted markdown to files

### 2. Spreadsheet Conversion (`spreadsheet-conversion.ts`)
Shows how to convert spreadsheet data:
- Excel files (.xlsx, .xls) to Markdown tables
- CSV files to Markdown tables

### 3. Advanced Usage (`advanced-usage.ts`)
Advanced conversion scenarios:
- Jupyter Notebooks (.ipynb) to Markdown
- HTML pages with complex structure
- Handling tables, code blocks, and formatting

## Running Examples

### TypeScript (Development)
```bash
# Run specific example
npx tsx examples/basic-usage.ts

# Or use ts-node
npx ts-node examples/basic-usage.ts
```

### JavaScript (After Build)
```bash
# Build the project first
npm run build

# Run the example
node dist/examples/basic-usage.js
```

## Sample Files

The examples reference sample files in `./sample-files/` directory. You can replace these with your own test files:

- `sample.pdf` - Sample PDF document
- `sample.docx` - Sample Word document
- `data.xlsx` - Sample Excel spreadsheet
- `data.csv` - Sample CSV file

## Creating Your Own Examples

1. Import the necessary functions:
```typescript
import { convertToMarkdown, saveToMarkdownFile } from '@cognipeer/to-markdown';
```

2. Use async/await for conversions:
```typescript
async function myExample() {
  const markdown = await convertToMarkdown('./myfile.pdf');
  console.log(markdown);
}
```

3. Handle errors appropriately:
```typescript
try {
  const markdown = await convertToMarkdown(input);
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

## Notes

- All examples use ES modules (`.ts` files with TypeScript)
- Examples are meant to be educational and can be modified for your needs
- Make sure to install dependencies before running: `npm install`
