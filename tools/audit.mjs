#!/usr/bin/env node
/* ── the multi-load audit, driven ───────────────────────────────────────
   Runs verdigrisAudit() over every page in ink, in paper, and at one width
   just inside each declared breakpoint — one theme per load, as a real
   navigation each time rather than a theme switch inside one page.
   See CONDITIONS below for why the narrow widths are the ones they are.

   Zero dependencies: Node's global WebSocket speaking CDP. No npm, which is
   the same rule the rest of the repository follows.

     1. serve the site           ./serve.command
     2. start headless Chrome    see HOW below
     3. node tools/audit.mjs

   HOW (one line, and the profile directory must not be your real one):
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9222 --no-first-run \
       --user-data-dir=/tmp/vd-audit about:blank &

   Env: BASE (default http://127.0.0.1:8787), CDP_PORT (9222),
        PAGES (comma-separated, defaults to every shipped page). */

const PORT  = process.env.CDP_PORT || 9222;
const BASE  = process.env.BASE || 'http://127.0.0.1:8787';
const PAGES = (process.env.PAGES ||
  'index.html,docs/index.html,resume.html,reader.html,template.html,404.html').split(',');

/* ink and paper run at a desktop width; the rest are narrow loads. 320 is
   the WCAG 1.4.10 figure. Emulation gives the page a real viewport, so media
   queries fire — constraining an element does not, and proves nothing about
   a layout that changes character at 860px.

   859 AND 639 ARE NOT ARBITRARY: they are one pixel inside each breakpoint
   this system declares. Sampling 1280 and 320 alone tests the two ends and
   neither middle, and a nav that overflowed by 149px across the whole
   641-860 band survived five sweeps because of it — two blocks disagreed
   about whether the bar wraps, and no load ever landed where they disagreed.

   A breakpoint is a seam. Add one to verdigris.css and add a sample just
   inside it here, or the next mismatch is invisible in the same way. */
const CONDITIONS = [
  ['ink', 'dark', 1280], ['paper', 'light', 1280],
  ['859', 'dark', 859], ['639', 'dark', 639], ['320', 'dark', 320],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find(t => t.type === 'page');
      if (p) return p.webSocketDebuggerUrl;
    } catch { /* Chrome not up yet */ }
    await sleep(250);
  }
  throw new Error(`no CDP page target on ${PORT} — is headless Chrome running?`);
}

