# Migration Guide: v1.x to v2.0

This guide helps you migrate from v1.x (JavaScript) to v2.0 (TypeScript).

## 🎯 What's New in v2.0

- **TypeScript Support**: Full TypeScript rewrite with type definitions
- **Modular Architecture**: Organized codebase with separate converter modules
- **Better Documentation**: Comprehensive docs with GitHub Pages
- **Improved API**: Same API with enhanced type safety
- **Better Build**: Optimized build process with proper ESM/CJS support

## 📦 Breaking Changes

### Package Structure

**v1.x:**
```json
{
  "main": "src/index.js",
  "exports": {
    "import": "./src/index.js",
    "require": "./src/index.cjs"
  }
}
```

**v2.0:**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

### File Extensions

**v1.x:** Used `.js` and `.cjs` files in `src/`

**v2.0:** Uses `.ts` files in `src/`, compiled to `.js`/`.cjs` in `dist/`

## 🔄 Migration Steps

### 1. Update Package

```bash
npm install @cognipeer/to-markdown@latest
```

### 2. Update Imports

The imports remain the same, but you now get TypeScript support:

**JavaScript (works the same):**
```javascript
import { convertToMarkdown, saveToMarkdownFile } from '@cognipeer/to-markdown';
```

**TypeScript (new capabilities):**
```typescript
import { 
  convertToMarkdown, 
  saveToMarkdownFile,
  type ConverterOptions,
  type ConverterInput,
  FileExtension
} from '@cognipeer/to-markdown';
```

### 3. Add Type Annotations (TypeScript projects)

If you're using TypeScript, you can now add proper types:

**Before (JavaScript/v1.x):**
```javascript
async function convert(filePath) {
  const result = await convertToMarkdown(filePath);
  return result;
}
```

**After (TypeScript/v2.0):**
```typescript
async function convert(filePath: string): Promise<string> {
  const result = await convertToMarkdown(filePath);
  return result;
}
```

### 4. Use Type-Safe Options

**Before:**
```javascript
const markdown = await convertToMarkdown(buffer, {
  fileName: 'document.pdf',
  forceExtension: '.pdf'
});
```

**After (with types):**
```typescript
const options: ConverterOptions = {
  fileName: 'document.pdf',
  forceExtension: '.pdf'
};

const markdown = await convertToMarkdown(buffer, options);
```

## ✅ No Code Changes Required

The API remains **100% backward compatible**. Your existing code will continue to work without modifications:

```javascript
// This works in both v1.x and v2.0
const markdown = await convertToMarkdown('./document.pdf');
await saveToMarkdownFile(markdown, 'output', './dist');
```

## 🎁 New Features to Try

### 1. Type Definitions

```typescript
import type { ConverterInput, ConverterOptions } from '@cognipeer/to-markdown';

function createConverter(input: ConverterInput, options?: ConverterOptions) {
  // TypeScript now knows exactly what types these are
}
```

### 2. Better IDE Support

With TypeScript definitions, your IDE now provides:
- **Autocomplete** for options and methods
- **Type checking** to catch errors early
- **IntelliSense** documentation
- **Go to definition** for exploring the library

### 3. Examples

Check out the new [`examples/`](./examples) directory:
- `basic-usage.ts` - Common use cases
- `spreadsheet-conversion.ts` - Excel/CSV examples
- `advanced-usage.ts` - Complex scenarios

### 4. Documentation

Visit our new documentation site:
- [Getting Started](https://cognipeer.github.io/to-markdown/getting-started)
- [API Reference](https://cognipeer.github.io/to-markdown/api/overview)
- [Format Guide](https://cognipeer.github.io/to-markdown/guides/formats)

## 🐛 Known Issues

None at this time. If you encounter any issues, please [report them](https://github.com/Cognipeer/to-markdown/issues).

## 📞 Need Help?

- **Issues**: [GitHub Issues](https://github.com/Cognipeer/to-markdown/issues)
- **Documentation**: [cognipeer.github.io/to-markdown](https://cognipeer.github.io/to-markdown)
- **Examples**: Check the [`examples/`](./examples) directory

## 🎉 Enjoy v2.0!

We hope you enjoy the improved developer experience with TypeScript!
