export const SERVICES_LABEL = 'Services';
export const PHONE = '+923335559049'; // the number people call; WA below is the same number, for WhatsApp
export const WA = 'https://wa.me/923335559049?text=';
export const wa = (m: string) => WA + encodeURIComponent('Hi Naila’s, ' + m);

/**
 * The announcement bar at the top of every page. `launch` is the soft-launch day. The wording follows the date in
 * Pakistan (before the day, on the day, after it) and the bar goes away after `until`. Set ANNOUNCEMENT to null to
 * take it off the site. The wording itself is in src/lib/announcement.ts.
 */
export const ANNOUNCEMENT: { launch: string; until: string } | null = { launch: '2026-11-11', until: '2026-12-11' };
