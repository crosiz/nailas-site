export const SERVICES_LABEL = 'Services';
export const PHONE = '+923335559049'; // the number people call; WA below is the same number, for WhatsApp
export const WA = 'https://wa.me/923335559049?text=';
export const wa = (m: string) => WA + encodeURIComponent('Hi Naila’s, ' + m);

/**
 * The announcement bar at the top of every page: a countdown to the grand opening.
 * `opens` is the moment the studio opens (Pakistan time is UTC+5). When the clock reaches zero the bar says the
 * studio is open, and it goes away after `until`, the last day it is shown. Set ANNOUNCEMENT to null to take it off
 * the site. The wording is in src/lib/announcement.ts.
 */
export const ANNOUNCEMENT: { opens: string; until: string } | null = { opens: '2026-11-13T11:00:00+05:00', until: '2026-11-30' };

/**
 * The opening poster: a pop-up on the home page, shown once per visit until the end of `until` (Pakistan time).
 * Set POSTER to null to remove it. If you remove it, also remove "The opening poster" paragraph from the privacy page.
 */
export const POSTER: { src: string; width: number; height: number; alt: string; until: string } | null = {
  src: '/img/grand-opening.webp',
  width: 1060,
  height: 1280,
  alt: 'Grand opening poster: Naila’s opens on Friday 13 November 2026, 11:00 am to 8:00 pm, Wednesday to Monday. Tuesday is the weekly off.',
  until: '2026-11-13',
};
