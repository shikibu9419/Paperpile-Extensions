interface ReactInputElement extends HTMLInputElement {
  _valueTracker?: {
    setValue: (value: string) => void;
  };
}

export function setValueToInput(element: ReactInputElement, value: string) {
  const lastValue = element.value;
  element.value = value;
  const event = new Event("change", { bubbles: true });
  const tracker = element._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  element.dispatchEvent(event);
}
