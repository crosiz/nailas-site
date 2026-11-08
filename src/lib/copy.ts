import { showPrices } from '../data/site';

/**
 * Copy that only makes sense while prices are on the page. When `showPrices` is false (the live build until
 * the studio confirms its rates) each partial gets the rewrites below, so no sentence promises a price that is
 * not there. Every rewrite must match: if someone edits a partial and the old sentence disappears, the build
 * fails here instead of quietly publishing the wrong copy.
 */
const NO_PRICES: Record<string, [from: string, to: string][]> = {
  header: [['Services &amp; prices', 'Services']],
  sheet: [['Services &amp; prices', 'Services']],
  footer: [['Services &amp; prices', 'Services']],
  home: [
    [
      '<summary>Are the prices on the site final?<i></i></summary><p>They’re starting prices. The final price depends on the service and is confirmed on WhatsApp, together with availability, before you book.</p>',
      '<summary>How much will it cost?<i></i></summary><p>The price depends on the service and is confirmed on WhatsApp, together with availability, before you book.</p>',
    ],
    [
      'Starting prices are on this site. The final price is agreed on WhatsApp before we begin.',
      'We share starting prices on WhatsApp. The final price is agreed before we begin.',
    ],
  ],
  services: [
    [
      '</span>Services &amp; prices</p>',
      '</span>Services</p>',
    ],
    [
      'Starting prices in rupees for everything we do. Tap a service to ask about it on WhatsApp, where we confirm the final price before you book.',
      'Everything we do, by category. Tap a service to ask about it on WhatsApp, where we share the price and confirm it before you book.',
    ],
  ],
  bridal: [['Bridal prices', 'Bridal services']],
};

/** Returns `html` unchanged when prices are shown; otherwise applies the price-free rewrites for `name`. */
export function priceCopy(name: string, html: string): string {
  if (showPrices) return html;
  return (NO_PRICES[name] ?? []).reduce((h, [from, to]) => {
    if (!h.includes(from)) throw new Error(`copy.ts: expected text not found in "${name}" partial: ${from.slice(0, 70)}…`);
    return h.split(from).join(to);
  }, html);
}
