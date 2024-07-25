import * as React from "react";
import { marked } from "marked";
import { HTMLParser, HTMLParserProps } from "./HTMLParser";

/**
 * Convert markdown to JSX.
 *
 * Feed this component your markdown content, which will then convert
 * to HTML and then run the output HTML through the HTMLParser component.
 */
export const MarkdownParser: React.FC<HTMLParserProps> = ({
  content,
  ...props
}) => {
  const [html, setHtml] = React.useState("");

  React.useEffect(() => {
    const awaitParsed = async () => {
      const parsed = await marked.parse(content);
      setHtml(parsed);
    };

    awaitParsed();
  }, [content]);

  return html ? <HTMLParser content={html} {...props} /> : null;
};
