import { querySelectorAllArray, waitQuerySelector } from "../utils";

const TWO_COLUMNS_KEY = "PAPERPILE_EXTENSIONS__TWO_COLUMNS";
let twoColumns = localStorage.getItem(TWO_COLUMNS_KEY) === "true";

const makeViewerSingleColumn = () => {
  const pagesRoot = document.getElementById("mp-viewer");
  if (pagesRoot) {
    Array.from(pagesRoot.children).forEach((c) => {
      (c as HTMLElement).style.display = "";
    });
  }

  const comments = Array.from(
    document.getElementById("mp-comments-list")?.children || []
  ) as HTMLElement[];
  comments.forEach((c, index) => {
    c.style.marginLeft = "0";
    c.style.marginTop = "0";
  });
};

const makeViewerTwoColumns = () => {
  const pageRects = Array.from(document.querySelectorAll("#mp-viewer .page") || []).map((c) =>
    c.getBoundingClientRect()
  );
  const comments = Array.from(
    document.getElementById("mp-comments-list")?.children || []
  ) as HTMLElement[];
  const commentPageNumbers = comments.map(
    (c) =>
      pageRects.findIndex(
        (p) => p.top <= c.getBoundingClientRect().top && c.getBoundingClientRect().top <= p.bottom
      ) + 1
  );
  // const commentPageGroups = commentPageNumbers.map((n) => Math.ceil(n / 2))

  const pageSize = pageRects[0];
  const commentOffsets = comments.map((c, index) => {
    const pageNumber = commentPageNumbers[index];
    const y = -pageSize.height * Math.floor(pageNumber / 2);
    let x = 0;
    if (pageNumber % 2 === 0) {
      x = -pageSize.width;
    }

    return { x, y };
  });

  const centerPanel = document.getElementById("mp-center-panel");
  if (centerPanel) {
    centerPanel.style.marginLeft = "0";
    centerPanel.style.justifyContent = "center";
  }

  const pagesRoot = document.getElementById("mp-viewer");
  if (pagesRoot) {
    Array.from(pagesRoot.children).forEach((c) => {
      (c as HTMLElement).style.display = "flex";
    });
  }

  comments.forEach((c, index) => {
    const marginLeft = -parseFloat(c.style.transform.slice(11, -3));
    const marginTop = commentOffsets[index].y;
    c.style.marginLeft = `${marginLeft}px`;
    c.style.marginTop = `${marginTop}px`;
  });
};

// 設定リスト項目要素のチェック表示を更新
// NOTE: どうやら2つのSVGの表示を切り替えている模様．.mp-checkmarkがついているとdisplay: noneになる
// 1個目：チェックマークのSVG
// 2個目：空白のSVG
const updateCheckmark = (elem: Element) => {
  elem.querySelectorAll("svg").forEach((svg, index) => {
    // checkmark
    if (index === 0) {
      if (twoColumns) svg.classList.remove("mp-checkmark");
      else svg.classList.add("mp-checkmark");
      // spacer
    } else {
      if (twoColumns) svg.classList.add("mp-checkmark");
      else svg.classList.remove("mp-checkmark");
    }
  });
};

const toggleViewerColumns = (e: Event) => {
  if (twoColumns) {
    makeViewerSingleColumn();
  } else {
    makeViewerTwoColumns();
  }
  twoColumns = !twoColumns;
  updateCheckmark(e.currentTarget as Element);
  localStorage.setItem(TWO_COLUMNS_KEY, twoColumns.toString());
};

const addTwoColumnsButton = async () => {
  // 設定リスト要素
  const settingsList = await waitQuerySelector("li.mp-dropdown.cog-li ul");
  // 設定リストからOpen in Google Driveアイテム要素をコピー
  const twoColumnItem = settingsList
    ?.querySelector(".mp-menu-label-google-drive")
    ?.cloneNode(true) as Element;
  // twoColumnItemの子要素を編集していく
  const child = twoColumnItem?.querySelector("a");

  if (!settingsList || !twoColumnItem || !child) return;

  // 2つのチェックマークSVGを取得
  const checkmarks = querySelectorAllArray("svg", child).slice(0, 2);
  // クリック時のアクションを削除
  child.removeAttribute("data-mp-action");
  // 内容を全て削除し，新しい内容を追加
  child.textContent = "";
  child.append(...checkmarks, " Two Columns");

  // twoColumnItemを「Settings」の次に追加する
  const settingsLabel = Array.from(settingsList.children).filter((c) =>
    c.innerHTML.includes("Settings")
  )[0];
  settingsLabel.insertAdjacentElement("afterend", twoColumnItem);

  twoColumnItem.addEventListener("click", toggleViewerColumns);
  updateCheckmark(twoColumnItem);

  if (twoColumns && (await waitQuerySelector("#mp-viewer > .spread"))) makeViewerTwoColumns();
};

addTwoColumnsButton();

document.addEventListener("copy", async (event: ClipboardEvent) => {
  event.preventDefault();
  const copiedText = (await navigator.clipboard.readText()).replace("\n", " ");
  navigator.clipboard.writeText(copiedText);
});
