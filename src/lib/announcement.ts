import { ANNOUNCEMENT, POSTER } from '../data/site';

/** A date in Pakistan as YYYY-MM-DD. */
const karachiDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(d);

const unit = (key: string, long: string) => `<span class="ann__u"><b data-u="${key}">00</b><i data-s="${key}">${long}</i></span>`;

/**
 * The announcement bar as HTML, or '' when there is none (not set, or past its end date).
 *
 * The markup carries every wording and CSS shows the one for the current state (data-state on the bar):
 *   before  counting down to the opening
 *   open    the opening day, from the moment the studio opens until it closes
 *   after   every other time after the opening: says the studio is open and gives the hours
 * The state is set here when the site is built and again in the browser (src/scripts/site.ts), which also runs the
 * countdown, so the wording stays right on days when nobody rebuilds the site. Without JavaScript there is no clock,
 * only the date, which is always true.
 */
export function announcement(): { html: string; on: boolean } {
  if (!ANNOUNCEMENT) return { html: '', on: false };
  const now = new Date();
  if (karachiDay(now) > ANNOUNCEMENT.until) return { html: '', on: false };
  const state = now.getTime() < new Date(ANNOUNCEMENT.opens).getTime() ? 'before' : 'after';
  const html =
    `<a class="ann" id="ann" href="/contact/" data-state="${state}" data-opens="${ANNOUNCEMENT.opens}" data-until="${ANNOUNCEMENT.until}">` +
    `<span class="wrap ann__in">` +
    `<span class="ann__tag"><span data-for="before open">Grand opening</span><span data-for="after">Now open</span></span>` +
    `<span class="ann__msg">` +
    `<span data-for="before">Friday 13 November, 11 am.</span>` +
    `<span data-for="open">Open today until 8 pm.</span>` +
    `<span data-for="after">Wed to Mon, 11 am to 8 pm.</span>` +
    `<span class="ann__more" data-for="after"> Closed on Tuesdays.</span>` +
    `</span>` +
    `<span class="ann__timer" data-for="before" aria-hidden="true">${unit('d', 'days')}${unit('h', 'hrs')}${unit('m', 'min')}${unit('s', 'sec')}</span>` +
    `<svg class="ann__go" aria-hidden="true"><use href="#i-arrow"/></svg>` +
    `</span></a>`;
  return { html, on: true };
}

/**
 * The opening poster pop-up, for the home page only, or '' when there is none or it is past its last day. It stays
 * closed until the script (src/scripts/site.ts) opens it; the image is only downloaded at that point.
 */
export function posterDialog(view: string): string {
  if (!POSTER || view !== 'home' || karachiDay(new Date()) > POSTER.until) return '';
  return (
    `<dialog class="poster" id="poster" aria-label="Grand opening" data-until="${POSTER.until}">` +
    `<img data-src="${POSTER.src}" alt="${POSTER.alt}" width="${POSTER.width}" height="${POSTER.height}">` +
    `<button type="button" class="poster__close" aria-label="Close the poster"><svg aria-hidden="true"><use href="#i-close"/></svg></button>` +
    `</dialog>`
  );
}
