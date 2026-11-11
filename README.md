# Naila’s Beauty Studio website

The website for Naila’s Beauty Studio, A&K Plaza, Sangam Market, Sector I-8/3, Islamabad: bridal makeup, hair, nails, skin care and a training academy. It is a static site built with [Astro](https://astro.build). Bookings happen on WhatsApp, so there is no backend, no database and no cookies.

Pages: Home `/`, Services `/services/`, Bridal `/bridal/`, Academy `/academy/`, Contact `/contact/`, Book `/book/`, Privacy `/privacy/`, and a 404 page.

## Run it

Node 24 is required (`.nvmrc` and `engines` say so).

```bash
npm install
npm run dev              # local site at http://localhost:4321
npm run build            # builds into dist/ and then runs the build checks
npm run preview          # serves dist/ locally
npm run check            # runs the build checks again on an existing dist/
```

## Deploy on Vercel

1. Push the repository to GitHub (a private repository is fine).
2. On vercel.com choose **Add New → Project**, import the repository and leave the settings as they are. `vercel.json` already sets the build command (`npm run build`) and the output folder (`dist`), and `package.json` asks for Node 24. No environment variables are needed.
3. Open the first build log. It should end with `check-dist: live build OK`. If the check finds a problem the deploy fails on purpose and says what is wrong.
4. Under **Settings → Domains** add `nailasbeautystudio.com` and `www.nailasbeautystudio.com`, and make `www` redirect to the apex. At the domain registrar, add only the records Vercel shows you and leave any email (MX, TXT) records alone.
5. Open **Settings → Deployment Protection** and make sure the production address is public. If it is not, Google and WhatsApp will see a login page.
6. Test the real address from your computer: `npm run smoke -- https://nailasbeautystudio.com`.
7. Optional: once the domain works, stop the `*.vercel.app` address from competing with it by adding this to `vercel.json` (use the real project name) and redeploying:

   ```json
   "redirects": [{ "source": "/(.*)", "has": [{ "type": "host", "value": "PROJECT.vercel.app" }], "destination": "https://nailasbeautystudio.com/$1", "permanent": true }]
   ```

Vercel’s free Hobby plan is limited to non-commercial use, so a business website normally needs the paid Pro plan. Check Vercel’s current terms before launch.

The public address comes from `astro.config.mjs` (`https://nailasbeautystudio.com`). Set the `SITE_URL` environment variable only to test on another address. A production build refuses any other address unless `ALLOW_OTHER_ORIGIN=1` is set.

## Search Console and the sitemap

1. In [Google Search Console](https://search.google.com/search-console) add a **Domain** property for `nailasbeautystudio.com` and verify it with the DNS TXT record. Keep that record for good.
2. Open **Sitemaps** and submit `sitemap.xml`. The full address is `https://nailasbeautystudio.com/sitemap.xml`. It lists the seven public pages.
3. In **URL Inspection**, inspect the home page and choose **Request indexing**.
4. Add the site to Bing Webmaster Tools as well (it can import the Search Console property).
5. Create and verify a Google Business Profile with the same name, address and phone number as the website. For a local business this matters more than anything on the site.

**Two Search Console statuses to expect.** "Page with redirect" for `http://nailasbeautystudio.com/` is not a fault: it is the redirect to the https address doing its job, and Google lists redirecting addresses under "not indexed" on purpose. "Duplicate without user-selected canonical" for `http://www.nailasbeautystudio.com/` meant Google found the www copy and had no canonical to follow. Every page now declares its own https canonical, and `vercel.json` redirects the www address permanently to `https://nailasbeautystudio.com` (the build check fails if that rule is removed). After a deploy, open the report, click **Validate fix**, and use URL Inspection on the main address to request indexing. Google recrawls on its own schedule, so the old rows clear over a few weeks.

`robots.txt` allows every crawler and lists the sitemap. Each page’s date in the sitemap comes from `src/data/lastmod.json`, not from the build date. Change a page’s date only when its text, prices, structured data or links really change.

## Grand opening: the bar, the poster and the opening hours

**The bar.** A slim bar at the top of every page counts down to the grand opening (Friday 13 November 2026, 11:00 am Pakistan time). The countdown, the opening moment and the last day the bar is shown are set in `ANNOUNCEMENT` in `src/data/site.ts`; the wording is in `src/lib/announcement.ts`. When the clock reaches zero the bar says "Open today until 8 pm" (until closing on the opening day), then "Now open" with the hours, and after its last day (30 November 2026) it disappears by itself. Set `ANNOUNCEMENT` to `null` to take it off. Clicking the bar opens the Contact page.

**The poster.** On the home page a pop-up shows the opening flyer once per visit, until the end of the opening day (`POSTER` in `src/data/site.ts`). It can be closed with the cross, the Escape key or a tap outside the picture, and then it does not come back until the browser tab is closed. It is not shown to people who arrive from a search engine, because Google ranks pages lower when a pop-up covers them straight after a search click. The image is `public/img/grand-opening.webp`, made from `assets-src/grand-opening-poster.jpg` by `assets-src/build-images.mjs`. When the poster is taken down, also remove "The opening poster" paragraph from `src/partials/privacy.html`.

**The opening hours** (Wednesday to Monday, 11:00 am to 8:00 pm, closed on Tuesdays) appear on the Contact page, in the footer, in the bar and in the structured data (`src/lib/schema.ts`). If they change, change all four. The build check fails if the structured data shows times the Contact page does not.

## Prices

The Services page shows the studio's own price list (received in November 2026). Everything on it comes from `src/data/menu.ts`: each group, each service and its price. To change a price, edit it there and rebuild. The comment at the top of that file shows how to write a single price, a range ("Rs 2,000–3,500"), a "from" price and a label such as "Consultation". Prices that depend on hair length list the four lengths in the line under the name. Tapping a service opens WhatsApp with a message about it.

The notes at the bottom of the page (the salon policy and the massage line) are in `src/partials/services.html`. The build check fails if the page loses its price rows or a row has no price or label. Update the date for `/services/` in `src/data/lastmod.json` whenever prices change.

## Where things are

- `src/partials/*.html` is the content of each page. `src/pages/*.astro` are the page shells, and `src/layouts/Base.astro` is the shared head, header and footer.
- `src/data/menu.ts` holds the services, prices and bridal events. `src/data/site.ts` holds the WhatsApp number. `src/data/lastmod.json` holds the sitemap dates.
- `src/lib/schema.ts` builds the structured data (JSON-LD), including the priced service list. `src/lib/views.ts` turns the menu into the Services page rows. `src/lib/ref.ts` adds a short `Ref:` line to prefilled WhatsApp messages, so the chat shows which page the visitor came from.
- `src/pages/robots.txt.ts` and `src/pages/sitemap.xml.ts` produce `robots.txt` and `sitemap.xml`.
- `src/styles/global.css` is all the CSS. `src/scripts/site.ts` is all the behaviour (menu, slideshow, tabs, before/after slider, booking form).
- `public/` holds the photos, fonts and icons that are served as they are.
- `assets-src/` holds the full-size logo and photos, plus two scripts: `build-images.mjs` makes the resized logos, the share image and the structured-data photos, and `build-icons.mjs` makes `favicon.ico`, `icon-192.png` and `apple-touch-icon.png`. Run them by hand with `node assets-src/build-images.mjs` or `node assets-src/build-icons.mjs` only when the logo or a photo changes.
- `scripts/check-dist.mjs` runs after every build. `scripts/smoke-test.mjs` tests a live address.
- `vercel.json` sets the build, the trailing-slash rule and the security and cache headers.

## What the build check looks for

It fails the build if it finds a broken link or asset, an image without alt text, a page without exactly one `<h1>`, a missing, duplicate or over-long title or description, a missing or wrong canonical address, a sitemap address that is not a real page or has no valid date, structured data that does not parse, a second phone number, a footer without the address block, a `noindex` header, robots rules that block search crawlers, leftover "sample price" wording, or a Services page that has lost its price rows.

## SEO and AI search

- Every page has its own title, description, canonical address and Open Graph tags, and one `<h1>`.
- The structured data is one `BeautySalon` (name, address, phone, logo, three photo shapes, Instagram) plus `WebSite`, `WebPage` or `ContactPage`, `BreadcrumbList` on inner pages and, on `/services/`, the full service list with the same prices as the page. Opening hours, coordinates, postal code, price range and reviews are left out until the studio confirms them. Add each one to the page first, then to `src/lib/schema.ts`.
- For AI search there are no special files. What helps is what also helps Google: crawlers are allowed in `robots.txt`, the pages answer common questions in plain words, and the name, address and phone number are the same everywhere (page text, footer, structured data, and later the Business Profile).
- The share image is `public/img/og-share.jpg`. WhatsApp keeps preview images for a long time, so add `?v=2` to a link when you share it after changing the image.
- The privacy page says the site sets no cookies and loads nothing from other companies, apart from the Google map on the Contact page. It also says the browser remembers, for the visit only, that the opening poster was closed. If analytics or anything else is added, update `src/partials/privacy.html` first.

## Still needed from the studio

- Control of the domain and its DNS records.
- The exact spelling on the signboard (Studio or Salon, Sangam).
- The postal code and the map pin for the exact unit (the Contact page map is centred on Sangam Market; replace the `src` in `src/partials/contact.html` with the "Embed a map" address from the Business Profile).
- Durations for the services (the price list is in; durations are not).
- Permission to use the client photos, and higher-resolution copies.
- Confirmation of the wording about skin tones and the bridal events, and the next academy intake date.
