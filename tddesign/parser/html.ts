import { parse } from "parse5";

export interface FlatElement {
  tag: string;
  classes: string[];
  text: string;
}

interface ParseNode {
  tagName?: string;
  nodeName?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: ParseNode[];
  value?: string;
}

export function flatten(html: string): FlatElement[] {
  const doc = parse(html) as unknown as ParseNode;
  const out: FlatElement[] = [];
  walk(doc, out);
  return out;
}

function walk(node: ParseNode, out: FlatElement[]): void {
  if (node.tagName) {
    const classAttr = (node.attrs ?? []).find((a) => a.name === "class");
    const classes = classAttr ? classAttr.value.split(/\s+/).filter(Boolean) : [];
    out.push({ tag: node.tagName, classes, text: textOf(node) });
  }
  for (const child of node.childNodes ?? []) walk(child, out);
}

function textOf(node: ParseNode): string {
  let s = "";
  for (const child of node.childNodes ?? []) {
    if (child.nodeName === "#text" && typeof child.value === "string") {
      s += child.value;
    } else {
      s += textOf(child);
    }
  }
  return s;
}
