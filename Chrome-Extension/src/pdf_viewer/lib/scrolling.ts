let _scrollable: Element | null = null;
let disableScroll = false;
let previousScrollTop = 0;

// ユーザがマウスを押してから300ms以内はスクロールを禁止する
// ハイライトをクリックした時のスクロールを防ぐため
export const onMousedown = () => {
  disableScroll = true;

  // Nミリ秒後にスクロールを再度有効にする
  setTimeout(() => {
    disableScroll = false;
  }, 300);
};

export const preventAutoScrolling = (scrollable: Element) => {
  // init
  _scrollable = scrollable;
  previousScrollTop = _scrollable.scrollTop;

  _scrollable.addEventListener("scroll", () => {
    if (disableScroll && _scrollable) {
      _scrollable.scrollTop = previousScrollTop;
    } else {
      previousScrollTop = _scrollable?.scrollTop || 0;
    }
  });
};
