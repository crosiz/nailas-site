/**
 * Two builds, one codebase:
 *
 * LIVE (default: `npm run build`, `npm run dev`): this is what gets deployed. The design's sample prices, the
 * "sample" notes and the home price highlights are left out, and the copy stops promising prices that are not on
 * the page (see `src/lib/copy.ts`), so nothing the studio has not confirmed is published.
 *
 * PREVIEW (`npm run build:preview`, `npm run dev:preview`): the approved design with its sample prices, for
 * showing the studio. Never deploy this one. It is selected with Astro's `--mode preview`, which works the same
 * on Windows, macOS and Linux.
 *
 * When Naila sends her real prices: edit them in `src/data/menu.ts`, then set `pricesConfirmed = true` below.
 * Every build then shows prices and the price copy comes back on its own.
 */
export const PREVIEW: boolean = import.meta.env.MODE === 'preview';
export const pricesConfirmed = false;
export const showPrices: boolean = PREVIEW || pricesConfirmed;
export const SERVICES_LABEL = showPrices ? 'Services & prices' : 'Services';
export const PHONE = '+923335559049'; // the number people call; WA below is the same number, for WhatsApp
export const WA = 'https://wa.me/923335559049?text=';
export const wa = (m: string) => WA + encodeURIComponent('Hi Naila’s, ' + m);
