import { querySelectorAllArray, waitQuerySelector, waitQuerySelectorAll } from "../utils";

const getAllHighlights = () =>
  querySelectorAllArray(".annotationLayer").reduce(
    (highlights, layer) => [
      ...highlights,
      ...Array.from(layer.children).filter((e) => e.id.startsWith("mp-highlightc")),
    ],
    [] as Element[]
  );

const updateCommentY = (commentId: string) => {
  const comment = document.getElementById(`commentc${commentId}`);
  const highlight = document.getElementById(`mp-highlightc${commentId}`)
    ?.firstChild as HTMLElement | null;

  if (comment && highlight) {
    comment.style.visibility = "visible";

    if (!comment.style.marginLeft.length) {
      const offsetX = -parseFloat(comment.style.transform.slice(11, -3));
      comment.style.marginLeft = `${offsetX}px`;
    }

    if (!comment.style.marginTop.length) {
      const offsetY = comment.getBoundingClientRect().top - highlight.getBoundingClientRect().top;
      comment.style.marginTop = `-${offsetY}px`;
    }
  }
};

const getCommentId = (e: Element) => e.id.slice(8);
const getHighlightId = (e: Element) => e.id.slice(13);

const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement && twoColumns && node.matches(".annotationLayer")) {
          const shownHightlightIds = getAllHighlights().map(getHighlightId);

          for (const comment of querySelectorAllArray(".mp-comment-container")) {
            if (!shownHightlightIds.includes(getCommentId(comment))) {
              (comment as HTMLElement).style.visibility = "hidden";
            }
          }
        }
      });

      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && twoColumns && node.matches(".annotationLayer")) {
          for (const annotation of Array.from(node.children)) {
            const annotationId = annotation.id;
            if (!annotationId.startsWith("mp-highlightc")) continue;

            updateCommentY(getHighlightId(annotation));
          }
        }
      });
    }
  });
});

const TWO_COLUMNS_KEY = "PAPERPILE_EXTENSIONS__TWO_COLUMNS";
let twoColumns = localStorage.getItem(TWO_COLUMNS_KEY) === "true";

const makeViewerSingleColumn = () => {
  const pagesRoot = document.getElementById("mp-viewer");
  if (pagesRoot) {
    Array.from(pagesRoot.children).forEach((c) => {
      (c as HTMLElement).style.display = "";
    });
  }

  for (const comment of querySelectorAllArray(".mp-comment-container")) {
    (comment as HTMLElement).style.marginLeft = "";
    (comment as HTMLElement).style.marginTop = "";
  }
};

const makeViewerTwoColumns = () => {
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

  getAllHighlights().map(getHighlightId).forEach(updateCommentY);
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

  const spreads = await waitQuerySelectorAll("#mp-viewer > .spread");
  for (const spread of spreads) {
    for (const page of Array.from(spread.children)) {
      observer.observe(page, { childList: true });
    }
  }

  if (twoColumns) makeViewerTwoColumns();
};

addTwoColumnsButton();

document.addEventListener("copy", async (event: ClipboardEvent) => {
  event.preventDefault();
  const copiedText = (await navigator.clipboard.readText()).replace("\n", " ");
  navigator.clipboard.writeText(copiedText);
});

let disableScroll = false;

// クリックイベントの監視
document.addEventListener("mousedown", () => {
  disableScroll = true;

  // Nミリ秒後にスクロールを再度有効にする
  setTimeout(() => {
    disableScroll = false;
  }, 300);
});

let previousScrollTop = 0;
let scrollPanel: Element | null = null;
// スクロール関連のイベントをキャンセルする関数
function preventScroll(event: Event) {
  if (disableScroll && scrollPanel) {
    scrollPanel.scrollTop = previousScrollTop;
  } else {
    previousScrollTop = scrollPanel?.scrollTop || 0;
  }
}

waitQuerySelector("#mp-center-panel")?.then((centerPanel) => {
  scrollPanel = centerPanel;
  previousScrollTop = centerPanel.scrollTop;
  centerPanel.addEventListener("scroll", preventScroll);
});
