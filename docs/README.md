# Documentation

This directory contains the documentation for `@cognipeer/to-markdown`, built with Jekyll for GitHub Pages.

## Structure

```
docs/
├── _config.yml              # Jekyll configuration
├── index.md                 # Home page
├── getting-started.md       # Installation and basic usage
├── api/
│   ├── overview.md         # API overview
│   ├── options.md          # Converter options
│   └── types.md            # Type definitions
└── guides/
    ├── formats.md          # Format support guide
    └── error-handling.md   # Error handling guide
```

## Local Development

### Prerequisites

- Ruby 2.7 or higher
- Bundler

### Setup

1. Install Jekyll and dependencies:
   ```bash
   cd docs
   bundle install
   ```

2. Run the local server:
   ```bash
   bundle exec jekyll serve
   ```

3. Open your browser to `http://localhost:4000/to-markdown/`

## Building for Production

GitHub Pages automatically builds and deploys the documentation when changes are pushed to the `main` branch.

To build locally:

```bash
cd docs
bundle exec jekyll build
```

The output will be in `docs/_site/`.

## Theme

This documentation uses the [Just the Docs](https://github.com/just-the-docs/just-the-docs) theme, which provides:

- Clean, responsive design
- Built-in search
- Navigation sidebar
- Code syntax highlighting
- Dark mode support

## Adding New Pages

1. Create a new `.md` file in the appropriate directory
2. Add front matter:
   ```yaml
   ---
   layout: default
   title: Page Title
   nav_order: 3
   ---
   ```
3. Write content in Markdown
4. The page will automatically appear in navigation

## Writing Tips

- Use proper heading hierarchy (H1 for title, H2 for sections, etc.)
- Include code examples with syntax highlighting
- Add navigation links between related pages
- Keep content concise and scannable
- Use tables for structured information

## Front Matter Options

```yaml
---
layout: default              # Always use "default"
title: Page Title           # Page title (required)
nav_order: 1                # Order in navigation
parent: Parent Page         # For child pages
has_children: true          # If page has child pages
permalink: /custom/path     # Custom URL path
description: SEO description
---
```

## Linking Between Pages

Use Jekyll's link syntax:

```liquid
[Link text]({{ site.baseurl }}{% link path/to/page.md %})
```

## Code Blocks

Use fenced code blocks with language specification:

````markdown
```typescript
const markdown = await convertToMarkdown('./file.pdf');
```
````

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to the documentation.
