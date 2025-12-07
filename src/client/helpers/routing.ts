export function replaceState(url: string) {
  window.history.replaceState({}, '', url);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
}

export function pushState(url: string) {
  window.history.pushState({}, '', url);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
}

export function onLinkClick(event: React.MouseEvent<HTMLElement>) {
  const href: string = (event.target as Element).getAttribute('href')!;
  event.preventDefault();
  pushState(href);
}
