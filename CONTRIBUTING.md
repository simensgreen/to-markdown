# Contributing to @cognipeer/to-markdown

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/to-markdown.git
   cd to-markdown
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗️ Development

### Project Structure

```
to-markdown/
├── src/
│   ├── converters/      # Format-specific converters
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Main entry point
├── examples/            # Usage examples
├── docs/                # Documentation
└── dist/                # Build output (generated)
```

### Building

```bash
# Build everything
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

### Running Examples

```bash
# Run an example
npx tsx examples/basic-usage.ts
```

## 📝 Code Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type when possible
- Export types that might be useful to library users

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

### Example

```typescript
/**
 * Converts a specific file format to Markdown
 * @param buffer - File buffer to convert
 * @returns Markdown string
 */
export async function convertFormatToMarkdown(buffer: Buffer): Promise<string> {
  try {
    // Implementation
    return markdown;
  } catch (err: any) {
    throw new Error(`Failed to convert: ${err.message}`);
  }
}
```

## 🧪 Testing

Currently, the project doesn't have automated tests. If you'd like to contribute:

1. Add test framework setup (Jest, Vitest, etc.)
2. Write tests for existing functionality
3. Ensure new features include tests

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to all public functions
- Include parameter descriptions and return types
- Provide usage examples in comments

### User Documentation

Documentation is in the `docs/` directory using Jekyll for GitHub Pages.

To work on documentation:

```bash
cd docs
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000/to-markdown/`

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Minimal steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Node.js version, OS, package version
6. **Code Sample**: Minimal code that reproduces the issue

## ✨ Feature Requests

We welcome feature requests! Please:

1. Search existing issues first
2. Describe the feature and use case
3. Explain why it would be useful
4. Consider submitting a PR if you can implement it

## 🔀 Pull Request Process

1. **Update your fork** to the latest main branch
2. **Create a feature branch** from main
3. **Make your changes** following code guidelines
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Commit with clear messages**:
   ```
   feat: Add support for new format
   fix: Resolve issue with PDF conversion
   docs: Update API documentation
   refactor: Improve error handling
   ```
7. **Push to your fork** and create a pull request
8. **Describe your changes** in the PR description

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Comments and documentation added/updated
- [ ] Examples added/updated if applicable
- [ ] No console errors or warnings
- [ ] Commits are clear and descriptive

## 🎯 Priority Areas

We're particularly interested in contributions for:

1. **New format support**: Add converters for new file formats
2. **OCR integration**: Image text extraction
3. **Speech-to-text**: Audio transcription
4. **Testing**: Add comprehensive test suite
5. **Performance**: Optimize conversion speed
6. **Documentation**: Improve guides and examples

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

- Open an issue for questions
- Check existing issues and discussions
- Tag maintainers if needed

## 🙏 Thank You!

Your contributions help make this project better for everyone!
