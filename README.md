# @cognipeer/to-markdown

[![npm](https://img.shields.io/npm/v/@cognipeer/to-markdown?color=success)](https://npmjs.com/package/@cognipeer/to-markdown)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@cognipeer/to-markdown)](https://github.com/Cognipeer/to-markdown/blob/main/LICENSE)

A versatile, TypeScript-first utility library for converting various file formats to Markdown.

## ✨ Features

- 🎯 **Multiple Format Support**: Convert PDF, DOCX, HTML, Excel, CSV, and more
- 📦 **Simple API**: Easy to use with Promise-based interface
- 🔧 **TypeScript First**: Written in TypeScript with full type definitions
- 🚀 **Fast & Efficient**: Optimized for performance with modular architecture
- 📚 **Well Documented**: Comprehensive documentation with examples
- 🎨 **Customizable**: Options to control conversion behavior

## 📦 Installation

```bash
npm install @cognipeer/to-markdown
```

**Using other package managers:**

```bash
# Yarn
yarn add @cognipeer/to-markdown

# pnpm
pnpm add @cognipeer/to-markdown
```

## 🔧 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build TypeScript and bundles
npm run build

# Watch mode for development
npm run dev
```

### Scripts

- `npm run build` - Build TypeScript and create bundles
- `npm run build:ts` - Compile TypeScript only
- `npm run build:rollup` - Create rollup bundles only
- `npm run clean` - Remove dist directory
- `npm run dev` - Watch mode for TypeScript compilation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### Version 2.0.0 (Latest)

- ✨ Rewritten in TypeScript with full type definitions
- 🏗️ Modular architecture with separate converter modules
- 📚 Comprehensive documentation with GitHub Pages
- 💡 Added usage examples
- 🎯 Improved error handling
- 📦 Better package exports (ESM + CJS)

### Version 1.0.1

- Initial release with JavaScript implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Cognipeer**

- GitHub: [@Cognipeer](https://github.com/Cognipeer)
- npm: [@cognipeer](https://www.npmjs.com/~cognipeer)

## 🙏 Acknowledgments

Built with these amazing libraries:

- [pdf2md](https://github.com/opendocsg/pdf2md) - PDF parsing
- [mammoth](https://github.com/mwilliamson/mammoth.js) - DOCX conversion
- [turndown](https://github.com/mixmark-io/turndown) - HTML to Markdown
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel parsing
- [cheerio](https://github.com/cheeriojs/cheerio) - HTML parsing
- [sharp](https://github.com/lovell/sharp) - Image processing

## 🔗 Links

- [Documentation](https://cognipeer.github.io/to-markdown/)
- [npm Package](https://www.npmjs.com/package/@cognipeer/to-markdown)
- [GitHub Repository](https://github.com/Cognipeer/to-markdown)
- [Issue Tracker](https://github.com/Cognipeer/to-markdown/issues)

---

Made with ❤️ by [Cognipeer](https://github.com/Cognipeer)

## 🚀 Quick Start

### Basic Usage

```typescript
import { convertToMarkdown, saveToMarkdownFile } from "@cognipeer/to-markdown";

// Convert from file path
const markdown = await convertToMarkdown("/path/to/document.docx");
console.log(markdown);

// Convert from buffer
const buffer = fs.readFileSync("document.pdf");
const markdown = await convertToMarkdown(buffer, {
  fileName: "document.pdf",
});
console.log(markdown);

// Convert from base64 string
const base64Content = "data:application/pdf;base64,JVBERi0xLjUNCiW...";
const markdown = await convertToMarkdown(base64Content);
console.log(markdown);

// Save converted markdown to a file
await saveToMarkdownFile(markdown, "converted-document", "./output");
```

### TypeScript Usage

```typescript
import { 
  convertToMarkdown, 
  saveToMarkdownFile,
  type ConverterOptions,
  type ConverterInput 
} from "@cognipeer/to-markdown";

// Type-safe conversion
const options: ConverterOptions = {
  fileName: "document.pdf",
  forceExtension: ".pdf"
};

const input: ConverterInput = "./document.pdf";
const result: string = await convertToMarkdown(input, options);
```

## 📖 API Reference

### `convertToMarkdown(input, options?)`

Converts various file formats to Markdown.

**Parameters:**

- `input: ConverterInput` - File path (string), base64 data (string), or Buffer
- `options?: ConverterOptions` - Optional configuration
  - `fileName?: string` - Name of the file (helpful for buffer inputs)
  - `forceExtension?: string` - Force a specific file extension for processing
  - `url?: string` - Original URL (used for web content like YouTube or Bing search)

**Returns:** `Promise<string>` - The converted markdown content

**Example:**
```typescript
const markdown = await convertToMarkdown("./document.pdf", {
  forceExtension: ".pdf"
});
```

---

### `saveToMarkdownFile(content, fileName, outputDir?)`

Saves the markdown content to a file.

**Parameters:**

- `content: string` - The markdown content to save
- `fileName: string` - Name for the output file (without .md extension)
- `outputDir?: string` - Directory to save the file (defaults to "output")

**Returns:** `Promise<string>` - Path to the saved file

**Example:**
```typescript
const filePath = await saveToMarkdownFile(markdown, "document", "./output");
console.log(`Saved to: ${filePath}`);
```

## 📚 Documentation

For comprehensive documentation, please visit our [documentation site](https://cognipeer.github.io/to-markdown/).

- [Getting Started Guide](https://cognipeer.github.io/to-markdown/getting-started)
- [API Documentation](https://cognipeer.github.io/to-markdown/api/overview)
- [Format Support](https://cognipeer.github.io/to-markdown/guides/formats)
- [Error Handling](https://cognipeer.github.io/to-markdown/guides/error-handling)

## 💡 Examples

Check out the [`examples/`](./examples) directory for more usage examples:

- [Basic Usage](./examples/basic-usage.ts) - File path, buffer, and base64 conversions
- [Spreadsheet Conversion](./examples/spreadsheet-conversion.ts) - Excel and CSV to Markdown tables
- [Advanced Usage](./examples/advanced-usage.ts) - Jupyter notebooks and complex HTML

### Running Examples

```bash
# Using tsx (recommended for development)
npx tsx examples/basic-usage.ts

# Or build and run
npm run build
node dist/examples/basic-usage.js
```

## 🏗️ Project Structure

```
to-markdown/
├── src/
│   ├── converters/      # Format-specific converters
│   │   ├── pdf.ts
│   │   ├── docx.ts
│   │   ├── html.ts
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── markdown.ts
│   │   └── fileDetection.ts
│   └── index.ts         # Main entry point
├── examples/            # Usage examples
├── docs/                # GitHub Pages documentation
├── dist/                # Compiled output
└── package.json
```
- **Web content**: Special handling for YouTube videos and Bing search results

## Examples

### Convert PDF to Markdown

```javascript
import { convertToMarkdown } from "@cognipeer/to-markdown";
import fs from "fs";

const pdfBuffer = fs.readFileSync("document.pdf");
const markdown = await convertToMarkdown(pdfBuffer, {
  fileName: "document.pdf",
});

console.log(markdown);
```

### Convert DOCX to Markdown

```javascript
import { convertToMarkdown } from "@cognipeer/to-markdown";

const markdown = await convertToMarkdown("/path/to/document.docx");
console.log(markdown);
```

### Convert HTML to Markdown

```javascript
import { convertToMarkdown, saveToMarkdownFile } from "@cognipeer/to-markdown";
import fs from "fs";

const htmlContent = fs.readFileSync("page.html", "utf-8");
const markdown = await convertToMarkdown(htmlContent, {
  forceExtension: ".html",
});
console.log(markdown);
```

### Convert and Save to File

```javascript
import { convertToMarkdown, saveToMarkdownFile } from "@cognipeer/to-markdown";

const markdown = await convertToMarkdown("/path/to/document.pdf");
const savedPath = await saveToMarkdownFile(
  markdown,
  "converted-document",
  "./output"
);
console.log(`Saved to: ${savedPath}`);
```

## License

MIT
