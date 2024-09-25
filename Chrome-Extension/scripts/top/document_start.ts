import { setValueToInput } from "../utils";

function processQueryParams() {
  console.log(new URLSearchParams(window.location.search));
  // 現在のURLからクエリストリングを取得
  const urlParams = new URLSearchParams(window.location.search);

  let query = "";
  let doi = "";

  urlParams.forEach((value, key) => {
    if (key === "q") {
      query = value;
    } else if (key === "doi") {
      doi = value;
    }
  });

  // クエリストリングをコンソールに出
  if (query) {
    const searchForm = document.querySelector(
      'input[placeholder="Search library"]'
    ) as HTMLInputElement;
    if (searchForm) setValueToInput(searchForm, query);
  }
}

processQueryParams();
