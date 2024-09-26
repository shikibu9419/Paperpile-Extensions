import { waitQuerySelector } from "../utils";

type ButtonFunctionArgs = { event: Event; item: Element };

function appendReadablePDF(item: Element) {
  const title = item.querySelector("span.pp-grid-titletext")?.textContent;
  console.log(title, import.meta.env.VITE_READABLE_API_URL);
  alert("not implemented");
  // fetch(READABLE_API_URL, { method: "POST", body: JSON.stringify({ title }) });
}

// TODO: ユーザが設定可能に
const buttons: [[string, (args: ButtonFunctionArgs) => void]] = [
  ["Readable", ({ item }) => appendReadablePDF(item)],
];

const REFERENCE_ITEM_SELECTOR = "div.referenceAnimation";
const REFERENCE_ITEM_BUTTON_SELECTOR = "button.referencePdfButton";

function appendButtons(referenceItem: Element) {
  buttons.forEach(([label, action]) => {
    const existsButton = referenceItem.querySelector<HTMLButtonElement>(
      REFERENCE_ITEM_BUTTON_SELECTOR
    );
    if (!existsButton) return;

    const newButton = document.createElement("button");
    newButton.classList.add("referencePdfButton");
    newButton.textContent = label;
    newButton.addEventListener("mousedown", (event) => action({ event, item: referenceItem }));

    existsButton.insertAdjacentElement("beforebegin", newButton as Element);
  });
}

const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element && node.matches(REFERENCE_ITEM_SELECTOR)) {
          appendButtons(node);
        }
      });
    }
  });
});

async function initNoteButton() {
  const root = await waitQuerySelector(".ReactVirtualized__Grid__innerScrollContainer");

  if (root) {
    root.querySelectorAll<HTMLButtonElement>(REFERENCE_ITEM_SELECTOR).forEach((item) => {
      appendButtons(item);
    });

    observer.observe(root, { childList: true });
  }
}

initNoteButton();
