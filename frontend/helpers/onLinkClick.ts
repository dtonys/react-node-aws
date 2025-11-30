export default function onLinkClick(event: React.MouseEvent<HTMLElement>) {
  const href: string = (event.target as Element).getAttribute('href')!;
  event.preventDefault();
  window.history.pushState({}, '', href);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
}
