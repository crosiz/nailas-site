import home from '../partials/home.html?raw';
import services from '../partials/services.html?raw';
import bridal from '../partials/bridal.html?raw';
import academy from '../partials/academy.html?raw';
import contact from '../partials/contact.html?raw';
import book from '../partials/book.html?raw';
import privacy from '../partials/privacy.html?raw';
import { MENU, EVENTS, type Item } from '../data/menu';
import { showPrices, wa } from '../data/site';
import { priceCopy } from './copy';
import { withRef } from './ref';

const raw: Record<string, string> = { home, services, bridal, academy, contact, book, privacy };
const esc = (s: string) => s.replace(/&/g, '&amp;');
const rs = (p: number) => 'Rs ' + p.toLocaleString('en-PK');
const price = (it: Item) => (!showPrices || it.p == null ? '<span class="price">Ask</span>' : '<span class="price"><small>from</small>' + rs(it.p) + '</span>');
const row = (it: Item) => '<li><b>' + esc(it.n) + (it.isNew ? ' <span class="tag-new">New</span>' : '') + '</b>' + price(it) + '<span class="desc">' + esc(it.d) + '</span></li>';
const item = (it: Item, k: number) => '<li style="--i:' + k + '"><a class="menu-item' + (showPrices ? '' : ' menu-item--np') + '" href="' + wa('I’d like to ask about ' + it.n + '.') + '" target="_blank" rel="noopener"><span class="menu-item__text"><span class="menu-item__name">' + esc(it.n) + (it.isNew ? '<span class="tag-new">New</span>' : '') + '</span><span class="menu-item__desc">' + esc(it.d) + '</span></span>' + (!showPrices ? '' : '<span class="menu-item__price">' + (it.p == null ? 'Ask' : '<small>from</small>' + rs(it.p)) + '</span>') + '<svg class="menu-item__go" aria-hidden="true"><use href="#i-arrow"/></svg><span class="sr">, ask on WhatsApp</span></a></li>';

export function renderView(name: string): string {
  let h = priceCopy(name, raw[name]);
  const tops = MENU.flatMap((c) => c.items.filter((i) => i.top));
  h = h.replace('<div class="hl__list" id="hlList"></div>', '<div class="hl__list" id="hlList"><ul class="prices">' + tops.map(row).join('') + '</ul></div>');
  h = h.replace('<ul class="evlist" id="evList"></ul>', '<ul class="evlist" id="evList">' + EVENTS.map((e) => '<li><b>' + e.n + '</b><span>' + e.d + '</span>' + (showPrices ? '<em><small>from</small>' + rs(e.p) + '</em>' : '') + '</li>').join('') + '</ul>');
  h = h.replace('<div class="ev4 rvk" id="eventsList"></div>', '<div class="ev4 rvk" id="eventsList">' + EVENTS.map((e, k) => '<div class="ev" style="--i:' + k + '"><h3>' + e.n + '</h3><p>' + e.d + '</p>' + (showPrices ? '<p class="ev__price"><small>from</small>' + rs(e.p) + '</p>' : '') + '</div>').join('') + '</div>');
  h = h.replace('<ul class="svc-list rvk" id="svcList"></ul>', '<ul class="svc-list rvk" id="svcList">' + MENU.map((c, k) => '<li style="--i:' + k + '"><a href="/services/#cat-' + c.id + '"><span class="ix__name">' + esc(c.name) + '</span><span class="svc__intro">' + esc(c.intro) + '</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a></li>').join('') + '</ul>');
  h = h.replace('<ol id="menuIndex"></ol>', '<ol id="menuIndex">' + MENU.map((c, k) => '<li><a href="#cat-' + c.id + '" data-cat="' + c.id + '"><span class="ix__name">' + c.name + '</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a></li>').join('') + '</ol>');
  h = h.replace('<span class="tabs-bar__ink" aria-hidden="true"></span></div>', '<span class="tabs-bar__ink" aria-hidden="true"></span>' + MENU.map((c) => '<button type="button" data-cat="' + c.id + '">' + c.name + '</button>').join('') + '</div>');
  h = h.replace('<div id="catList"></div>', '<div id="catList">' + MENU.map((c) => '<section class="menu-cat" id="cat-' + c.id + '" aria-labelledby="h-' + c.id + '"><div class="wrap menu-cat__in"><div class="menu-cat__head rv"><h2 id="h-' + c.id + '">' + c.name + '</h2><p class="menu-cat__intro">' + c.intro + '</p>' + (c.id === 'bridal' ? '<a class="link" href="/bridal/">Bridal details <svg><use href="#i-arrow"/></svg></a>' : '') + '</div><ul class="menu-list rvk">' + c.items.map(item).join('') + '</ul></div></section>').join('') + '</div>');
  if (!showPrices) {
    h = h.replace(/<p class="sample-note">[\s\S]*?<\/p>/g, '');
    // Home price highlights are all samples: leave the section out of a live build.
    h = h.replace(/<section class="sec" aria-labelledby="hlTitle">[\s\S]*?<\/section>\s*/, '');
  }
  return withRef(h, 'web-' + name);
}
