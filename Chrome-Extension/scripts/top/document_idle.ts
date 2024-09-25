import { waitQuerySelector } from "../utils";

function appendNoteButton(element: Element) {
  const nextButton = element.cloneNode();
  nextButton.textContent = "Note";
  nextButton.addEventListener("mousedown", (e) => {
    alert("not implemented");
  });

  element.insertAdjacentElement("beforebegin", nextButton as Element);
}

const selector = "div.referenceAnimation";
const observer = new MutationObserver((mutationsList, observer) => {
  console.log("new mutation:", mutationsList);
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element && node.matches(selector)) {
          const button = node.querySelector<HTMLButtonElement>("button.referencePdfButton");
          if (button) appendNoteButton(button);
        }
      });
    }
  });
});

async function initNoteButton() {
  const root = await waitQuerySelector(".ReactVirtualized__Grid__innerScrollContainer");

  if (root) {
    root.querySelectorAll<HTMLButtonElement>("button.referencePdfButton").forEach((pdfButton) => {
      appendNoteButton(pdfButton);
    });

    observer.observe(root, { childList: true });
  }
}

initNoteButton();
