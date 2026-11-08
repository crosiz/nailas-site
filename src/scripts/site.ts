/* Site behaviour: menu, slideshow, tabs, before/after slider, booking form. Every page is its own HTML file and the
   service lists are rendered at build time, so nothing here builds page content. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const WA = 'https://wa.me/923335559049?text=';
const view = document.body.dataset.view || 'home';
const header = $('.header')!, fab = $('#waFab'), dockEl = $('#dock'), sheet = $('#sheet')!, mb = $('#menuBtn')!;

/* Category tabs (Services): the underline slides to the category in view */
const tabsIn = $('#catNav'), ink = $('.tabs-bar__ink'), catBtns = $$<HTMLButtonElement>('#catNav button');
const tabsBar = $('.tabs-bar'), menuHead = $('.ph--menu');
let curCat: string | null = null;
const moveInk = () => {
  const b = catBtns.find((x) => x.dataset.cat === curCat) || catBtns[0];
  if (!b || !ink || !b.offsetWidth) return;
  ink.style.width = b.offsetWidth + 'px';
  ink.style.transform = 'translateX(' + b.offsetLeft + 'px)';
};
const setCat = (id: string) => {
  if (id === curCat) return;
  curCat = id;
  catBtns.forEach((b) => b.setAttribute('aria-current', String(b.dataset.cat === id)));
  moveInk();
  const b = catBtns.find((x) => x.dataset.cat === id);
  if (b && tabsIn && tabsIn.scrollWidth > tabsIn.clientWidth + 2) tabsIn.scrollTo({ left: Math.max(0, b.offsetLeft - 20), behavior: reduce ? 'auto' : 'smooth' });
};
const goCat = (id: string) => document.getElementById('cat-' + id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
if (catBtns.length) {
  $$('#menuIndex a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goCat(a.dataset.cat!); }));
  catBtns.forEach((b) => b.addEventListener('click', () => { setCat(b.dataset.cat!); goCat(b.dataset.cat!); }));
  addEventListener('resize', moveInk);
  document.fonts?.ready.then(moveInk);
}

/* Scroll: header, WhatsApp button, category highlight */
let lastY = scrollY;
function onScroll() {
  const y = scrollY;
  header.classList.toggle('is-solid', y > 40);
  if (!reduce) {
    const menuOpen = sheet.classList.contains('is-open');
    if (y > lastY + 6 && y > 260 && !menuOpen) { header.classList.add('is-hidden'); document.body.classList.add('hdr-hidden'); }
    else if (y < lastY - 6 || y <= 260) { header.classList.remove('is-hidden'); document.body.classList.remove('hdr-hidden'); }
    if (Math.abs(y - lastY) > 6) lastY = y;
  }
  /* The floating booking buttons wait until the page's own first button has scrolled out of view, and step aside once the closing banner (which has its own) is reached */
  const lead = $('.hero__cta .btn, .ph__cta .btn'), closing = $('#closing, .sec__cta');
  const past = lead ? lead.getBoundingClientRect().bottom < 0 : y > 200;
  const atEnd = !!closing && closing.getBoundingClientRect().top < innerHeight;
  const up = view !== 'book' && past && !atEnd;
  fab?.classList.toggle('is-up', up); dockEl?.classList.toggle('is-up', up);
  if (catBtns.length) {
    let cur = catBtns[0].dataset.cat!;
    catBtns.forEach((b) => { const el = document.getElementById('cat-' + b.dataset.cat); if (el && el.getBoundingClientRect().top < innerHeight * 0.35) cur = b.dataset.cat!; });
    setCat(cur);
    /* The bar shows once it has docked under the header, i.e. once the index in the page header has scrolled away */
    if (tabsBar && menuHead) tabsBar.classList.toggle('is-on', menuHead.getBoundingClientRect().bottom < tabsBar.getBoundingClientRect().top - 0.5);
  }
}
addEventListener('scroll', onScroll, { passive: true });
header.addEventListener('focusin', () => { header.classList.remove('is-hidden'); document.body.classList.remove('hdr-hidden'); });

/* Quiet reveals: only what starts below the fold waits for its moment. Each thing moves once. */
const hasIO = 'IntersectionObserver' in window;
if (hasIO) {
  const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('pre'); rio.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  const reveals = $$('.rv, .rvk, .uv'), revealTops = reveals.map((el) => el.getBoundingClientRect().top); // read all positions first, then write: one layout, not one per element
  reveals.forEach((el, k) => { if (revealTops[k] > innerHeight * 0.94) { el.classList.add('pre'); rio.observe(el); } });
}

/* Price rows rise in one after another; the before/after line shows it can move */
if (hasIO && !reduce) {
  const pio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('is-low'); pio.unobserve(e.target); } }), { threshold: 0.15 });
  const lists = $$('.prices'), listTops = lists.map((ul) => ul.getBoundingClientRect().top);
  lists.forEach((ul, k) => { ul.classList.add('stagger'); if (listTops[k] > innerHeight * 0.9) { ul.classList.add('is-low'); pio.observe(ul); } });
  const baEl = $('#ba'), baIn = $<HTMLInputElement>('#baRange');
  if (baEl && baIn) {
    let touched = false;
    const stop = () => { touched = true; baEl.classList.remove('is-hinting'); };
    baIn.addEventListener('pointerdown', stop); baIn.addEventListener('keydown', stop);
    const hio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || touched) return;
      hio.unobserve(baEl); baEl.classList.add('is-hinting');
      const seq = [34, 66, 50]; let k = 0;
      const step = () => { if (touched) return; baEl.style.setProperty('--x', seq[k] + '%'); baIn.value = String(seq[k]); if (++k < seq.length) setTimeout(step, 950); else setTimeout(() => baEl.classList.remove('is-hinting'), 950); };
      setTimeout(step, 400);
    }), { threshold: 0.6 });
    hio.observe(baEl);
  }
}
{ const ba = $('#ba'), range = $<HTMLInputElement>('#baRange'); range?.addEventListener('input', () => ba!.style.setProperty('--x', range.value + '%')); }

