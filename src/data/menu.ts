/** Menu & prices: one list feeds Home, Services and Bridal. Names and descriptions follow the studio's own menu;
 *  starting prices are SAMPLES until Naila sends hers. null shows "Ask". */
export interface Item { n: string; d: string; p: number | null; top?: boolean; isNew?: boolean }
export interface Cat { id: string; name: string; intro: string; items: Item[] }
export const MENU: Cat[] = [
  { id: 'bridal', name: 'Bridal', intro: 'Makeup and hair for each event, pre-bridal care and your family’s appointments.', items: [
    { n: 'Bridal makeup', d: 'Soft or traditional, planned around your outfit.', p: 28000, top: true },
    { n: 'Bridal hair', d: 'Styled alongside your dupatta, neckline and jewellery.', p: 7000 },
    { n: 'Pre-bridal care', d: 'Hair, facial and nail appointments before the wedding.', p: null },
    { n: 'Family & bridal party', d: 'Makeup and hair for family and your bridal party.', p: 7500 } ] },
  { id: 'makeup', name: 'Makeup', intro: 'From soft and natural to full evening glam.', items: [
    { n: 'Soft & natural', d: 'Light coverage, softly defined eyes and a natural lip colour.', p: 6000 },
    { n: 'Party & evening', d: 'More coverage, defined eyes and a finish for your evening.', p: 7500, top: true },
    { n: 'Engagement makeup', d: 'Planned around your engagement outfit and jewellery.', p: 15000 },
    { n: 'Mehndi & occasion', d: 'For Mehndi nights, family weddings and celebrations.', p: 10000 } ] },
  { id: 'hair', name: 'Hair & colour', intro: 'Priced by length and thickness, and confirmed before we start.', items: [
    { n: 'Cut & finish', d: 'A cut shaped around your hair texture and how you style it at home.', p: 2000, top: true },
    { n: 'Colour & balayage', d: 'Highlights, balayage or an all-over colour, discussed before booking.', p: 12000, top: true },
    { n: 'Blow-dry & styling', d: 'A smooth blow-dry, soft waves or a style for an occasion.', p: 1500 },
    { n: 'Treatments & hair care', d: 'Conditioning and smoothing options for your hair type.', p: 6000 } ] },
  { id: 'nails', name: 'Nails', intro: 'Manicures, pedicures, gel polish and nail art.', items: [
    { n: 'Manicure & pedicure', d: 'Nail shaping, cuticle care and polish for hands and feet.', p: 3000, top: true },
    { n: 'Gel polish', d: 'Choose from the available gel shades, from neutrals to brights.', p: 2500 },
    { n: 'Nail art & extensions', d: 'Bring a design you like and ask about shapes and lengths.', p: 4000 },
    { n: 'Press-on nails', d: 'Message us about available sets, sizes and custom designs.', p: null } ] },
  { id: 'skin', name: 'Skin & self-care', intro: 'Tell us your skin type and routine, and we’ll suggest a treatment.', items: [
    { n: 'HydraFacial', d: 'Deep cleansing and hydration for fresh, glowing skin.', p: 5500, isNew: true, top: true },
    { n: 'Korean lash lift', d: 'A natural lift and curl for your own lashes, with no extensions.', p: null, isNew: true },
    { n: 'Facial rituals', d: 'Tell us your skin type and routine to choose a facial.', p: 3500 },
    { n: 'Deep cleansing', d: 'Ask what’s included and whether it suits your skin.', p: 3000 },
    { n: 'Waxing', d: 'Ask about the available waxing services and preparation.', p: 2500 },
    { n: 'Threading & finishing', d: 'Brow shaping and facial threading.', p: 300 } ] },
];
export const EVENTS = [
  { n: 'Nikkah', d: 'Fresh skin and soft eyes that look good up close.', p: 22000 },
  { n: 'Mehndi', d: 'Colour on the eyes and flowers in the hair.', p: 22000 },
  { n: 'Baraat', d: 'Traditional red, defined eyes and a lip colour that lasts all night.', p: 35000 },
  { n: 'Walima', d: 'Champagne tones and a softer glow.', p: 35000 },
];
