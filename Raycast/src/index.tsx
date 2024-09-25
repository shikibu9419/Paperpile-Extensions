import { useCallback, useState } from "react";
import { Color, getPreferenceValues, Icon, List, PreferenceValues } from "@raycast/api";
import fs from 'fs';
// @ts-ignore
import * as bibtexParse from 'bibtex-parse';
import FuzzySearch from 'fuzzy-search';

interface BibItem {
  key: string; // cite key
  type: string; // article, book, etc.
  TITLE: string;
  ABSTRACT: string;
  AUTHOR: string;
  JOURNAL: string;
  DOI: string;
  URL: string;
  FILE: string;
  KEYWORDS: string[];
}

const { bibtexPath }: PreferenceValues = getPreferenceValues();

const bibtex = fs.readFileSync(bibtexPath, 'utf8');


const trimString = (str: string) => str.replace(/\s+/g, ' ').trim();

const items: BibItem[] = bibtexParse.entries(bibtex).map((item: any) => ({
  ...item,
  TITLE: trimString(item.TITLE || ''),
  AUTHOR: trimString(item.AUTHOR || ''),
  ABSTRACT: trimString(item.ABSTRACT || ''),
  KEYWORDS: item.KEYWORDS?.split(',')?.map((k: string) => k.trim()) || [],
}))

const searcher = new FuzzySearch(items, ['TITLE', 'AUTHOR', 'KEYWORDS', 'ABSTRACT'], {
  caseSensitive: false,
  sort: true,
});

export default function Command() {
  const [filteredItems, setFilteredItems] = useState(items);

  const handleTextChange = useCallback((text: string) => {
    setFilteredItems(searcher.search(text));
  }, [searcher, items])

  return (
    <List isShowingDetail onSearchTextChange={handleTextChange}>
      {filteredItems.map((item, index) => (
        <List.Item
          key={index}
          icon={{ source: Icon.Document, tintColor: Color.Green }}
          title={item.TITLE}
          subtitle={item.AUTHOR}
          keywords={item.KEYWORDS}
          detail={<List.Item.Detail markdown={item.ABSTRACT} metadata={
            <List.Item.Detail.Metadata>
            <List.Item.Detail.Metadata.Label title="Title" text={item.TITLE} />
            <List.Item.Detail.Metadata.Label title="Author" text={item.AUTHOR} />
            <List.Item.Detail.Metadata.Label title="Journal" text={item.JOURNAL} />
            <List.Item.Detail.Metadata.Label title="DOI" text={item.DOI} />
            </List.Item.Detail.Metadata>
          } />}
//           actions={
//             <ActionPanel>
//               <Action.Open title="Open file" target={`${targetDir}/${item.path}`} />
//               <Action.CopyToClipboard title="Copy to Clipboard" content={`${targetDir}/${item.path}`} />
//               <Action.Push title="Help" target={<Help />} />
//             </ActionPanel>
//           }
        />
      ))}
    </List>
  );
}
