import { parse } from "parse5";

export interface FlatElement {
  tag: string;
  classes: string[];
  id?: string;
  style?: string;
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
    const attrs = node.attrs ?? [];
    const classAttr = attrs.find((a) => a.name === "class");
    const classes = classAttr ? classAttr.value.split(/\s+/).filter(Boolean) : [];
    const idAttr = attrs.find((a) => a.name === "id");
    const styleAttr = attrs.find((a) => a.name === "style");
    out.push({
      tag: node.tagName,
      classes,
      id: idAttr?.value,
      style: styleAttr?.value,
      text: textOf(node),
    });
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
