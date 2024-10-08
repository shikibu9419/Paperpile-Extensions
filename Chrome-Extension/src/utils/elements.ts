export async function waitQuerySelector(
  selector: string,
  node = document,
  interval = 100,
  timeout = 10000
): Promise<Element> {
  let obj: Element | null = null;

  while (!obj) {
    obj = await new Promise<Element | null>((resolve) =>
      setTimeout(() => resolve(node.querySelector(selector)), interval)
    );
    timeout -= interval;

    if (timeout <= 0) throw new Error(`Timeout: ${selector} is not found`);
  }

  return obj;
}

export async function waitQuerySelectorAll(
  selector: string,
  node = document,
  interval = 100,
  timeout = 10000
): Promise<Element[]> {
  let obj: Element[] | null = null;

  while (!obj?.length) {
    obj = await new Promise<Element[] | null>((resolve) =>
      setTimeout(() => resolve(querySelectorAllArray(selector, node)), interval)
    );
    timeout -= interval;

    if (timeout <= 0) throw new Error(`Timeout: ${selector} is not found`);
  }

  return obj;
}

export const querySelectorAllArray = <T extends Element>(
  selector: string,
  parent: ParentNode = document
): T[] => Array.from(parent.querySelectorAll(selector)) as T[];
