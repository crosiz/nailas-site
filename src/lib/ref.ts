/**
 * Adds a short "Ref:" line to every prefilled WhatsApp message so the studio can see, in the chat itself, which
 * page and button the visitor came from. WhatsApp links cannot carry UTM parameters, and this works without any
 * analytics script, cookie or cost. To switch it off, set REF_CODES to false.
 *
 * The privacy page (src/partials/privacy.html) tells visitors about this line: if you switch REF_CODES off, update it.
 *
 * Example message the studio receives:  "Hi Naila’s, I’d like to book an appointment.\nRef: web-home-fab"
 */
export const REF_CODES = true;

const PREFILLED = /(https:\/\/wa\.me\/923335559049\?text=[^"'\s<>]*)/g;

export function withRef(html: string, ref: string): string {
  if (!REF_CODES) return html;
  return html.replace(PREFILLED, (url) => url + '%0ARef%3A%20' + ref);
}
