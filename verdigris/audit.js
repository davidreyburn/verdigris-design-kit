/* ═══════════════════════════════════════════════════════════════════════
   VERDIGRIS — audit

   Every conformance number this system publishes was produced by measuring
   the rendered page, not by reasoning about the tokens. This file is that
   measurement, packaged so anything building on the kit can prove its own
   output rather than inherit a claim.

       <script src="verdigris/audit.js"></script>
       verdigrisAudit()            // human-readable summary to the console
       verdigrisAudit({json:true}) // structured result, for an agent

   Zero dependencies, no build step, runs in the page. It measures what is
   ON SCREEN RIGHT NOW.

   ── THE ONE TRAP, AND IT WILL BITE YOU ──────────────────────────────────
   Do NOT switch theme and audit in the same tick:

       document.documentElement.setAttribute('data-theme','dark');
       verdigrisAudit();                      // WRONG — reports garbage

   Custom properties on :root recompute immediately, but descendants keep
   their previous resolved values until style recalculation completes. You
   will get a confident report full of failures that do not exist, mixing
   one theme's text against the other's background. This cost real time to
   diagnose during development.

   Audit one theme per page load:

       localStorage.setItem('verdigris-theme','dark'); location.reload();
       // then, in the new page:
       verdigrisAudit();

   AAA requires both themes, so that is two loads. There is no shortcut.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── colour ─────────────────────────────────────────────────────────── */
  function chan(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function parse(c) {
    const m = String(c).match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  }
  function lum(c) { const p = parse(c); return 0.2126 * chan(p[0]) + 0.7152 * chan(p[1]) + 0.0722 * chan(p[2]); }
  function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function hex(c) { const p = parse(c); return '#' + p.map(v => ('0' + Math.round(v).toString(16)).slice(-2)).join('').toUpperCase(); }

  /* Alpha is the reason this walks the ancestor chain instead of reading
     one background: a translucent surface over another surface composites,
     and the ratio that matters is against what the eye actually receives.
     A fully transparent background is not a background. */
  function backdrop(el) {
    let n = el;
    while (n && n.nodeType === 1 && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/^rgba\(0, 0, 0, 0\)$|transparent/.test(bg)) {
        const a = parse(bg).length === 3 ? (String(bg).match(/[\d.]+/g) || [])[3] : null;
        if (a == null || Number(a) >= 0.999) return bg;
      }
      n = n.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
  }

  /* WCAG large text: >=24px, or >=18.66px at >=700 weight. */
  function threshold(cs) {
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10) || 400;
    return (size >= 24 || (size >= 18.66 && weight >= 700)) ? 4.5 : 7;
  }

  function visible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* Only elements that own a text node. Without this every wrapper inherits
     its children's text and gets audited repeatedly under the wrong box. */
  function ownsText(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }

  /* ── checks ─────────────────────────────────────────────────────────── */

  function textContrast() {
    const fails = [];
    let checked = 0;
    document.querySelectorAll('body *').forEach(el => {
      if (!ownsText(el) || !visible(el)) return;
      if (el.closest('.vd-skeleton, vd-redact')) return;   // no readable text by design
      const cs = getComputedStyle(el);
      const bg = backdrop(el), need = threshold(cs);
      const r = ratio(cs.color, bg);
      checked++;
      if (r < need) fails.push({
        selector: describe(el),
        text: el.textContent.trim().slice(0, 40),
        fg: hex(cs.color), bg: hex(bg),
        ratio: +r.toFixed(2), required: need
      });
    });
    return { name: 'Text contrast (1.4.6 AAA)', checked, fails };
  }

  /* 1.4.11. A decorative hairline is exempt; the boundary of a CONTROL is
     not. This is exactly the distinction that --vd-control-border exists
     for, and getting it wrong is silent — the page looks fine. */
  function controlBorders() {
    const fails = [];
    const sel = '.vd-input, .vd-textarea, .vd-select, .vd-check input, .vd-btn';
    const els = document.querySelectorAll(sel);
    els.forEach(el => {
      if (!visible(el)) return;
      const cs = getComputedStyle(el);
      if (cs.borderTopStyle === 'none' || parseFloat(cs.borderTopWidth) === 0) return;
      const bg = backdrop(el.parentElement || el);
      const r = ratio(cs.borderTopColor, bg);
      if (r < 3) fails.push({
        selector: describe(el), border: hex(cs.borderTopColor), against: hex(bg),
        ratio: +r.toFixed(2), required: 3
      });
    });
    return { name: 'Control boundaries (1.4.11)', checked: els.length, fails };
  }

  function targetSize() {
    const small = [], tiny = [];
    const els = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    els.forEach(el => {
      if (!visible(el)) return;
      /* 2.5.8's "Inline" exception: a target inside a sentence or block of
         text is exempt. Test the CONDITION, not a list of containers — an
         earlier version enumerated `p, li, .vd-prose` and duly flagged the
         hero caption's inline link, which sits in a <div>. The spec does not
         care what the wrapper is; it cares whether the link is set in a run
         of text. So: inline display, and a parent holding text of its own. */
      if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
        const parent = el.parentElement;
        if (parent) {
          const around = parent.textContent.replace(el.textContent, '').trim();
          if (around.length > 0) return;
        }
      }

      /* THE TARGET IS THE LABEL, when there is one. A checkbox renders at
         18x18, but clicking anywhere in its <label> activates it, so the
         label is the target 2.5.5 is about. Measuring the input instead
         reports every checkbox in the kit as a failure — which it did, on
         the first run of this file. An audit that cries wolf gets ignored,
         which is worse than no audit. */
      let box = el;
      const wrap = el.closest('label');
      if (wrap && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) box = wrap;
      else if (el.id) {
        const forLabel = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
        /* Only when the label is adjacent enough to read as one target. */
        if (forLabel && forLabel.parentElement === el.parentElement) {
          const a = el.getBoundingClientRect(), b = forLabel.getBoundingClientRect();
          if (Math.abs(b.bottom - a.top) < 12 || Math.abs(a.bottom - b.top) < 12) box = el;
        }
      }
      const r = box.getBoundingClientRect();
      const min = Math.min(r.width, r.height);
      const rec = {
        selector: describe(el),
        size: Math.round(r.width) + 'x' + Math.round(r.height),
        measuredAs: box === el ? 'the control' : 'its label'
      };
      if (min < 24) tiny.push(rec);
      else if (min < 44) small.push(rec);
    });
    return {
      name: 'Target size (2.5.8 AA / 2.5.5 AAA)',
      checked: els.length,
      fails: tiny,                       // under 24 is an AA failure
      notes: small.map(s => Object.assign({ level: 'AA passes, AAA does not' }, s))
    };
  }

  /* 1.4.10. Measured on the live viewport — resize the window, or load the
     page in a 320px iframe, which has its own viewport so media queries
     fire. Constraining a DIV does not fire them and proves nothing. */
  function reflow() {
    const doc = document.documentElement;
    const over = doc.scrollWidth - window.innerWidth;
    const fails = [];
    if (over > 1) {
      const roots = [];
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || !visible(el)) return;
        if (el.closest('.vd-table-scroll, [style*="overflow"]')) return;   // legitimately scrolls
        if (el.getBoundingClientRect().right > window.innerWidth + 1) roots.push(el);
      });
      roots.filter(e => !roots.includes(e.parentElement)).slice(0, 8).forEach(el => {
        fails.push({ selector: describe(el), right: Math.round(el.getBoundingClientRect().right) });
      });
    }
    return {
      name: 'Reflow (1.4.10) at ' + window.innerWidth + 'px',
      checked: 1,
      fails: over > 1 ? [{ overflowPx: over, culprits: fails }] : []
    };
  }

  /* A table wide enough to overflow must sit in .vd-table-scroll, or the
     whole document scrolls sideways. This is the single most common way to
     break reflow with content rather than CSS. */
  function tableWrappers() {
    const fails = [];
    const tables = document.querySelectorAll('table.vd-table');
    tables.forEach(t => {
      if (!t.closest('.vd-table-scroll')) fails.push({
        selector: describe(t),
        firstCell: (t.rows[0] && t.rows[0].cells[0] ? t.rows[0].cells[0].textContent.trim().slice(0, 30) : ''),
        fix: 'wrap in <div class="vd-table-scroll">'
      });
    });
    return { name: 'Tables wrapped for reflow', checked: tables.length, fails };
  }

  /* Doctrine, not WCAG: --vd-data is numerals only. A grade, a status or an
     asterisk in the data colour is a violation the eye will not catch. */
  function dataColourDiscipline() {
    const fails = [];
    const data = getComputedStyle(document.documentElement).getPropertyValue('--vd-data').trim();
    if (!data) return { name: 'Data colour on numerals only', checked: 0, fails };
    const target = hex(resolveColour(data));
    let checked = 0;
    document.querySelectorAll('body *').forEach(el => {
      if (!ownsText(el) || !visible(el)) return;
      if (hex(getComputedStyle(el).color) !== target) return;
      checked++;
      const t = el.textContent.trim();
      if (t && !/^[\d.,:/%+−-]/.test(t)) fails.push({
        selector: describe(el), text: t.slice(0, 40),
        why: 'data colour on a value that does not start with a digit'
      });
    });
    return { name: 'Data colour on numerals only', checked, fails };
  }

  function resolveColour(v) {
    const probe = document.createElement('span');
    probe.style.color = v; probe.style.display = 'none';
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }

  function describe(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    if (typeof el.className === 'string' && el.className.trim())
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  }

  /* ── emitters ───────────────────────────────────────────────────────────
     Derived from the running stylesheet rather than maintained by hand.
     A checked-in tokens.json would be a second source of truth, which is
     the exact argument this system makes against a Figma kit. */

  function tokens() {
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (const sheet of styleSheets()) {
      eachRule(sheet, rule => {
        if (!rule.style || !rule.selectorText || !/:root/.test(rule.selectorText)) return;
        for (const prop of rule.style) {
          if (prop.indexOf('--vd-') !== 0) continue;
          const value = cs.getPropertyValue(prop).trim();
          if (!out[prop]) out[prop] = value;
        }
      });
    }
    /* contrast against the page ground, for anything colour-shaped */
    const ground = getComputedStyle(document.body).backgroundColor;
    Object.keys(out).forEach(k => {
      const v = out[k];
      if (/^#|^rgb|^hsl/.test(v)) {
        const r = ratio(resolveColour(v), ground);
        out[k] = { value: v, onGround: +r.toFixed(2) };
      } else out[k] = { value: v };
    });
    return out;
  }

  function classes() {
    const found = new Set();
    for (const sheet of styleSheets())
      eachRule(sheet, rule => {
        if (!rule.selectorText) return;
        (rule.selectorText.match(/\.vd-[a-zA-Z0-9_-]+/g) || []).forEach(c => found.add(c));
      });
    return Array.from(found).sort();
  }

  function styleSheets() {
    return Array.from(document.styleSheets).filter(s => {
      try { return !!s.cssRules; } catch (e) { return false; }   // cross-origin
    });
  }
  function eachRule(sheet, fn) {
    const walk = rules => {
      for (const r of rules) { if (r.cssRules) walk(r.cssRules); else fn(r); }
    };
    try { walk(sheet.cssRules); } catch (e) { /* unreadable, skip */ }
  }

  /* ── run ────────────────────────────────────────────────────────────── */
  function run(opts) {
    opts = opts || {};
    const theme = document.documentElement.getAttribute('data-theme')
      || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light (system)' : 'dark (system)');

    const checks = [textContrast(), controlBorders(), targetSize(), reflow(),
                    tableWrappers(), dataColourDiscipline()];
    const failed = checks.reduce((n, c) => n + c.fails.length, 0);
    const result = {
      theme,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      url: location.pathname,
      pass: failed === 0,
      totalFailures: failed,
      checks
    };
    if (opts.tokens) result.tokens = tokens();
    if (opts.classes) result.classes = classes();
    if (opts.json) return result;

    /* console output, deliberately plain so it survives copy-paste */
    const line = '─'.repeat(64);
    console.log('\n' + line + '\nVERDIGRIS AUDIT   theme: ' + theme +
                '   viewport: ' + result.viewport + '\n' + line);
    checks.forEach(c => {
      const status = c.fails.length ? 'FAIL ' + c.fails.length : 'pass';
      console.log(('  ' + c.name).padEnd(46) + String(c.checked).padStart(5) + ' checked   ' + status);
      c.fails.forEach(f => console.log('      ' + JSON.stringify(f)));
      if (c.notes && c.notes.length)
        console.log('      note: ' + c.notes.length + ' target(s) between 24 and 44px (AA yes, AAA no)');
    });
    console.log(line);
    console.log(failed === 0
      ? '  PASS — this theme, this viewport. Reload in the other theme and at\n' +
        '  320px before claiming conformance; see the header of this file.'
      : '  ' + failed + ' failure(s). Nothing above is a style opinion — each one is a\n' +
        '  measured threshold from WCAG or from a stated rule of this system.');
    console.log(line + '\n');
    return result;
  }

  window.verdigrisAudit = run;
  window.verdigrisAudit.tokens = () => tokens();
  window.verdigrisAudit.classes = () => classes();
})();
