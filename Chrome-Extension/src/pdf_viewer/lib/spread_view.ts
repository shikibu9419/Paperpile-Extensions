import { querySelectorAllArray, waitQuerySelector, waitQuerySelectorAll } from "@/utils";

const SPREAD_VIEW_ITEM_CONTENT = `<a data-mp-action="" data-mp-params="">
  <svg class="mp-icon mp-checkmark"><use xlink:href="#mpsvg-check"></use></svg>
  <svg class="mp-icon " style="">
    <use xlink:href="#"></use>
  </svg> Spread View
</a>`;

const LOCALSTORAGE_SPREAD_VIEW = "PAPERPILE_EXTENSIONS__TWO_COLUMNS";
let spreadView = localStorage.getItem(LOCALSTORAGE_SPREAD_VIEW) === "true";

const getCommentId = (e: Element) => e.id.slice(8);
const getHighlightId = (e: Element) => e.id.slice(13);

// 全てのハイライトの注釈を取得
const getAllHighlights = () =>
  querySelectorAllArray(".annotationLayer").reduce(
    (highlights, layer) => [
      ...highlights,
      ...Array.from(layer.children).filter((e) => e.id.startsWith("mp-highlightc")),
    ],
    [] as Element[]
  );

// 指定したコメントのY座標を更新
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

// 設定リスト項目要素のチェック表示を更新
// NOTE: どうやら2つのSVGの表示を切り替えている模様．.mp-checkmarkがついているとdisplay: noneになる
// 1個目：チェックマークのSVG
// 2個目：空白のSVG
const updateCheckmark = (item: Element, checked: boolean) => {
  const hiddenClass = "mp-checkmark";

  item.querySelectorAll("svg").forEach((svg, index) => {
    if (index === 0) {
      if (checked) {
        svg.classList.remove(hiddenClass);
      } else {
        svg.classList.add(hiddenClass);
      }
    } else if (index === 1) {
      if (checked) {
        svg.classList.add(hiddenClass);
      } else {
        svg.classList.remove(hiddenClass);
      }
    }
  });
};

// 1ページ表示に変更
const makeSinglePageView = () => {
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

// 2ページ表示に変更
const makeSpreadView = () => {
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

// ページ表示を切り替える
const toggleViewerColumns = (e: Event) => {
  if (spreadView) {
    makeSinglePageView();
  } else {
    makeSpreadView();
  }

  spreadView = !spreadView;
  localStorage.setItem(LOCALSTORAGE_SPREAD_VIEW, spreadView.toString());

  updateCheckmark(e.currentTarget as Element, spreadView);
};

// MutationObserverの設定
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        // 注釈が追加された場合，その注釈に紐づくコメントのY座標を更新
        if (node instanceof HTMLElement && spreadView && node.matches(".annotationLayer")) {
          for (const annotation of Array.from(node.children)) {
            const annotationId = annotation.id;
            if (!annotationId.startsWith("mp-highlightc")) continue;

            updateCommentY(getHighlightId(annotation));
          }
        }
      });

      mutation.removedNodes.forEach((node) => {
        // 注釈が削除された場合，その注釈に紐づくコメントを非表示にする
        if (node instanceof HTMLElement && spreadView && node.matches(".annotationLayer")) {
          const shownHightlightIds = getAllHighlights().map(getHighlightId);

          for (const comment of querySelectorAllArray(".mp-comment-container")) {
            if (!shownHightlightIds.includes(getCommentId(comment))) {
              (comment as HTMLElement).style.visibility = "hidden";
            }
          }
        }
      });
    }
  });
});

export const initSpreadView = async () => {
  // 設定リスト要素
  const settingsList = await waitQuerySelector("li.mp-dropdown.cog-li ul");
  const spreadViewItem = document.createElement("li");
  spreadViewItem.innerHTML = SPREAD_VIEW_ITEM_CONTENT;
  spreadViewItem.addEventListener("click", toggleViewerColumns);
  updateCheckmark(spreadViewItem, spreadView);

  //   // 設定リストからOpen in Google Driveアイテム要素をコピー
  //   const spreadViewItem = settingsList
  //     ?.querySelector(".mp-menu-label-google-drive")
  //     ?.cloneNode(true) as Element;
  //   // spreadViewItemの子要素を編集していく
  //   const child = spreadViewItem?.querySelector("a");
  //
  //   if (!settingsList || !spreadViewItem || !child) return;
  //
  //   // 2つのチェックマークSVGを取得
  //   const checkmarks = querySelectorAllArray("svg", child).slice(0, 2);
  //   // クリック時のアクションを削除
  //   child.removeAttribute("data-mp-action");
  //   // 内容を全て削除し，新しい内容を追加
  //   child.textContent = "";
  //   child.append(...checkmarks, " Two Columns");

  // spreadViewItemを「Settings」の次に追加する
  const settingsLabel = Array.from(settingsList.children).filter((c) =>
    c.innerHTML.includes("Settings")
  )[0];
  settingsLabel.insertAdjacentElement("afterend", spreadViewItem);

  // 各ページにMutationObserverを追加して注釈のレンダリングを監視
  const spreads = await waitQuerySelectorAll("#mp-viewer > .spread");
  for (const spread of spreads) {
    for (const page of Array.from(spread.children)) {
      observer.observe(page, { childList: true });
    }
  }

  // 初期表示
  if (spreadView) makeSpreadView();
};
