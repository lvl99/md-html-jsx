# md-html-jsx

Convert Markdown and HTML to JSX without DOM and without `dangerouslySetInnerHTML` !

![No DOMs Club](https://i.imgur.com/JoeK02H.png "No DOMs Club")

If you think it's a great idea to transform MD/HTML to JSX, then you must also believe that 🏳️‍⚧️ Trans Rights Are Human Rights too! 🏳️‍⚧️

* [Donate to Advocates For Trans Equality (A4TE)](https://donate.ncteactionfund.org/a/a4te)
* [Donate to Families United For Trans Rights (FUTR)](https://app.oath.vote/donate?p=futr)
* [Donate to Transgender Law Center](https://transgenderlawcenter.org/donate/)
* [Donate to Transactual](https://www.peoplesfundraising.com/donation/support-transactual)
* [Donate to UK Trans Info](https://uktrans.info/our-work/)
* [Donate to Trans Europe and Central Asia (TGEU)](https://www.tgeu.org/support-our-work/)

## What it do exactly?

Sanitises and converts HTML code to an abstract syntax tree (AST), then you can map those AST nodes to JSX components.

For markdown, it conveniently converts it to HTML before doing the above.

## Installation

```sh
npm install md-html-jsx --save
yarn add md-html-jsx
pnpm add md-html-jsx
```

## Usage

```js
import * as React from "react";
import { HTMLParser, MarkdownParser } from "md-html-jsx";

export const Example = () => {
  // Markdown gets converted to HTML before converting to JSX
  const unsafeMarkdown = `# No DOMs Club!

![No DOMs Club](https://i.imgur.com/JoeK02H.png "No DOMs Club")

<script>alert("Markdown still lets you use HTML too")</script>`;

  // Note: thanks to using `insane` sanitisation library, we can allow/deny certain tags/link schemes/etc.
  const unsafeHtml = `<a href="http://unsecure.website/example">Sign in</a>`;

  return (
    <>
      <MarkdownParser content={unsafeMarkdown} />
      <HTMLParser content={unsafeHtml} />
    </>
  );
};
```

### Advanced usage

You can specify your own element map to customise how each HTML node is rendered via JSX:

```js
const elemMap = {
  ...DEFAULT_HTML_ELEM_MAP,
  a: ({ node, children }) => <Link to={node.attrs.src}>{children}</Link>,
};

<MarkdownParser content={unsafeMarkdown} elemMap={elemMap} />
<HTMLParser content={unsafeHtml} elemMap={elemMap} />
```

You can configure sanitisation of HTML using [insane](https://www.npmjs.com/package/insane):

```js
const insaneConfig = {
  ...DEFAULT_INSANE_CONFIG,
  allowedClasses: {
    div: ["example"],
    a: ["btn", "link"]
  },
}

<MarkdownParser content={unsafeMarkdown} insaneConfig={insaneConfig} />
<HTMLParser content={unsafeHtml} insaneConfig={insaneConfig} />
```

If you want to ignore certain HTML AST nodes, you can do that. By default comments are ignored:

```js
const ignoreHTMLASTNodes = [
  ...DEFAULT_IGNORE_HTML_AST_NODES,
  // Ignore tables
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

<MarkdownParser content={unsafeMarkdown} ignoreHTMLASTNodes={ignoreHTMLASTNodes} />
<HTMLParser content={unsafeHtml} ignoreHTMLASTNodes={ignoreHTMLASTNodes} />
```

## Contribute

Got cool ideas? Have questions or feedback? Found a bug? [Post an issue](https://github.com/lvl99/md-html-jsx/issues)

Added a feature? Fixed a bug? [Post a PR](https://github.com/lvl99/md-html-jsx/compare)

### TODO

- [ ] Decouple from React?

## License

[Apache 2.0](LICENSE)
