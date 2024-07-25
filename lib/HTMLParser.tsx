import * as React from "react";
import { parse, MaybeDoc } from "html-to-ast";
import { decode } from "he";
import insane from "insane";

export interface HTMLElemTransformerProps {
  node: MaybeDoc;
  parentNode?: MaybeDoc;
  children?: React.ReactNode | null;
}
export type HTMLElemTransformer = React.FC<HTMLElemTransformerProps>;
export type HTMLElemMap = Record<string, HTMLElemTransformer>;

export interface HTMLParserProps {
  content: string;
  elemMap?: HTMLElemMap;
  ignoreHTMLASTNodes?: string[];
  insaneConfig?: insane.SanitizeOptions;
}

/**
 * The default HTML AST Node to JSX component map
 */
export const DEFAULT_HTML_ELEM_MAP: HTMLElemMap = {
  text: ({ node }) => (node.content ? decode(node.content).trim() : "") || null,
  div: ({ children }) => <div>{children}</div>,
  span: ({ children }) => <span>{children}</span>,
  strong: ({ children }) => <strong>{children}</strong>,
  b: ({ children }) => <b>{children}</b>,
  em: ({ children }) => <em>{children}</em>,
  i: ({ children }) => <i>{children}</i>,
  u: ({ children }) => <u>{children}</u>,
  s: ({ children }) => <s>{children}</s>,
  del: ({ children }) => <del>{children}</del>,
  big: ({ children }) => <big>{children}</big>,
  small: ({ children }) => <small>{children}</small>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  p: ({ children }) => <p>{children}</p>,
  a: ({ node, children }) => <a {...node.attrs}>{children}</a>,
  ul: ({ children }) => <ul>{children}</ul>,
  ol: ({ children }) => <ol>{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  h1: ({ children }) => <h1>{children}</h1>,
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  h4: ({ children }) => <h4>{children}</h4>,
  h5: ({ children }) => <h5>{children}</h5>,
  h6: ({ children }) => <h6>{children}</h6>,
  img: ({ node }) => <img {...node.attrs} />,
  br: () => <br />,
  hr: () => <hr />,
};

export const DEFAULT_IGNORE_HTML_AST_NODES = ["comment"];

export const DEFAULT_INSANE_CONFIG: insane.SanitizeOptions = {
  allowedSchemes: ["https", "mailto"],
  allowedTags: [
    "a",
    "b",
    "blockquote",
    "br",
    "del",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "table",
    "tbody",
    "td",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
};

export const PassthroughElem: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

/**
 * Parse an HTML AST node into a JSX element.
 *
 * This is recursive. If AST node has children, it will
 * parse all the children before returning the JSX element.
 */
export const parseHTMLASTNode = ({
  node,
  parentNode,
  index,
  depth,
  elemMap,
  ignoreHTMLASTNodes,
}: {
  node: MaybeDoc;
  parentNode?: MaybeDoc;
  index: number;
  depth: number;
  elemMap: HTMLElemMap;
  ignoreHTMLASTNodes?: string[];
}): React.ReactNode | null => {
  const key = node.name || node.type;
  let ignore;

  // No key or should be ignored
  if (!key || (ignoreHTMLASTNodes && ignoreHTMLASTNodes.indexOf(key) > -1))
    ignore = true;

  // Empty/blank content
  if (
    // Void elems don't usually have content
    (node.voidElement && node.name !== "img") ||
    // Tag with no children
    (node.type === "tag" && node.name !== "img" && !node.children?.length) ||
    // Text with no content
    (node.type === "text" && !node.content?.trim())
  )
    ignore = true;

  if (ignore) return null;

  const Elem = elemMap[key] || PassthroughElem;

  let children = [];
  if (node.children?.length) {
    children = node.children
      .map((n, i) =>
        parseHTMLASTNode({
          node: n,
          parentNode: node,
          index: i,
          depth: index,
          elemMap,
        }),
      )
      .filter((x) => x);
  }

  return (
    <Elem
      key={`html-ast-${depth || 0}-${index || 0}-${key}`}
      node={node}
      parentNode={parentNode}
    >
      {children}
    </Elem>
  );
};

/**
 * Convert HTML to JSX.
 *
 * Feed it your content, it will sanitise, parse, and convert to
 * JSX based on the elemMap you give it. Try it out!
 */
export const HTMLParser: React.FC<HTMLParserProps> = ({
  content,
  elemMap,
  ignoreHTMLASTNodes,
  insaneConfig,
}) => {
  const _elemMap = elemMap || DEFAULT_HTML_ELEM_MAP;
  const _ignoreHTMLASTNodes =
    ignoreHTMLASTNodes || DEFAULT_IGNORE_HTML_AST_NODES;
  const _insaneConfig = insaneConfig || DEFAULT_INSANE_CONFIG;
  const _content = React.useMemo(() => {
    const ast = parse(insane(content, _insaneConfig));
    return ast
      .map((node, index) =>
        parseHTMLASTNode({
          node,
          index,
          depth: 0,
          elemMap: _elemMap,
          ignoreHTMLASTNodes,
        }),
      )
      .filter((x) => x);
  }, [content, _elemMap, _insaneConfig, _ignoreHTMLASTNodes]);
  return _content;
};
