import html from '../../index.html?raw';

// Use the actual entry page so missing/renamed elements also break integration tests.
export function mountGameDom() {
  const page = new DOMParser().parseFromString(html, 'text/html');
  document.body.innerHTML = page.body.innerHTML;
}

export function pointer(element, type = 'pointerdown', button = 0) {
  element.dispatchEvent(new PointerEvent(type, { bubbles: true, button }));
}
