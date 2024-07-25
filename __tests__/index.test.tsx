import * as stream from "node:stream";
import * as React from "react";
import { renderToStaticMarkup, renderToPipeableStream } from "react-dom/server";
import { describe, it, expect } from "vitest";
import {
  DEFAULT_HTML_ELEM_MAP,
  parseHTMLASTNode,
  HTMLParser,
  MarkdownParser,
  DEFAULT_IGNORE_HTML_AST_NODES,
} from "../lib";

const asyncRenderToStaticMarkup = (content) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const output = new stream.Writable();

    output.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    output.on("error", (err) => reject(err));
    output.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    let didError = false;
    const { pipe } = renderToPipeableStream(content, {
      onShellReady() {},
      onShellError(error) {
        didError = true;
        reject(error);
      },
      onAllReady() {
        if (!didError) {
          pipe(output);
        }
      },
      onError(error) {
        didError = true;
        reject(error);
      },
    });
  });
};

describe("parseHTMLASTNode", () => {
  it("should parse a tag element HTML AST Node and output a JSX element", () => {
    const node = {
      type: "tag",
      name: "p",
      children: [
        {
          type: "text",
          content: "Hello, world!",
        },
      ],
    };

    const Elem = parseHTMLASTNode({
      node,
      index: 0,
      depth: 0,
      elemMap: DEFAULT_HTML_ELEM_MAP,
      ignoreHTMLASTNodes: DEFAULT_IGNORE_HTML_AST_NODES,
    });

    expect(React.isValidElement(Elem)).toBe(true);
    const result = Elem ? renderToStaticMarkup(Elem) : false;
    expect(result).toBe("<p>Hello, world!</p>");
  });

  it("should parse a void element HTML AST Node and output a JSX element", () => {
    const node = {
      type: "tag",
      name: "img",
      voidElement: true,
      attrs: {
        src: "https://example.com/lol.gif",
        alt: "Hello, world!",
      },
      children: [],
    };

    const Elem = parseHTMLASTNode({
      node,
      index: 0,
      depth: 0,
      elemMap: DEFAULT_HTML_ELEM_MAP,
      ignoreHTMLASTNodes: DEFAULT_IGNORE_HTML_AST_NODES,
    });

    expect(React.isValidElement(Elem)).toBe(true);
    const result = Elem ? renderToStaticMarkup(Elem) : false;
    expect(result).toBe(
      `<img src="https://example.com/lol.gif" alt="Hello, world!"/>`,
    );
  });

  it("should parse an ignored HTML AST Node and output null", () => {
    const node = {
      type: "comment",
      comment: "Hello, world!",
    };

    const Elem = parseHTMLASTNode({
      node,
      index: 0,
      depth: 0,
      elemMap: DEFAULT_HTML_ELEM_MAP,
      ignoreHTMLASTNodes: DEFAULT_IGNORE_HTML_AST_NODES,
    });

    expect(React.isValidElement(Elem)).toBe(false);
    expect(Elem).toBeNull();
  });

  it("should parse an HTML AST Node and output a JSX element, even if nodes not mapped in elemMap", () => {
    const node = {
      type: "tag",
      name: "table",
      children: [
        {
          type: "tag",
          name: "tr",
          children: [
            {
              type: "tag",
              name: "td",
              children: [
                {
                  type: "text",
                  content: "Hello, world!",
                },
              ],
            },
          ],
        },
      ],
    };

    const Elem = parseHTMLASTNode({
      node,
      index: 0,
      depth: 0,
      // Default elem map doesn't include table-related elements
      elemMap: DEFAULT_HTML_ELEM_MAP,
      ignoreHTMLASTNodes: DEFAULT_IGNORE_HTML_AST_NODES,
    });

    expect(React.isValidElement(Elem)).toBe(true);
    const result = Elem ? renderToStaticMarkup(Elem) : false;
    // All the table-related elements aren't mapped, but any text nodes are!
    expect(result).toBe(`Hello, world!`);
  });
});

describe("HTMLParser", () => {
  it("should work as expected", () => {
    const resultA = renderToStaticMarkup(
      <HTMLParser content={`<p>Hello, world!</p>`} />,
    );
    expect(resultA).toBe("<p>Hello, world!</p>");

    const resultB = renderToStaticMarkup(
      <HTMLParser
        content={`<img src="https://example.com/lol.gif" alt="Hello, world!"/>`}
      />,
    );
    expect(resultB).toBe(
      `<img src="https://example.com/lol.gif" alt="Hello, world!"/>`,
    );

    const resultC = renderToStaticMarkup(
      <HTMLParser content={`<!-- Hello, world! -->`} />,
    );
    expect(resultC).toBe("");

    const resultD = renderToStaticMarkup(
      <HTMLParser content={`<table><tr><td>Hello, world!</td></tr></table>`} />,
    );
    expect(resultD).toBe("Hello, world!");
  });
});

describe.only("MarkdownParser", () => {
  it("should work as expected", async () => {
    const resultA = await asyncRenderToStaticMarkup(
      <MarkdownParser content={`# Hello, world!`} />,
    );
    expect(resultA).toBe("<h1>Hello, world!</h1>");

    const resultB = await asyncRenderToStaticMarkup(
      <MarkdownParser
        content={`![No DOMs Club](https://i.imgur.com/JoeK02H.png "No DOMs Club")`}
      />,
    );
    expect(resultB).toBe(
      `<img src="https://i.imgur.com/JoeK02H.png" alt="No DOMs Club!"/>`,
    );

    const resultC = await asyncRenderToStaticMarkup(
      <MarkdownParser content={`<!-- Hello, world! -->`} />,
    );
    expect(resultC).toBe("");

    const resultD = await asyncRenderToStaticMarkup(
      <MarkdownParser
        content={`<table><tr><td>Hello, world!</td></tr></table>`}
      />,
    );
    expect(resultD).toBe("Hello, world!");
  });
});