/* Hero slideshow */
const hero = $('#hero');
if (hero) {
  const slides = $$('.hero__slide'), dots = $$('.hero__dot'), pauseBtn = $('#heroPause')!;
  /* The slideshow always plays. People who ask for reduced motion (Windows reports it whenever animation effects are off) get a plain cross-fade with no zoom (see the CSS), and the pause button stops it for everyone. */
  let i = 0, timer: number | undefined, paused = false, hold = false;
  /* Slides 2-4 are invisible until the slideshow advances, so they load after the page has finished (or when a dot is tapped), never alongside the first photo */
  const later = $$<HTMLImageElement>('img[data-src]', hero);
  const loadLater = () => later.forEach((im) => { if (im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } });
  if (document.readyState === 'complete') setTimeout(loadLater, 1500); else addEventListener('load', () => setTimeout(loadLater, 1500), { once: true });
  const show = (n: number) => {
    loadLater();
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
    dots.forEach((d, k) => { d.classList.remove('is-on'); if (k === i) { void d.offsetWidth; d.classList.add('is-on'); } d.setAttribute('aria-current', String(k === i)); });
  };
  /* Move on only once the next photograph has arrived, so a slow connection never fades to an empty frame */
  const arrived = (n: number) => { const im = slides[(n + slides.length) % slides.length].querySelector('img'); return !!im && im.complete && im.naturalWidth > 0; };
  const advance = (tries = 0) => { loadLater(); if (arrived(i + 1) || tries >= 20) show(i + 1); else window.setTimeout(() => advance(tries + 1), 300); };
  const play = () => { clearInterval(timer); if (!paused && !hold) timer = window.setInterval(() => advance(), 6500); };
  dots.forEach((d, k) => d.addEventListener('click', () => { hold = false; show(k); play(); }));
  const setPaused = (p: boolean) => {
    paused = p; hero.classList.toggle('is-paused', p);
    pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
    pauseBtn.innerHTML = p ? '<svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 10 10"><path d="M2 1v8M8 1v8" stroke="currentColor" stroke-width="1.6"/></svg>';
    play();
  };
  pauseBtn.addEventListener('click', () => { hold = false; setPaused(!paused); });
  const setHold = (h: boolean) => { hold = h; play(); };
  /* Hold only while someone is using the controls, not whenever the pointer rests on the photograph */
  const ctrl = $('.hero__ctrl')!;
  ctrl.addEventListener('pointerenter', () => setHold(true)); ctrl.addEventListener('pointerleave', () => setHold(false));
  /* Keyboard focus holds it; a mouse click that happens to leave focus on a button does not */
  ctrl.addEventListener('focusin', (e) => { if ((e.target as HTMLElement).matches(':focus-visible')) setHold(true); }); ctrl.addEventListener('focusout', () => setHold(false));
  /* Swipe the photograph sideways to change it (touch only; vertical scrolling is left to the page) */
  const media = $('.hero__media')!;
  let sx = 0, sy = 0, sid = -1;
  const goTo = (n: number, tries = 0) => { loadLater(); if (arrived(n) || tries >= 10) show(n); else window.setTimeout(() => goTo(n, tries + 1), 200); };
  media.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; sid = e.pointerId; });
  media.addEventListener('pointerup', (e) => {
    if (e.pointerId !== sid) return;
    sid = -1;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) { hold = false; goTo(i + (dx < 0 ? 1 : -1)); play(); }
  });
  media.addEventListener('pointercancel', () => { sid = -1; });
  setPaused(paused);
  document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : play()));
}

