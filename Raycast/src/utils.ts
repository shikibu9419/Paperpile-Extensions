import { Icon } from "@raycast/api";

interface Item {
  title: string;
  subtitle?: string;
  keywords?: string[];
  path: string;
  icon: string;
}

const getIconByExt = (path: string): string => {
  const ext = path.split(".").slice(-1)[0];
  if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) return Icon.Document;
  if (["png", "jpg", "jpeg"].includes(ext)) return Icon.Image;
  if (ext.length === path.length) return Icon.Folder;

  return Icon.ChevronRight;
};

export const parsePath = (path: string, parsePattern: string): Item => {
  let title = path;
  let subtitle = "";
  const keywords: string[] = [];
  const icon = getIconByExt(path);

  // %t, %s, %{k:} -> title, subtitle, keywords
  // e.g. "conf/author et al - paper.pdf" parsed with "%k/%s - %t"
  // -> title: "paper", subtitle: "author et al, conf", keywords: "conf"
  // "%{k: }/%s - %t" -> ["%{k: }", "%s", "%t"]
  const patterns = [...parsePattern.matchAll(/(%[tsk]|%\{k:(.+)\})/g)].map((p) => ({
    value: p[0],
    delimiter: p[2],
    start: p.index || 0,
    end: (p.index || 0) + p[0].length,
  }));

  if (!patterns.length) {
    return { title, path, icon };
  }

  let refIndex = 0;
  for (const [index, p] of patterns.entries()) {
    let extracted = path.slice(refIndex);
    const next = patterns[index + 1];
    if (next) {
      const splitter = parsePattern.slice(p.end, next.start);
      extracted = extracted.split(splitter)[0];
      refIndex += splitter.length;
    }

    refIndex += extracted.length;

    if (!extracted) continue; // TODO: raise error

    switch (p.value) {
      case "%t":
        title = extracted;
        break;
      case "%s":
        subtitle = extracted;
        break;
      case "%k":
        keywords.push(extracted);
        break;
      default:
        break;
    }

    if (/%\{k:(.+)\}/.test(p.value) && p.delimiter) keywords.push(...extracted.split(p.delimiter));
  }

  return {
    title,
    subtitle,
    keywords,
    path,
    icon,
  };
};
