import { waitQuerySelector } from "./utils";

let twoColumns = false;

const makeViewerSingleColumn = () => {
  const pagesRoot = document.getElementById("mp-viewer");
  if (pagesRoot) {
    pagesRoot.style.display = "";
    pagesRoot.style.gridTemplateColumns = "";
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
  const pageRects = Array.from(document.getElementById("mp-viewer")?.children || []).map((c) =>
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
    pagesRoot.style.display = "grid";
    pagesRoot.style.gridTemplateColumns = "repeat(2, 50%)";
  }

  comments.forEach((c, index) => {
    const marginLeft = -parseFloat(c.style.transform.slice(11, -3));
    const marginTop = commentOffsets[index].y;
    c.style.marginLeft = `${marginLeft}px`;
    c.style.marginTop = `${marginTop}px`;
  });
};

const toggleViewerColumns = () => {
  if (twoColumns) {
    makeViewerSingleColumn();
  } else {
    makeViewerTwoColumns();
  }
  twoColumns = !twoColumns;
};

const addTwoColumnsButton = async () => {
  const settingsList = await waitQuerySelector("li.mp-dropdown.cog-li ul");
  // const settingsList = document.querySelector("li.mp-dropdown.cog-li ul");
  const twoColumnItem = settingsList?.querySelector(".mp-menu-label-google-drive")?.cloneNode(true);
  const child = (twoColumnItem as Element)?.querySelector("a");
  console.log(settingsList, twoColumnItem, child);
  if (!settingsList || !twoColumnItem || !child) return;

  const spacer = child.querySelectorAll("svg")[1];
  child.removeAttribute("data-mp-action");
  child.textContent = "";
  child.append(spacer, " Two Columns");

  const settingsLabel = Array.from(settingsList.children).filter((c) =>
    c.innerHTML.includes("Settings")
  )[0];
  settingsLabel.insertAdjacentElement("afterend", twoColumnItem as Element);

  twoColumnItem.addEventListener("click", toggleViewerColumns);
};

addTwoColumnsButton();
