import { MENU, type Item } from '../data/menu';
import { SERVICES_LABEL } from '../data/site';

/**
 * JSON-LD for every indexable page, built in one place so the business details cannot drift between pages.
 *
 * Only facts that are also visible on the site are included. These are left out until the studio confirms them AND
 * they are shown on a page (Google requires markup to match visible content): coordinates, postal code, price range, reviews or ratings, FAQPage markup and ReserveAction.
 * When one is confirmed, show it on the page first, then add it here.
 */
const NAME = 'Naila’s Beauty Studio';
const SAME_AS = ['https://www.instagram.com/nailasbeautysalon/']; // add the Facebook Page / Business Profile URL here once they exist and match the NAP
const CRUMB: Record<string, string> = { services: SERVICES_LABEL, bridal: 'Bridal', academy: 'Academy', contact: 'Contact', book: 'Book', privacy: 'Privacy' };

interface Args { origin: string; url: string; view: string; title: string; description: string }

export function schemaGraph({ origin, url, view, title, description }: Args) {
  const id = (frag: string) => `${origin}/#${frag}`;
  const home = view === 'home';

  const salon: Record<string, unknown> = {
    '@type': 'BeautySalon',
    '@id': id('salon'),
    name: NAME,
    alternateName: ['Nailas Beauty Studio'],
    description: 'Beauty salon, bridal makeup studio and training academy in A&K Plaza, Sangam Market, Sector I-8/3, Islamabad.',
    url: `${origin}/`,
    image: [`${origin}/img/schema-1x1.jpg`, `${origin}/img/schema-4x3.jpg`, `${origin}/img/schema-16x9.jpg`],
    logo: { '@type': 'ImageObject', url: `${origin}/img/logo-512.png`, width: 512, height: 512 },
    telephone: '+92 333 5559049',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Office No. 1-A, First Floor, Unit No. 2-P, A&K Plaza, Sangam Market, Sector I-8/3',
      addressLocality: 'Islamabad',
      addressCountry: 'PK',
    },
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'], opens: '11:00', closes: '20:00' }, // Tuesday is the weekly off; keep in step with the Contact page and footer
    sameAs: SAME_AS,
  };

  // The services page lists every service with its price, so say so in structured form too: the same names, lines
  // and prices as the visible list. Items shown as "Consultation" or similar carry no price.
  if (view === 'services') {
    const offer = (it: Item) => {
      if (it.label === 'Free') return { '@type': 'Offer', price: 0, priceCurrency: 'PKR' };
      if (it.p == null) return undefined;
      if (it.max || it.from) return { '@type': 'Offer', priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'PKR', minPrice: it.p, ...(it.max ? { maxPrice: it.max } : {}) } };
      return { '@type': 'Offer', price: it.p, priceCurrency: 'PKR' };
    };
    salon.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${NAME} services`,
      itemListElement: MENU.map((c) => ({
        '@type': 'OfferCatalog',
        name: c.name,
        itemListElement: c.items.map((it) => ({
          '@type': 'Service',
          name: it.n,
          ...(it.d ? { description: it.d } : {}),
          provider: { '@id': id('salon') },
          ...(offer(it) ? { offers: offer(it) } : {}),
        })),
      })),
    };
  }

  const graph: Record<string, unknown>[] = [salon];

  const website = { '@type': 'WebSite', '@id': id('website'), url: `${origin}/`, name: NAME, inLanguage: 'en-GB', publisher: { '@id': id('salon') } };
  if (home) graph.push(website);

  const page: Record<string, unknown> = {
    '@type': view === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en-GB',
    isPartOf: home ? { '@id': id('website') } : { '@type': 'WebSite', '@id': id('website'), url: `${origin}/`, name: NAME },
    about: { '@id': id('salon') },
  };

  if (!home && CRUMB[view]) {
    // Matches the visible "Home / Page" trail at the top of every inner page.
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: CRUMB[view], item: url },
      ],
    });
    page.breadcrumb = { '@id': `${url}#breadcrumb` };
  }
  graph.push(page);

  return { '@context': 'https://schema.org', '@graph': graph };
}
