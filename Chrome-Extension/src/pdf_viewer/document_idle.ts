import { waitQuerySelector } from "@/utils";
import { onMousedown, preventAutoScrolling } from "./lib/scrolling";
import { initSpreadView } from "./lib/spread_view";

document.addEventListener("mousedown", onMousedown);

// コピー時に改行をスペースに変換
document.addEventListener("copy", async (event: ClipboardEvent) => {
  event.preventDefault();
  const copiedText = (await navigator.clipboard.readText()).replace("\n", " ");
  navigator.clipboard.writeText(copiedText);
});

// 見開き表示設定
initSpreadView();

// ハイライトのクリックによる不意のスクロールを防ぐ
waitQuerySelector("#mp-center-panel")?.then((centerPanel) => {
  preventAutoScrolling(centerPanel);
});
