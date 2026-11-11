import { ANNOUNCEMENT } from '../data/site';

/** Today's date in Pakistan as YYYY-MM-DD. */
const karachiToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());

/**
 * The announcement bar as HTML, or '' when there is none (not set, or past its end date).
 *
 * The markup carries all three wordings and CSS shows the one for the current state (data-state on the bar). The
 * state is worked out here when the site is built and again in the browser (src/scripts/site.ts), so the wording stays
 * right on days when nobody rebuilds the site. Without JavaScript the wording is the one in the markup, which is
 * always true.
 */
export function announcement(): { html: string; on: boolean } {
  if (!ANNOUNCEMENT) return { html: '', on: false };
  const today = karachiToday();
  if (today > ANNOUNCEMENT.until) return { html: '', on: false };
  const state = today < ANNOUNCEMENT.launch ? 'before' : today === ANNOUNCEMENT.launch ? 'today' : 'after';
  const html =
    `<a class="ann" id="ann" href="/contact/" data-state="${state}" data-launch="${ANNOUNCEMENT.launch}" data-until="${ANNOUNCEMENT.until}">` +
    `<span class="wrap ann__in">` +
    `<span class="ann__tag"><span data-for="before today">Soft launch</span><span data-for="after">Now open</span></span>` +
    `<span class="ann__msg">` +
    `<span data-for="before">Wed 11 Nov, 4:00 PM.</span>` +
    `<span data-for="today">Today at 4:00 PM.</span>` +
    `<span data-for="after">Wed to Mon, 11 am to 8 pm.</span>` +
    `<span class="ann__more" data-for="before today"> Open Wednesday to Monday, 11 am to 8 pm.</span>` +
    `<span class="ann__more" data-for="after"> Closed on Tuesdays.</span>` +
    `</span>` +
    `<svg class="ann__go" aria-hidden="true"><use href="#i-arrow"/></svg>` +
    `</span></a>`;
  return { html, on: true };
}
