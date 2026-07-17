/**
 * Regression tests for the HTML→Markdown structural defects found while
 * live-testing the console crawler (2026-07-14/17):
 *
 *   1. tables were collapsed onto a single line (invalid markdown)
 *   2. fenced code blocks lost their newlines and their fences were inlined
 *   3. <ol> items were emitted as `* ` bullets (numbering lost)
 *   4. nested list indentation was flattened
 *   5. the page <title> leaked into the body as a stray first line
 *
 * Plus structure-awareness tests for formatMarkdown, which is shared by the
 * spreadsheet/notebook/text/media converters (a markdown table passed through
 * it also used to come back single-line).
 */
import { describe, expect, it } from "vitest";

import { convertHtmlToMarkdown } from "../converters/html.ts";
import { formatMarkdown } from "../utils/markdown.ts";

const PAGE = `<!doctype html>
<html>
  <head><title>Site Title — should not leak</title></head>
  <body>
    <h1>Main Heading</h1>
    <p>Intro paragraph with <strong>bold</strong>, <em>italic</em> and <code>inline code</code>.</p>
    <h2>Table</h2>
    <table>
      <thead><tr><th>Model</th><th>Context</th></tr></thead>
      <tbody>
        <tr><td>fable-5</td><td>400K</td></tr>
        <tr><td>haiku-4.5</td><td>200K</td></tr>
      </tbody>
    </table>
    <h2>Lists</h2>
    <ul>
      <li>First item</li>
      <li>Second item
        <ul><li>Nested A</li><li>Nested B</li></ul>
      </li>
    </ul>
    <ol>
      <li>Step one</li>
      <li>Step two</li>
    </ol>
    <h2>Code</h2>
    <pre><code>const answer = 42;
function greet(name) { return "hi " + name; }</code></pre>
    <blockquote>Quoted wisdom.</blockquote>
    <p><a href="/docs">Docs link</a> and <img src="/x.png" alt="Alt Text"> image.</p>
  </body>
</html>`;

describe("htmlToMarkdown structural fidelity", () => {
  const md = convertHtmlToMarkdown(PAGE);

  it("emits a valid multi-line table (rows on separate lines, separator after header)", () => {
    expect(md).toMatch(/\| Model \| Context \|\n\| --- \| --- \|\n\| fable-5 \| 400K \|\n\| haiku-4\.5 \| 200K \|/);
  });

  it("keeps fenced code blocks: fences on their own lines, code newlines preserved", () => {
    expect(md).toMatch(/```\nconst answer = 42;\nfunction greet\(name\) \{ return "hi " \+ name; \}\n```/);
  });

  it("preserves ordered list numbering", () => {
    expect(md).toMatch(/^1\.\s+Step one$/m);
    expect(md).toMatch(/^2\.\s+Step two$/m);
  });

  it("preserves nested list indentation", () => {
    expect(md).toMatch(/^\s{2,}\*\s+Nested A$/m);
    expect(md).toMatch(/^\s{2,}\*\s+Nested B$/m);
  });

  it("does not leak the <title> into the body", () => {
    expect(md).not.toContain("should not leak");
    expect(md.startsWith("# Main Heading")).toBe(true);
  });

  it("keeps headings, emphasis, blockquote, links and images", () => {
    expect(md).toMatch(/^# Main Heading$/m);
    expect(md).toMatch(/^## Table$/m);
    expect(md).toContain("**bold**");
    expect(md).toContain("_italic_");
    expect(md).toContain("`inline code`");
    expect(md).toMatch(/^> Quoted wisdom\./m);
    expect(md).toContain("[Docs link](/docs)");
    expect(md).toContain("![Alt Text](/x.png)");
  });

  it("still strips scripts, styles and nav chrome", () => {
    const withChrome = `<html><body><nav><a href="/">Home</a></nav><script>evil()</script><p>Real content here.</p></body></html>`;
    const out = convertHtmlToMarkdown(withChrome);
    expect(out).toContain("Real content here.");
    expect(out).not.toContain("evil");
    expect(out).not.toContain("Home");
  });

  it("keeps an image whose only wrapper would otherwise count as empty", () => {
    const out = convertHtmlToMarkdown(
      `<html><body><p>text</p><div><img src="/pic.png" alt="Pic"></div></body></html>`
    );
    expect(out).toContain("![Pic](/pic.png)");
  });
});

describe("formatMarkdown structure awareness", () => {
  it("leaves markdown tables intact", () => {
    const table = "| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |";
    expect(formatMarkdown(table)).toBe(table);
  });

  it("passes fenced code through verbatim", () => {
    const code = "```js\nconst a = 1;\n  indented();\n```";
    expect(formatMarkdown(code)).toBe(code);
  });

  it("does not merge list items or blockquotes", () => {
    const md = "* one\n* two\n\n> quote line";
    expect(formatMarkdown(md)).toBe("* one\n* two\n\n> quote line");
  });

  it("keeps ordered list numbering", () => {
    const md = "1. one\n2. two";
    expect(formatMarkdown(md)).toBe(md);
  });

  it("still merges hard-wrapped prose within a paragraph", () => {
    const md = "This line was\nhard-wrapped by a PDF\nextractor.\n\nNext paragraph.";
    expect(formatMarkdown(md)).toBe(
      "This line was hard-wrapped by a PDF extractor.\n\nNext paragraph."
    );
  });

  it("still promotes bold-only lines to headings and normalizes bullets", () => {
    expect(formatMarkdown("**Section Title**")).toBe("## Section Title");
    expect(formatMarkdown("• bullet\n- dash")).toBe("* bullet\n* dash");
  });

  it("preserves nested list indentation", () => {
    const md = "* parent\n    * child";
    expect(formatMarkdown(md)).toBe(md);
  });
});
