/**
 * Services and prices, as sent by the studio in November 2026. One list feeds the Services page, the home page links
 * and the structured data.
 *
 * Prices are in rupees. `p` is the price, or the lowest price when `from` or `max` is set:
 *   { p: 3000 }                 Rs 3,000
 *   { p: 2000, max: 3500 }      Rs 2,000–3,500
 *   { p: 15000, from: true }    from Rs 15,000 (depends on length, thickness or the design)
 *   { label: 'Consultation' }   shown instead of a price
 */
export interface Item { n: string; d?: string; p?: number; max?: number; from?: boolean; label?: string }
export interface Cat { id: string; name: string; intro: string; items: Item[] }

const num = (x: number) => x.toLocaleString('en-PK');
/** A price that depends on hair length: the row shows the lowest price and the line under it lists all four. */
const byLength = (short: number, medium: number, long: number, extraLong: number, extraLongOnwards = false): Pick<Item, 'p' | 'from' | 'd'> => ({
  p: short,
  from: true,
  d: `By length: short ${num(short)}, medium ${num(medium)}, long ${num(long)}, extra long ${num(extraLong)}${extraLongOnwards ? ' onwards' : ''}.`,
});

export const MENU: Cat[] = [
  { id: 'bridal', name: 'Bridal', intro: 'Makeup for the bride, planned around your outfit and jewellery.', items: [
    { n: 'Bridal makeup, senior artist', p: 35000 },
    { n: 'Signature bridal makeup', p: 45000 } ] },
  { id: 'makeup', name: 'Makeup', intro: 'Party, engagement and formal looks. Some include a hairdo.', items: [
    { n: 'Basic party makeup', d: 'With hairdo.', p: 6000 },
    { n: 'Signature party makeup', d: 'With hairdo and lash.', p: 8000 },
    { n: 'HD makeup', p: 10000 },
    { n: 'Engagement makeup', p: 20000 },
    { n: 'Formal makeup', p: 12000 },
    { n: 'Eye makeup', p: 3000 },
    { n: 'Hair styling', p: 3000, max: 6000 },
    { n: 'Dupatta setting', p: 1500 },
    { n: 'Jewellery setting', p: 1500 } ] },
  { id: 'hair-cut', name: 'Hair cutting & styling', intro: 'Cuts, blow dries and styling. The consultation is free.', items: [
    { n: 'Hair consultation', label: 'Free' },
    { n: 'Basic haircut', p: 3000 },
    { n: 'Professional haircut', p: 5000 },
    { n: 'Layer cutting', p: 4000 },
    { n: 'Step cutting', p: 4000 },
    { n: 'Feather cutting', p: 4000 },
    { n: 'V-cut / U-cut', p: 2500 },
    { n: 'Bangs cutting', p: 1500 },
    { n: 'Hair trimming', p: 1500 },
    { n: 'Blow dry', ...byLength(1500, 2000, 2500, 3500) },
    { n: 'Ironing', p: 2000, max: 3500 },
    { n: 'Hair curls', p: 2500, max: 4000 },
    { n: 'Hair styling', p: 3000, max: 6000 },
    { n: 'Updo hairstyle', p: 4000, max: 5000 } ] },
  { id: 'hair-colour', name: 'Hair colour', intro: 'Colour is priced by hair length. The final price depends on thickness and the products used.', items: [
    { n: 'Root touch-up, grey coverage', d: 'One inch. Kune 4,000, LK 4,500, L’Oréal 6,500.', p: 4000, from: true },
    { n: 'Global hair colour', ...byLength(8500, 12000, 16000, 20000) },
    { n: 'Highlights', p: 15000, from: true },
    { n: 'Lowlights', p: 15000, from: true },
    { n: 'Balayage', p: 18000, from: true },
    { n: 'Ombre', p: 18000, from: true },
    { n: 'Fashion colour', p: 15000, from: true } ] },
  { id: 'keratin', name: 'Keratin & smoothing', intro: 'Priced by hair length. The final price depends on hair thickness, length and the products needed.', items: [
    { n: 'Keratin treatment', ...byLength(15000, 18000, 25000, 32000) },
    { n: 'Hair botox', ...byLength(20000, 25000, 35000, 45000, true) },
    { n: 'Nanoplastia', ...byLength(22000, 30000, 40000, 50000) },
    { n: 'Anti-aging hair botox', ...byLength(25000, 32000, 38000, 48000) },
    { n: 'Hair smoothing', ...byLength(15000, 22000, 30000, 38000) },
    { n: 'Rebonding', ...byLength(15000, 22000, 30000, 38000) } ] },
  { id: 'hair-care', name: 'Hair treatments', intro: 'Spa, repair, scalp and conditioning treatments.', items: [
    { n: 'Hair spa', p: 4000 },
    { n: 'Deep conditioning', p: 3500 },
    { n: 'Hair repair treatment', p: 5000 },
    { n: 'Protein treatment', p: 5000 },
    { n: 'Hair fall treatment', p: 5000 },
    { n: 'Scalp treatment', p: 5000 },
    { n: 'Dandruff treatment', p: 4000 },
    { n: 'Hair mask treatment', p: 3500 },
    { n: 'Hair polishing', p: 6000 } ] },
  { id: 'facials', name: 'Facials & skin care', intro: 'Tell us your skin type and routine, and we’ll suggest a treatment.', items: [
    { n: 'Basic facial', p: 3500 },
    { n: 'Whitening facial', p: 4500 },
    { n: 'Herbal gold facial', p: 4500 },
    { n: 'Deep cleansing facial', p: 2500 },
    { n: 'Janssen professional facial', p: 7000 },
    { n: 'Anti-aging facial', p: 8000 },
    { n: 'Vitamin C facial', p: 7000 },
    { n: 'Collagen facial', p: 8000 },
    { n: 'Luxury signature facial with eye circle', p: 10000 },
    { n: 'Korean glow facial', p: 13500 },
    { n: 'Skin polishing', p: 4000 },
    { n: 'Face cleanup', p: 2500 } ] },
  { id: 'aesthetics', name: 'Advanced aesthetics', intro: 'These need a consultation first. Injectable procedures should be performed by a qualified medical professional.', items: [
    { n: 'HydraFacial', p: 8000 },
    { n: 'Premium HydraFacial', p: 10000 },
    { n: 'Advanced HydraFacial', p: 12500 },
    { n: 'Chemical peeling', p: 6000, max: 8000 },
    { n: 'Microneedling', p: 10000 },
    { n: 'Skin mesotherapy', label: 'Consultation' },
    { n: 'PRP treatment', label: 'Consultation' },
    { n: 'Face botox', label: 'Doctor consultation' },
    { n: 'Lip fillers', label: 'Doctor consultation' },
    { n: 'Skin consultation', label: 'By appointment' } ] },
  { id: 'brows-lashes', name: 'Brows, lashes & lips', intro: 'Brow shaping, lash extensions and lifts, and semi-permanent lip colour.', items: [
    { n: 'Eyebrow shaping', p: 500 },
    { n: 'Eyebrow threading', p: 300 },
    { n: 'Eyebrow tinting', p: 1500 },
    { n: 'Eyebrow henna', p: 2000 },
    { n: 'Brow lamination with tint', p: 5000 },
    { n: 'Brow embroidery', p: 18000, max: 25000 },
    { n: 'Microblading', p: 18000, max: 25000 },
    { n: 'Brow correction', label: 'Consultation' },
    { n: 'Classic lash extensions', p: 7000 },
    { n: 'Hybrid lash extensions', p: 8000 },
    { n: 'Volume lash extensions', p: 10000 },
    { n: 'Mega volume lashes', p: 12000 },
    { n: 'Eyelash lifting', p: 5000 },
    { n: 'Lash lift & tint', p: 6000 },
    { n: 'Eyelash tinting', p: 2000 },
    { n: 'Lash removal', p: 2000 },
    { n: 'Lash refill', p: 4000, max: 6000 },
    { n: 'Lip blush', p: 18000, max: 25000 },
    { n: 'Lip neutralization', p: 20000, max: 25000 },
    { n: 'Lip colour correction', label: 'Consultation' },
    { n: 'Lip touch-up', p: 8000 } ] },
  { id: 'nails', name: 'Nails', intro: 'Manicures, pedicures, gel polish, extensions and nail art.', items: [
    { n: 'Basic manicure', p: 1500 },
    { n: 'Spa manicure', p: 2500 },
    { n: 'Basic pedicure', p: 2000 },
    { n: 'Spa pedicure', p: 3000 },
    { n: 'Gel nail polish, hands', p: 3000 },
    { n: 'Gel polish, feet', p: 2500 },
    { n: 'Gel nail extensions', p: 6000 },
    { n: 'Acrylic nail extensions', p: 8000 },
    { n: 'Poly Gel X nails', p: 6000 },
    { n: 'French tips', p: 3000 },
    { n: 'Nail art', p: 500, from: true },
    { n: 'Nail removal', p: 1500, max: 2500 },
    { n: 'Nail refill', p: 3500 },
    { n: 'Nail repair', d: 'Per nail.', p: 500 },
    { n: 'Press-on nails', p: 3000 },
    { n: 'Foot spa', p: 2500 },
    { n: 'Paraffin wax pedicure treatment', p: 3500 } ] },
  { id: 'waxing', name: 'Waxing & threading', intro: 'Waxing is done with Rica wax. Threading is for the brows and face.', items: [
    { n: 'Full arms wax', p: 1500 },
    { n: 'Half arms wax', p: 1000 },
    { n: 'Full legs wax', p: 2500 },
    { n: 'Half legs wax', p: 1200 },
    { n: 'Underarms wax', p: 700 },
    { n: 'Full body wax', p: 8000 },
    { n: 'Back wax', p: 2000 },
    { n: 'Stomach wax', p: 1500 },
    { n: 'Upper lip wax', p: 300 },
    { n: 'Chin wax', p: 400 },
    { n: 'Full face wax', p: 1500 },
    { n: 'Bikini wax', p: 2000 },
    { n: 'Upper lip threading', p: 150 },
    { n: 'Chin threading', p: 300 },
    { n: 'Full face threading', p: 1200 },
    { n: 'Forehead threading', p: 300 },
    { n: 'Side face threading', p: 500 },
    { n: 'Neck threading', p: 500 } ] },
];

/** The five rows on the home page. Each links to the first matching group on the Services page. */
export const HOME_LINKS = [
  { id: 'bridal', name: 'Bridal', intro: 'Makeup and hair for each event, pre-bridal care and your family’s appointments.' },
  { id: 'makeup', name: 'Makeup', intro: 'From soft and natural to full evening glam.' },
  { id: 'hair-cut', name: 'Hair & colour', intro: 'Priced by length and thickness, and confirmed before we start.' },
  { id: 'nails', name: 'Nails', intro: 'Manicures, pedicures, gel polish and nail art.' },
  { id: 'facials', name: 'Skin & self-care', intro: 'Tell us your skin type and routine, and we’ll suggest a treatment.' },
];

export const EVENTS = [
  { n: 'Nikkah', d: 'Fresh skin and soft eyes that look good up close.' },
  { n: 'Mehndi', d: 'Colour on the eyes and flowers in the hair.' },
  { n: 'Baraat', d: 'Traditional red, defined eyes and a lip colour that lasts all night.' },
  { n: 'Walima', d: 'Champagne tones and a softer glow.' },
];
