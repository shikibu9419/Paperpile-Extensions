import { useCallback, useState } from "react";
import { Action, ActionPanel, Color, getPreferenceValues, Icon, List, PreferenceValues } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import fs from "fs";
import FuzzySearch from "fuzzy-search";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as bibtexParse from "bibtex-parse";

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

const bibtex = fs.readFileSync(bibtexPath, "utf8");

const trimString = (str: string) => str.replace(/\s+/g, " ").trim();

const allItems: BibItem[] = bibtexParse.entries(bibtex).map((item: any) => ({
  ...item,
  TITLE: trimString(item.TITLE || ""),
  AUTHOR: trimString(item.AUTHOR || ""),
  ABSTRACT: trimString(item.ABSTRACT || ""),
  KEYWORDS: item.KEYWORDS?.split(",")?.map((k: string) => k.trim()) || [],
}));

const searcher = new FuzzySearch(allItems, ["TITLE", "AUTHOR", "KEYWORDS", "ABSTRACT"], {
  caseSensitive: false,
  sort: true,
});

export default function Command() {
  const [showDetails, setShowDetails] = useCachedState("show-details", true);
  const [items, setItems] = useState(allItems);

  const handleTextChange = useCallback(
    (text: string) => {
      setItems(searcher.search(text));
    },
    [searcher, allItems]
  );

  return (
    <List isShowingDetail={showDetails} onSearchTextChange={handleTextChange}>
      {items.map((item) => (
        <List.Item
          key={item.key}
          icon={{ source: Icon.Document, tintColor: Color.Green }}
          title={item.TITLE}
          subtitle={item.AUTHOR}
          keywords={item.KEYWORDS}
          detail={
            <List.Item.Detail
              markdown={item.ABSTRACT}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label title="Title" text={item.TITLE} />
                  <List.Item.Detail.Metadata.Label title="Author" text={item.AUTHOR} />
                  <List.Item.Detail.Metadata.Label title="Journal" text={item.JOURNAL} />
                  <List.Item.Detail.Metadata.Label title="DOI" text={item.DOI} />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser
                title="Open in Paperpile"
                url={`https://app.paperpile.com/my-library/all?title=${item.TITLE}`}
              />
              {item.URL && <Action.OpenInBrowser title="Open DOI" url={item.URL} />}
              <Action
                icon={Icon.AppWindowSidebarRight}
                shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                title={showDetails ? "Hide Details" : "Show Details"}
                onAction={() => setShowDetails((value) => !value)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
