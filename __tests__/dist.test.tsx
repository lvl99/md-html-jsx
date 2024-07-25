import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { HTMLParser, MarkdownParser } from "../dist";

describe("HTMLParser", () => {
  it("should work as advertised", () => {
    expect(false).toBe(true);
  });

  it("should work as advertised with custom elemMap", () => {
    expect(false).toBe(true);
  });
});

describe("react", () => {
  it("should render HTML to JSX", () => {
    const test = `<h1>Heading 1</h1>
    <p>This is a <a href="https://www.google.com/">test</a>.</p>
    <p>Some <em>text</em> <strong>formatting</strong> <strong><em>here</em></strong>. <del>Ignore this!</del> <span style="background:#FCC">Look at this!</span></p>`;

    const result = renderToStaticMarkup(<HTMLParser content={test} />);
    expect(result).toMatchSnapshot();
  });

  it("should render markdown to JSX", () => {
    const test = `# Heading 1

This is a [test](https://www.google.com).

Some *text* **formatting** ***here***. ~Ignore this!~ =Look at this!=

---

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

- Item 1
- Item 2
- Item 3

1. Item 1
2. Item 2
3. Item 3

> Blockquote

HTML code: <img src="https://placehold.it/600x600">

![image](https://placehold.it/600x600)

This is \`inline code\`.

\`\`\`
This is a code block.
\`\`\`

# GFM

- [ ] Unchecked item
- [x] Checked item

| Column | Column |
| ------ | ------ |
| Cell   | Cell   |

Here's my footnote in use[^1].

Term
: Definition

[^1]: This is the footnote definition.
`;

    const result = renderToStaticMarkup(<MarkdownParser content={test} />);
    expect(result).toMatchSnapshot();
  });
});