const ws = new WebSocket(await pageTarget());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const loaded = [];
ws.onmessage = m => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
  } else if (msg.method === 'Page.loadEventFired') {
    loaded.shift()?.();
  }
};
const send = (method, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
};
const evaluate = async expression => {
  const r = await send('Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
  return r.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
/* Without this the audit will happily measure the page you had before your
   last edit and report it as passing. Found the hard way. */
await send('Network.setCacheDisabled', { cacheDisabled: true });

async function navigate(url) {
  const done = new Promise(r => loaded.push(r));
  await send('Page.navigate', { url });
  await done;
  // defer scripts have run by load; fonts change measured target sizes.
  await evaluate('document.fonts ? document.fonts.ready.then(() => 1) : 1');
  await sleep(200);
}

async function run(page, theme, width) {
  const url = `${BASE}/${page}`;
  await send('Emulation.setDeviceMetricsOverride',
    { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await navigate(url);
  /* Set the theme, then load again. One theme per page load: custom
     properties on :root recompute immediately, but descendants keep their
     previously resolved values until recalculation finishes, so auditing in
     the same tick measures one theme's text against the other's ground. */
  await evaluate(`localStorage.setItem('verdigris-theme','${theme}')`);
  await navigate(url);

  const env = JSON.parse(await evaluate(`JSON.stringify({
    innerWidth: window.innerWidth,
    narrow: matchMedia('(max-width:860px)').matches,
    text: getComputedStyle(document.documentElement).getPropertyValue('--vd-text').trim(),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    present: typeof verdigrisAudit
  })`));
  if (env.present !== 'function')
    return { error: 'verdigrisAudit is not loaded — is audit.js on this page?', env };
  const report = JSON.parse(await evaluate('JSON.stringify(verdigrisAudit({json:true}))'));
  const overlay = JSON.parse(await evaluate(`(${overlayProbe})()`));
  if (overlay && overlay.fails.length) report.totalFailures += overlay.fails.length;
  return { env, report, overlay };
}

/* ── the overlay check, and why it scrolls first ───────────────────────
   audit.js cannot see the lightbox: it is not in the DOM until a figure is
   expanded, so nothing in the in-page harness measures it. This runs out
   here, over CDP, where a click is available.

   IT SCROLLS BEFORE IT CLICKS, and that is the entire point of the check
   rather than an implementation detail. A <dialog> left to the UA sheet
   computes to position:absolute, which resolves against the document rather
   than the viewport — so it pins to the top of the PAGE. At scrollY 0 that is
   indistinguishable from correct, which is how it shipped in 2.7.0 and stayed
   broken until someone scrolled. Measured at the time: scrollY 13,982 put the
   dialog's top at -13,982 and left only the backdrop on screen.

   So: scroll to the LAST expandable figure, open it, and require that the
   dialog intersects the viewport and the image has real size. Serialised as a
   string because it runs in the page, not here. */
const overlayProbe = `async function () {
  const btns = [...document.querySelectorAll('.vd-figure__expand')];
  if (!btns.length) return JSON.stringify({ checked: 0, fails: [] });
  const b = btns[btns.length - 1];
  b.scrollIntoView({ block: 'center' });
  await new Promise(r => setTimeout(r, 250));
  const scrollY = Math.round(window.scrollY);
  b.click();
  await new Promise(r => setTimeout(r, 350));
  const fails = [];
  const dlg = document.querySelector('.vd-lightbox');
  if (!dlg || !dlg.open) {
    fails.push({ check: 'lightbox opens', scrollY });
  } else {
    const d = dlg.getBoundingClientRect();
    const img = dlg.querySelector('.vd-lightbox__img');
    const i = img ? img.getBoundingClientRect() : { width: 0, height: 0, top: 0, bottom: 0 };
    if (d.bottom <= 0 || d.top >= innerHeight)
      fails.push({ check: 'dialog is on screen', scrollY, dialogTop: Math.round(d.top),
                   note: 'position resolved against the document, not the viewport' });
    if (!(i.width > 0 && i.height > 0))
      fails.push({ check: 'expanded image has size', scrollY,
                   box: Math.round(i.width) + 'x' + Math.round(i.height) });
    if (i.bottom <= 0 || i.top >= innerHeight)
      fails.push({ check: 'expanded image is on screen', scrollY, imageTop: Math.round(i.top) });
    dlg.close();
  }
  return JSON.stringify({ checked: btns.length, scrollY, fails });
}`;

const results = {};
let failures = 0;
for (const page of PAGES) {
  results[page] = {};
  for (const [label, theme, width] of CONDITIONS) {
    try {
      const r = await run(page, theme, width);
      results[page][label] = r;
      const n = r.report ? r.report.totalFailures : 1;
      failures += n;
      const over = r.env.scrollWidth - r.env.clientWidth;
      const ov = r.overlay && r.overlay.fails.length
        ? ` OVERLAY ${r.overlay.fails.map(f => f.check).join(', ')} @scrollY=${r.overlay.scrollY}`
        : (r.overlay && r.overlay.checked ? ` overlay:ok(${r.overlay.checked})` : '');
      console.error(`  ${page.padEnd(20)} ${label.padEnd(6)} ` +
        `fails=${n} --vd-text=${r.env.text} ` +
        `${r.env.scrollWidth}/${r.env.clientWidth}${over > 0 ? ` OVERFLOW +${over}` : ''}${ov}`);
    } catch (err) {
      results[page][label] = { error: String(err) };
      failures++;
      console.error(`  ${page.padEnd(20)} ${label.padEnd(6)} ERROR ${err.message}`);
    }
  }
}

console.log(JSON.stringify(results, null, 1));
console.error(failures === 0
  ? `\nPASS — ${PAGES.length} pages x ${CONDITIONS.length} loads, no measured failures.`
  : `\nFAIL — ${failures} measured failure(s). Notes are not failures; see AGENTS.md.`);
process.exit(failures === 0 ? 0 : 1);