/* Recent work scrolls sideways on phones: give that strip keyboard access (and a name) only while it actually scrolls */
{
  const strip = $('.insta__grid');
  if (strip) {
    const sync = () => {
      const on = strip.scrollWidth > strip.clientWidth + 2;
      if (on) { strip.tabIndex = 0; strip.setAttribute('role', 'region'); strip.setAttribute('aria-label', 'Recent work, scroll sideways for more'); }
      else { strip.removeAttribute('tabindex'); strip.removeAttribute('role'); strip.removeAttribute('aria-label'); }
    };
    sync(); addEventListener('resize', sync);
  }
}

/* Contact map: on touch screens the map starts locked so a swipe over it scrolls the page; one tap unlocks it */
$('#mapTap')?.addEventListener('click', (e) => (e.currentTarget as HTMLElement).parentElement!.classList.add('is-live'));

/* Menu sheet */
const setSheet = (open: boolean) => { sheet.classList.toggle('is-open', open); mb.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; if (open) $('#sheetClose')?.focus(); };
/* The phone's Back button closes the menu instead of leaving the page */
const openSheet = () => { if (sheet.classList.contains('is-open')) return; setSheet(true); history.pushState({ sheet: 1 }, ''); };
const closeSheet = () => { if (history.state && history.state.sheet) history.back(); else setSheet(false); mb.focus(); };
mb.addEventListener('click', openSheet);
$('#sheetClose')?.addEventListener('click', closeSheet);
$$('a', sheet).forEach((a) => a.addEventListener('click', () => setSheet(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet(); });
addEventListener('popstate', () => { if (sheet.classList.contains('is-open') && !(history.state && history.state.sheet)) setSheet(false); });
addEventListener('pageshow', () => { if (sheet.classList.contains('is-open')) setSheet(false); });

/* Booking planner */
const form = $<HTMLFormElement>('#planForm');
if (form) {
  const date = $<HTMLInputElement>('#pDate')!, note = $<HTMLTextAreaElement>('#pNote')!, nameEl = $<HTMLInputElement>('#pName')!;
  const sends = $$<HTMLAnchorElement>('[data-send]'), msg = $('#pMsg')!, prev = $('#pPreview')!, count = $('#pCount')!, barMsg = $('#pBarMsg')!;
  const step = (k: string) => $('[data-step="' + k + '"]')!;
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  date.min = today.toISOString().slice(0, 10);
  const fmtDate = (v: string) => new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const state = () => {
    const svcs = $$<HTMLInputElement>('#svcOpts input:checked').map((x) => x.value);
    const past = !!date.value && date.value < date.min;
    return { svcs, past, ok: svcs.length > 0 && !past };
  };
  const build = () => {
    const { svcs, past, ok } = state();
    const tod = $<HTMLInputElement>('input[name="tod"]:checked')?.value;
    const nm = nameEl.value.trim();
    let t = 'Hi Naila’s, ' + (nm ? 'this is ' + nm + '. ' : '') + 'I’d like to book' + (svcs.length ? ': ' + svcs.join(', ') + '.' : ' an appointment.');
    if (date.value && !past) t += '\nPreferred date: ' + fmtDate(date.value) + (tod ? ', ' + tod : '') + '.';
    else if (tod) t += '\nPreferred time: ' + tod + '.';
    if (note.value.trim()) t += '\n' + note.value.trim();
    t += '\nRef: web-book'; // tells the studio the message came from the booking form (see src/lib/ref.ts)
    prev.textContent = t;
    sends.forEach((b) => { b.setAttribute('aria-disabled', ok ? 'false' : 'true'); b.href = ok ? WA + encodeURIComponent(t) : '#'; });
    msg.classList.toggle('is-error', past);
    msg.textContent = past ? 'That date has passed. Pick today or later.' : ok ? 'Opens WhatsApp with this message ready to send.' : 'Choose at least one service to continue.';
    count.textContent = ok ? 'Ready to send' : 'Choose a service to start';
    const names = $$<HTMLInputElement>('#svcOpts input:checked').map((x) => x.labels?.[0]?.querySelector('.svc-card__name')?.textContent || x.value);
    barMsg.textContent = past ? 'That date has passed' : names.length ? names.join(', ') : 'Choose a service to start';
    barMsg.classList.toggle('is-error', past);
    step('svc').classList.toggle('is-done', svcs.length > 0);
    step('when').classList.toggle('is-done', (!!date.value && !past) || !!tod);
    step('you').classList.toggle('is-done', !!nm || !!note.value.trim());
  };
  form.addEventListener('input', build); form.addEventListener('change', build); form.addEventListener('submit', (e) => e.preventDefault());
  /* On a phone a press-and-hold is not a tap: it can start a text selection and send no click. Holding a card for half a second counts as a tap. */
  $$<HTMLLabelElement>('#svcOpts label').forEach((card) => {
    let timer = 0, held = false, x0 = 0, y0 = 0;
    const stop = () => window.clearTimeout(timer);
    card.addEventListener('pointerdown', (e) => {
      held = false;
      if (e.pointerType === 'mouse') return;
      x0 = e.clientX; y0 = e.clientY;
      timer = window.setTimeout(() => { held = true; card.control?.click(); }, 500);
    });
    card.addEventListener('pointermove', (e) => { if (Math.hypot(e.clientX - x0, e.clientY - y0) > 10) stop(); });
    card.addEventListener('pointerup', stop); card.addEventListener('pointercancel', stop);
    card.addEventListener('click', (e) => { if (held) { held = false; e.preventDefault(); } }); // the click that may follow the long press must not toggle it back
    card.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  sends.forEach((btn) => btn.addEventListener('click', (e) => {
    const { past, ok } = state();
    if (!ok) { e.preventDefault(); msg.classList.add('is-error'); msg.textContent = past ? 'That date has passed. Pick today or later.' : 'Choose at least one service first, then send.'; (past ? date : $<HTMLInputElement>('#svcOpts input')!).focus(); }
  }));
  /* On phones the send bar stays at the bottom until the message card comes on screen, and does not return once the card has been passed */
  const bar = $('#bbar'), card = $('.bsum__card');
  if (bar && card) {
    const sync = () => bar.classList.toggle('is-off', card.getBoundingClientRect().top < innerHeight * 0.55);
    addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  }
  const preset = new URLSearchParams(location.search).get('for');
  if (preset) { const el = $<HTMLInputElement>('#s-' + CSS.escape(preset)); if (el) el.checked = true; }
  build();
}

/* Deep links to a category (/services/#cat-bridal) */
if (location.hash.startsWith('#cat-')) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
onScroll();
