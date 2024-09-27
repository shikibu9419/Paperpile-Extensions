import { setValueToInput } from "../utils";

function processQueryParams() {
  // 現在のURLからクエリストリングを取得
  const params: { [key: string]: string | undefined } = {};
  new URLSearchParams(window.location.search).forEach((value: string, key: string) => {
    params[key] = value;
  });

  const { q, title, author, year, abstract, pdf, doi } = params;

  let searchQuery = q || "";

  if (title) searchQuery += ` title:${title}`;
  if (author) searchQuery += ` author:${author}`;
  if (year) searchQuery += ` year:${year}`;
  if (abstract) searchQuery += ` abstract:${abstract}`;
  if (pdf) searchQuery += ` pdf:${pdf}`;

  if (searchQuery) {
    const searchForm = document.querySelector(
      'input[placeholder="Search library"]'
    ) as HTMLInputElement;
    if (searchForm) setValueToInput(searchForm, searchQuery);
  }
}

processQueryParams();
