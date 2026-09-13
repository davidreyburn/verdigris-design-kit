/* ═══════════════════════════════════════════════════════════════════════
   VERDIGRIS — components

   Light DOM by design. No shadow roots anywhere.

   The reason is the shared-legibility thesis: the same structural clarity
   that makes a page legible to a screen reader makes it legible to a
   browsing agent. Shadow DOM hides structure from both. Every component
   here upgrades markup that is already complete and semantic without JS,
   so the page degrades to correct HTML rather than to nothing.

   Framework-agnostic. Adapters for React and Astro are thin wrappers over
   these same custom elements.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wantsLight = window.matchMedia('(prefers-color-scheme: light)');

  /* ── theme ────────────────────────────────────────────────────────────
     prefers-color-scheme decides by default; an explicit choice overrides
     it in both directions and persists. The CSS does the actual switching
     on specificity alone, so everything here is optional: with JS off the
     OS preference still works and only the toggle disappears.

     THEME is the single source of truth for anything that cannot be done in
     CSS — currently just the topolang palette, which is a canvas and so has
     no access to custom properties.                                      */
  const STORE = 'verdigris-theme';
  const THEME = {
    /* null means "follow the OS", which is a real third state and not the
       same as picking the value the OS currently happens to report. */
    stored: function () {
      try { const v = localStorage.getItem(STORE);
            return (v === 'light' || v === 'dark') ? v : null; }
      catch (e) { return null; }
    },
    resolved: function () {
      return this.stored() || (wantsLight.matches ? 'light' : 'dark');
    },
    apply: function (t) {
      if (t) document.documentElement.setAttribute('data-theme', t);
      else document.documentElement.removeAttribute('data-theme');
      try { t ? localStorage.setItem(STORE, t) : localStorage.removeItem(STORE); }
      catch (e) {}
      window.dispatchEvent(new CustomEvent('vd-theme', {
        detail: { theme: this.resolved() }
      }));
    },
    toggle: function () {
      this.apply(this.resolved() === 'dark' ? 'light' : 'dark');
    }
  };
  window.verdigrisTheme = THEME;

  /* Reflect a stored choice as early as possible. The inline script in the
     document head does this before first paint to avoid a flash; this is the
     belt-and-braces path for pages that omit it. */
  (function () {
    const s = THEME.stored();
    if (s) document.documentElement.setAttribute('data-theme', s);
  })();

  /* If the reader has not chosen, follow the OS live. */
  wantsLight.addEventListener('change', function () {
    if (!THEME.stored()) THEME.apply(null);
  });

  /* ── makeRegionClickable ──────────────────────────────────────────────
     Turns a whole card into the target for its title link.

     NOT a stretched overlay link. The usual trick is an absolutely positioned
     ::after covering the card, and this system explicitly rejected it once
     because an overlay sits above the prose and makes the card impossible to
     select text in. That objection was right, so the overlay is still out.

     Instead the region forwards a click to the real anchor, and declines to
     when the gesture was not a click:

       · a press that MOVED more than 6px was a drag, so it was a selection
       · a non-empty selection means the reader is highlighting, not clicking
       · a target inside another interactive element handles itself

     The anchor stays the only focusable thing in the card. No tabindex, no
     role="link" on the region — that would add a second tab stop announcing
     the same destination twice. :focus-within carries the visual state, so
     keyboard and pointer get the identical affordance.

     Modifier keys survive because the event is RE-DISPATCHED rather than
     link.click(): ctrl/cmd-click still opens a tab and shift-click a window.
     Known gap, stated rather than papered over — middle-click on the card
     body does not open a tab, because that is browser UI behaviour attached
     to a real anchor hit and cannot be synthesised. Middle-clicking the title
     itself still works.                                                    */
  function makeRegionClickable(region, link) {
    if (!link || !link.getAttribute('href')) return;
    region.dataset.clickable = '';
    let x0 = 0, y0 = 0;
    region.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    region.addEventListener('click', function (e) {
      if (e.target.closest('a,button,input,select,textarea,summary,label,[tabindex]')) return;
      if (Math.abs(e.clientX - x0) > 6 || Math.abs(e.clientY - y0) > 6) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim()) return;
      link.dispatchEvent(new MouseEvent('click', {
        bubbles: true, cancelable: true, view: window,
        ctrlKey: e.ctrlKey, metaKey: e.metaKey,
        shiftKey: e.shiftKey, altKey: e.altKey
      }));
    });
  }

  /* Base: upgrade once, never re-render on reconnect. */
  class VdElement extends HTMLElement {
    connectedCallback() {
      if (this._up) return;
      this._up = true;
      this.upgrade();
    }
    upgrade() {}
  }

  /* ── vd-hero ─────────────────────────────────────────────────────────
     Attributes
       thesis    the headline string (or supply your own <h1> in markup)
       sub       supporting line
       field     "on" | "off"  — mount the topolang canvas
       seed      integer, for a reproducible frozen frame
  */
  class VdHero extends VdElement {
    upgrade() {
      const thesis = this.getAttribute('thesis');
      const sub = this.getAttribute('sub');
      const wantField = this.getAttribute('field') !== 'off';

      // Authored caption, if present, is relocated into the text column.
      // It must never sit over the field: the field's surface changes every
      // frame, so no contrast ratio against it can be guaranteed.
      //
      // Two forms. The child element is primary and is what index.html uses,
      // because a credit line usually wants markup — a <cite> for the title,
      // a link to the runtime. The `caption` attribute is the plain-text
      // convenience, and it is read here because it previously was not: a
      // page copied from template.html carried caption="..." and rendered no
      // caption at all, silently, which is the worst way for an API to say no.
      let caption = this.querySelector('.vd-hero__caption');
      if (caption) {
        caption.remove();
      } else if (this.getAttribute('caption')) {
        caption = document.createElement('div');
        caption.className = 'vd-hero__caption';
        caption.textContent = this.getAttribute('caption');
      }

      if (thesis && !this.querySelector('h1')) {
        const inner = document.createElement('div');
        inner.className = 'vd-hero__inner';
        // No eyebrow above the thesis. The display line is the strongest
        // thing on the page and a label over it only labels the obvious;
        // the caption below already carries the technical register.
        inner.innerHTML =
          '<h1 class="vd-hero__thesis"></h1>' +
          (sub ? '<p class="vd-hero__sub"></p>' : '');
        inner.querySelector('h1').textContent = thesis;
        if (sub) {
          inner.querySelector('.vd-hero__sub').textContent = sub;
          /* Flags the mobile field down to the body-safe attenuation. A sub
             is body text at 7:1 sitting directly under the display line, and
             no mask clears one without clearing the other. */
          this.dataset.heroSub = '';
        }
        if (caption) inner.appendChild(caption);
        this.appendChild(inner);
      } else if (caption) {
        this.appendChild(caption);
      }

      /* The scroll cue is opt-in, because a hero that does not fill the
         viewport does not need one and docs section 09 is a list of things
         not built speculatively. `cue` is the target, `cue-label` the word.
         CSS hides it above 860px, where the next section is already visible. */
      const cue = this.getAttribute('cue');
      if (cue && !this.querySelector('.vd-hero__cue')) {
        const link = document.createElement('a');
        link.className = 'vd-hero__cue';
        link.href = cue;
        link.textContent = this.getAttribute('cue-label') || 'Scroll';
        this.appendChild(link);
      }

      if (!wantField || !window.topolang) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'vd-hero__field';
      // The field is decoration. It carries no information a reader needs,
      // so it is hidden from assistive tech and the caption below carries
      // the provenance instead. Documented in the accessibility notes.
      canvas.setAttribute('aria-hidden', 'true');

      /* This wrapper exists for exactly one reason: to carry the bottom fade
         as its OWN mask, so the two masks NEST instead of compositing.

         The fade started life as a gradient of --vd-surface painted over the
         canvas, which avoided mask-composite but occluded the page grain in
         that band. body::before sits at z-index 0 below every body child, so
         anything painted opaque above the canvas also hides it — and in dark
         mode the grain LIGHTENS the ground, so losing it read as the fade
         going darker than the page. Correct in light, wrong in dark.

         Nesting solves it with no paint at all: the wrapper masks vertically,
         the canvas masks horizontally, and browsers multiply nested masks
         natively. No mask-composite, no `add` failure mode, and the grain is
         never covered. */
      const wrap = document.createElement('div');
      wrap.className = 'vd-hero__fieldwrap';
      wrap.appendChild(canvas);
      this.insertBefore(wrap, this.firstChild);

      const seed = parseInt(this.getAttribute('seed') || '20260801', 10);
      const T = window.topolang;

      /* ONE character mode at every width.
         This replaces the earlier breakpoint switch (STRATA above 860,
         SHADE below). SHADE reads as dithered relief rather than contour
         line-work, which is quieter and far more legible where the display
         line crosses the field — and the line is now meant to cross it.

         Two consequences worth stating, because both are load-bearing:

         1. SHADE is defined with cfn: null, so the contour pass never runs.
            There is therefore NO contour colour anywhere on the site. The
            contourColor on both palettes is now dead configuration, kept
            only so the palettes stay conformant with the spec's shape.

         2. VERDIGRIS_BAND is the brighter ramp, topping out at #5f8746,
            well above the luminance cap that used to make the field safe
            under text unconditionally. That guarantee is now carried by
            the mask in verdigris.css instead: it holds the field to an
            effective 0.30 alpha across the text column, where the measured
            worst case is 7.56:1 for body text. See the mask comment.

         autoRange stays on. The window must be measured per grid, not
         hard-coded: a window calibrated on a desktop grid collapses to
         nothing on a narrow one, since a small grid samples a small patch
         of noise space. */
      /* Theme-dependent. Both themes let the mask carry the AAA guarantee;
         only the opacity differs, and it differs for a physical reason.

         DARK runs VERDIGRIS_BAND at 0.62. Emissive marks on near-black have
         plenty of room, so the canvas is dialled back and the mask's held
         alpha lands at an effective 0.30 across the text column: 7.56:1.

         PAPER runs VERDIGRIS_PAPER at 1.0. Subtractive marks on bone have far
         less room, so the canvas gives everything it has and the mask alone
         does the limiting — the held alpha of 0.484 puts the worst band at
         7.29:1 over text. Dialling this back is what made the first attempt
         too faint to be worth rendering. */
      const paletteFor = (t) => t === 'light'
        ? { palette: T.palettes.VERDIGRIS_PAPER, opacity: 1 }
        : { palette: T.palettes.VERDIGRIS_BAND,  opacity: 0.62 };

      const field = new T.Field(canvas, Object.assign({
        seed: seed,
        frozen: reduced.matches,
        mode: T.modes.SHADE,
        autoRange: true
      }, paletteFor(THEME.resolved())));
      this._field = field;

      /* A canvas cannot read custom properties, so the palette is the one
         thing the theme switch has to reach into JS for. Re-draw rather than
         restart: the drift state is deliberately preserved so the terrain
         does not jump when a reader flips the theme. */
      this._onTheme = (e) => {
        Object.assign(field, paletteFor(e.detail.theme));
        field._nlo = field._nhi = undefined;   // re-calibrate the window
        field.computeElevation();
        field.draw();
      };
      window.addEventListener('vd-theme', this._onTheme);
      // Optional hook, and deliberately optional. Any element marked
      // data-topo-mode is filled with the mode actually running, so a caption
      // can never claim STRATA while SHADE renders — the kind of small
      // published untruth this system is supposed to not do. The home page
      // caption no longer states the mode (it is a credit line, not a spec
      // sheet), so this is currently used by docs/#topolang only.
      const el = this.querySelector('[data-topo-mode]');
      if (el) el.textContent = field.mode.name;

      const boot = () => field.start();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
      else boot();

      let t;
      this._onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          if (field.resize()) { field.computeElevation(); field.draw(); }
        }, 150);
      };
      window.addEventListener('resize', this._onResize);
      /* A window resize is not the only way this canvas changes size. The
         mobile hero is min-height:100svh with content-dependent growth, so
         the box settles AFTER first layout — fonts land, the thesis rewraps,
         the hero gets taller — with no window event at all. Without this the
         field keeps whatever size it had at upgrade() and paints a band in
         the top of a full-bleed box. */
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(this._onResize);
        this._ro.observe(wrap);
      }

      // Respond live if the user flips the OS setting mid-session.
      this._onMotion = (e) => {
        field.frozen = e.matches;
        field.stop();
        field.start();
      };
      reduced.addEventListener('change', this._onMotion);
    }
    disconnectedCallback() {
      if (this._field) this._field.stop();
      if (this._onResize) window.removeEventListener('resize', this._onResize);
      if (this._onMotion) reduced.removeEventListener('change', this._onMotion);
      if (this._onTheme) window.removeEventListener('vd-theme', this._onTheme);
    }
  }

  /* ── vd-system-card ──────────────────────────────────────────────────
     Attributes: index, kicker, title, href, proof (a|b|c pipe list)
     Or supply full markup and it is left alone.
  */
  class VdSystemCard extends VdElement {
    upgrade() {
      if (this.querySelector('.vd-system-card__title')) return;
      const index = this.getAttribute('index') || '';
      const kicker = this.getAttribute('kicker') || '';
      const title = this.getAttribute('title') || '';
      /* No href, no anchor. A card with nothing to link to is a real case —
         sanitized work whose artifact cannot travel — and defaulting to '#'
         made it a link to nowhere, which the release gate then fails. The
         title falls back to a <span> and the region stays inert. */
      const href = this.getAttribute('href');
      const proof = (this.getAttribute('proof') || '').split('|').filter(Boolean);
      const body = this.innerHTML.trim();

      const h = document.createElement('div');
      h.className = 'vd-system-card__index';
      h.innerHTML = '<b></b><span></span>';
      h.querySelector('b').textContent = index;
      h.querySelector('span').textContent = kicker;

      const t = document.createElement('h3');
      t.className = 'vd-system-card__title';
      const a = document.createElement(href ? 'a' : 'span');
      if (href) a.href = href;
      a.textContent = title;
      t.appendChild(a);

      const b = document.createElement('div');
      b.className = 'vd-system-card__body';
      b.innerHTML = body;

      this.innerHTML = '';
      this.appendChild(h); this.appendChild(t); this.appendChild(b);

      if (proof.length) {
        const p = document.createElement('div');
        p.className = 'vd-system-card__proof';
        proof.forEach(function (item) {
          const parts = item.split(':');
          const s = document.createElement('span');
          if (parts.length > 1) {
            const val = parts[1].trim();
            s.innerHTML = '<b></b> ';
            const bEl = s.querySelector('b');
            bEl.textContent = val;
            // Enforce the lime rule in code rather than by discipline:
            // --vd-data is numerics only. "4" and "41/41" earn it,
            // "deployed" and "founded" do not.
            if (/^[\d]/.test(val)) bEl.className = 'vd-is-data';
            s.appendChild(document.createTextNode(parts[0].trim()));
          } else { s.textContent = item.trim(); }
          p.appendChild(s);
        });
        this.appendChild(p);
      }

      makeRegionClickable(this, a);
    }
  }

  /* ── vd-note-card ────────────────────────────────────────────────────
     Attributes: date, title, href, length, dek
  */
  class VdNoteCard extends VdElement {
    upgrade() {
      if (this.querySelector('.vd-note-card__title')) return;
      const date = this.getAttribute('date') || '';
      const title = this.getAttribute('title') || '';
      /* No href, no anchor. A card with nothing to link to is a real case —
         sanitized work whose artifact cannot travel — and defaulting to '#'
         made it a link to nowhere, which the release gate then fails. The
         title falls back to a <span> and the region stays inert. */
      const href = this.getAttribute('href');
      const len = this.getAttribute('length') || '';
      const dek = this.getAttribute('dek') || this.textContent.trim();

      const row = document.createElement('div');
      row.className = 'vd-note-card__row';

      const d = document.createElement('time');
      d.className = 'vd-note-card__date';
      d.setAttribute('datetime', date);
      d.textContent = date;

      const t = document.createElement('h3');
      t.className = 'vd-note-card__title';
      const a = document.createElement(href ? 'a' : 'span');
      if (href) a.href = href;
      a.textContent = title;
      t.appendChild(a);

      row.appendChild(d); row.appendChild(t);
      if (len) {
        const l = document.createElement('span');
        l.className = 'vd-note-card__len';
        l.textContent = len;
        row.appendChild(l);
      }

      this.innerHTML = '';
      this.appendChild(row);
      if (dek) {
        const p = document.createElement('p');
        p.className = 'vd-note-card__dek';
        p.textContent = dek;
        this.appendChild(p);
      }

      makeRegionClickable(this, a);
    }
  }

  /* ── vd-code · filename bar plus copy ────────────────────────────── */
  class VdCode extends VdElement {
    upgrade() {
      if (this.querySelector('.vd-code__bar')) return;
      const file = this.getAttribute('file') || '';
      const pre = this.querySelector('pre');
      const bar = document.createElement('div');
      bar.className = 'vd-code__bar';
      bar.innerHTML = '<span></span><button class="vd-code__copy" type="button">Copy</button>';
      bar.querySelector('span').textContent = file;
      this.insertBefore(bar, pre);

      const btn = bar.querySelector('.vd-code__copy');
      btn.addEventListener('click', function () {
        const text = pre ? pre.innerText : '';
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
        }, function () { btn.textContent = 'Blocked'; });
      });
    }
  }

  /* ── vd-redact · sanitization made visible ───────────────────────────
     Reveals on hover, focus, and touch. Keyboard reachable, and the real
     text is exposed to assistive tech rather than hidden from it, because
     the point is that something was withheld, not that it is unreadable.
  */
  class VdRedact extends VdElement {
    upgrade() {
      if (!this.hasAttribute('data-reason')) this.setAttribute('data-reason', 'withheld');
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'button');
      this.setAttribute('aria-expanded', 'false');
      const label = this.getAttribute('data-reason');
      this.setAttribute('aria-label', 'Redacted: ' + label + '. Activate to reveal.');
      this.setAttribute('title', 'Redacted: ' + label);
      // Styling is driven by the aria-expanded attribute in CSS, so the
      // visual state and the announced state can never disagree.
      const toggle = () => {
        const on = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', String(!on));
      };
      this.addEventListener('click', toggle);
      this.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    }
  }

  /* ── vd-toc · reading progress via IntersectionObserver ───────────── */
  class VdToc extends VdElement {
    upgrade() {
      const scope = this.getAttribute('for');
      const root = scope ? document.querySelector(scope) : document;
      if (!root) return;
      const heads = Array.prototype.slice.call(root.querySelectorAll('h2[id], h3[id]'));
      if (!heads.length) return;

      const ul = document.createElement('ul');
      ul.className = 'vd-toc';
      const links = new Map();
      heads.forEach(function (h) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a); ul.appendChild(li);
        links.set(h.id, a);
      });
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'On this page');
      nav.appendChild(ul);
      this.appendChild(nav);

      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          const a = links.get(en.target.id);
          if (a) a.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '0px 0px -70% 0px' });
      heads.forEach(function (h) { io.observe(h); });
      this._io = io;
    }
    disconnectedCallback() { if (this._io) this._io.disconnect(); }
  }

  /* ── vd-swatch · token display with live measured contrast ───────────
     Computes the ratio at runtime from the resolved custom property, so the
     published numbers can never drift from the actual token values.
  */
  class VdSwatch extends VdElement {
    upgrade() {
      const token = this.getAttribute('token');
      const against = this.getAttribute('against') || '--vd-ink-000';
      const note = this.getAttribute('note') || '';
      const cs = getComputedStyle(document.documentElement);
      const fg = cs.getPropertyValue(token).trim();
      const bg = cs.getPropertyValue(against).trim();
      const ratio = contrast(fg, bg);
      const need = parseFloat(this.getAttribute('min') || '7');
      const ok = ratio >= need;
      // Label what was actually tested. Printing "AAA" on a token that only
      // cleared the 3:1 non-text bar would be exactly the kind of inaccuracy
      // this table exists to prevent.
      const verdict = !ok ? 'FAIL'
        : need >= 7   ? 'AAA'
        : need >= 4.5 ? 'AA'
        : need >  0   ? 'non-text 3:1'
        : 'decorative, exempt';

      this.className = 'vd-swatch';
      this.innerHTML =
        '<span class="vd-swatch__chip"></span>' +
        '<span><span class="vd-swatch__name"></span>' +
        '<span class="vd-swatch__meta"></span></span>' +
        '<span class="vd-swatch__ratio"></span>';
      this.querySelector('.vd-swatch__chip').style.background = fg;
      this.querySelector('.vd-swatch__name').textContent = token;
      this.querySelector('.vd-swatch__meta').textContent =
        fg.toUpperCase() + (note ? '  ·  ' + note : '');
      const r = this.querySelector('.vd-swatch__ratio');
      r.textContent = ratio.toFixed(2) + ':1  ' + verdict;
      if (!ok) r.setAttribute('data-fail', '');
    }
  }

  /* ── contrast maths, exported for the audit page ───────────────────── */
  function srgbToLin(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(hex) {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map(function (x) { return x + x; }).join('') : h;
    const r = parseInt(full.slice(0, 2), 16),
          g = parseInt(full.slice(2, 4), 16),
          b = parseInt(full.slice(4, 6), 16);
    return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    const hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  window.verdigris = { luminance: luminance, contrast: contrast, version: '1.0.0' };

  /* ── vd-theme-toggle ─────────────────────────────────────────────────
     A readout that happens to be clickable. It reports the active theme in
     the rail's own register rather than using a sun/moon icon, because the
     rest of the system states machine conditions in words and numbers.

     Renders nothing without JS, which is correct: with JS off the OS
     preference still drives the theme and a control that cannot work should
     not be advertised. That is why this is an empty element in the markup
     rather than a <button> the script upgrades.

     Accessibility notes: aria-pressed is deliberately NOT used. This is not
     a two-state button on one thing, it is a control that changes which of
     two named values is active, so the accessible name carries the target
     ("Switch to light") and aria-live announces the result. */
  /* Stroked, not filled, and inline rather than a font or an emoji.

     A Unicode sun/moon would be one character, but many platforms render
     those code points as full-colour emoji, which would put two arbitrary
     colours into a palette this careful about three. Inline SVG inherits
     currentColor, so the glyph is whatever the toggle's text colour is in
     either theme, and it stays crisp at any zoom.

     Both are outlines at the same stroke weight so they read as one pair.
     A filled crescent beside a stroked sun is the common combination and it
     puts far more ink on one state than the other. */
  const THEME_ICON = {
    dark:
      '<svg class="vd-theme-toggle__glyph" viewBox="0 0 20 20" aria-hidden="true" ' +
      'focusable="false"><path d="M16.3 12.7A7.2 7.2 0 0 1 7.3 3.7 7.4 7.4 0 1 0 ' +
      '16.3 12.7Z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    light:
      '<svg class="vd-theme-toggle__glyph" viewBox="0 0 20 20" aria-hidden="true" ' +
      'focusable="false"><circle cx="10" cy="10" r="3.6" fill="none" ' +
      'stroke="currentColor" stroke-width="1.3"/><path d="M10 1.4v2.2M10 16.4v2.2' +
      'M1.4 10h2.2M16.4 10h2.2M3.9 3.9l1.6 1.6M14.5 14.5l1.6 1.6M16.1 3.9l-1.6 1.6' +
      'M5.5 14.5l-1.6 1.6" stroke="currentColor" stroke-width="1.3"/></svg>'
  };

  class VdThemeToggle extends VdElement {
    upgrade() {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vd-theme-toggle';

      const paint = () => {
        const t = THEME.resolved();
        // The glyph shows the CURRENT theme, matching the word it replaced and
        // the first clause of the label. Which of the two conventions an icon
        // follows is genuinely ambiguous, so the target is spelled out in both
        // the accessible name and the title tooltip rather than left to the
        // reader to infer from a picture.
        btn.innerHTML = THEME_ICON[t];
        const next = t === 'dark' ? 'light' : 'dark';
        btn.setAttribute('aria-label', 'Theme: ' + t + '. Switch to ' + next + '.');
        btn.setAttribute('title', 'Switch to ' + next + ' theme');
      };
      paint();
      btn.addEventListener('click', () => THEME.toggle());
      window.addEventListener('vd-theme', paint);
      this._paint = paint;

      // Announce the change without moving focus or interrupting.
      const live = document.createElement('span');
      live.className = 'vd-visually-hidden';
      live.setAttribute('aria-live', 'polite');
      window.addEventListener('vd-theme', () => {
        live.textContent = THEME.resolved() + ' theme';
      });

      this.appendChild(btn);
      this.appendChild(live);
    }
    disconnectedCallback() {
      if (this._paint) window.removeEventListener('vd-theme', this._paint);
    }
  }

  /* ── vd-form · validation ─────────────────────────────────────────────
     Progressive enhancement over the browser's own Constraint Validation
     API. With JS off the form still submits and the browser still enforces
     `required` and `type` — this replaces the native bubble, which cannot
     be styled, cannot be read at leisure, and vanishes on the next click.

     Timing, settled in Calibration 03 and unchanged: validate a field on
     BLUR, and only once it has been blurred does it re-validate on every
     input. Validating while someone is still typing their email tells them
     it is wrong before they have finished writing it.

     `novalidate` is set in JS rather than in the markup on purpose: it must
     only take effect if this code is running to replace it.               */

  const GLYPH = { invalid: '!', valid: '✓', warn: '‼' };

  function fieldOf(control) {
    return control.closest('.vd-field');
  }

  /* One message element per field, created on demand and reused.

     aria-live is deliberately NOT set here. The message is wired with
     aria-describedby, so a screen reader reads it when focus lands on the
     control; a live region as well would announce every message a second
     time on blur, out of context. The submit handler moves focus to the
     first invalid control, which is what makes the error reachable. */
  function msgFor(field, control) {
    let el = field.querySelector('.vd-field__msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'vd-field__msg';
      el.id = (control.id || 'vd-f' + Math.random().toString(36).slice(2, 8)) + '-msg';
      const glyph = document.createElement('span');
      glyph.className = 'vd-field__glyph';
      glyph.setAttribute('aria-hidden', 'true');   // the text says the same thing
      el.appendChild(glyph);
      el.appendChild(document.createElement('span'));
      const hint = field.querySelector('.vd-field__hint');
      field.insertBefore(el, hint || null);
    }
    return el;
  }

  /* Author-supplied wording wins. data-msg-* lets a field say "Enter your
     name so I know who I am replying to" instead of the browser's
     "Please fill out this field", which is generic and slightly cross. */
  function wording(control) {
    const v = control.validity;
    if (v.valueMissing)  return control.dataset.msgRequired || 'This field is required.';
    if (v.typeMismatch)  return control.dataset.msgType     || 'Check the format of this entry.';
    if (v.tooShort)      return control.dataset.msgShort    || 'This is too short.';
    if (v.patternMismatch) return control.dataset.msgPattern || 'This does not match the expected format.';
    return control.validationMessage;
  }

  function clear(field, control) {
    field.classList.remove('is-invalid', 'is-valid', 'is-warn');
    control.removeAttribute('aria-invalid');
    const el = field.querySelector('.vd-field__msg');
    if (el) el.remove();
    const d = (control.getAttribute('aria-describedby') || '')
      .split(/\s+/).filter(function (x) { return x && !/-msg$/.test(x); }).join(' ');
    if (d) control.setAttribute('aria-describedby', d);
    else control.removeAttribute('aria-describedby');
  }

  function mark(control, state, text) {
    const field = fieldOf(control);
    if (!field) return;
    if (state === 'rest') { clear(field, control); return; }

    field.classList.remove('is-invalid', 'is-valid', 'is-warn');
    field.classList.add('is-' + state);

    const el = field.querySelector('.vd-field__msg') || msgFor(field, control);
    el.firstChild.textContent = GLYPH[state] || '';
    el.lastChild.textContent = text;

    if (state === 'invalid') control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');

    /* Append rather than replace: a field may already point at a hint. */
    const ids = (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (ids.indexOf(el.id) === -1) ids.push(el.id);
    control.setAttribute('aria-describedby', ids.join(' '));
  }

  /* ── wireSubmit ────────────────────────────────────────────────────────
     Spam traps first, because they decide whether anything is sent.

     A HONEYPOT is a field a person never sees and a bot fills in. Off-screen,
     not display:none — a hidden input is trivially detected, and some
     assistive tech still reaches it. aria-hidden and tabindex -1 keep it away
     from anyone real; autocomplete off keeps a browser from helpfully filling
     it for them.

     A TIMING trap rejects anything submitted faster than a person could read
     the form. Both cost nothing and neither needs a service.

     Both fail SILENTLY: a tripped trap renders success and sends nothing.
     Telling a bot it failed is how it learns to pass.

     The honest limit, stated because the kit cannot fix it: a bot that
     ignores script posts straight to the endpoint and sees neither trap. The
     kit provides the client half and names the contract — the honeypot field
     rides in the payload under its own name, and the ENDPOINT must reject it
     when non-empty. Server-side enforcement is not something a stylesheet and
     a custom element can promise. */
  function wireSubmit(host, form, controls) {
    const born = Date.now();
    const minMs = (parseFloat(host.getAttribute('min-seconds')) || 2.5) * 1000;

    let trap = null;
    if (host.hasAttribute('honeypot')) {
      const name = host.getAttribute('honeypot') || 'company';
      trap = document.createElement('input');
      trap.type = 'text'; trap.name = name; trap.tabIndex = -1;
      trap.setAttribute('autocomplete', 'off');
      trap.setAttribute('aria-hidden', 'true');
      trap.className = 'vd-form__trap';
      form.appendChild(trap);
    }

    /* Authored if present, generated only if not: every other element in this
       kit upgrades markup that is already complete, and a result region the
       author wrote is one they can position and word. */
    let out = form.querySelector('.vd-form__result');
    if (!out) {
      out = document.createElement('div');
      out.className = 'vd-form__result';
      form.appendChild(out);
    }
    /* role=status, not alert, for both outcomes. Focus is what actually
       announces a result — the same reasoning as the missing error summary —
       and an assertive region that interrupts on a success message is rude. */
    out.setAttribute('role', 'status');
    out.setAttribute('tabindex', '-1');
    if (!out.dataset.state) out.dataset.state = 'idle';

    const btn = form.querySelector('[type="submit"], button:not([type])');

    function settle(state, text) {
      out.dataset.state = state;
      out.textContent = text;
      form.dataset.state = state;
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
      out.focus();
    }

    form.addEventListener('submit', function (e) {
      // The validation listener above has already run and may have stopped it.
      if (e.defaultPrevented) return;
      e.preventDefault();

      const tripped = (trap && trap.value) || (Date.now() - born) < minMs;
      if (tripped) return settle('ok', host.getAttribute('data-msg-ok') || 'Thank you. Your message is on its way.');

      if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
      out.dataset.state = 'pending';
      out.textContent = host.getAttribute('data-msg-pending') || 'Sending…';

      /* FormData over the whole form, never a hand-built object. A Turnstile
         widget — or any third-party field — contributes a hidden input, and
         collecting the form wholesale is what carries it along without this
         kit knowing the vendor exists. */
      fetch(endpointOf(form), {
        method: (form.getAttribute('method') || 'POST').toUpperCase(),
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        settle('ok', host.getAttribute('data-msg-ok') || 'Thank you. Your message is on its way.');
        form.reset();
      }).catch(function () {
        settle('error', host.getAttribute('data-msg-error') ||
          'That did not send. Please try again, or use one of the links below.');
      });
    });
  }

  function endpointOf(form) { return form.getAttribute('action'); }

  function validate(control) {
    if (control.disabled || control.type === 'submit' || control.type === 'button') return true;
    const ok = control.checkValidity();
    if (!ok) { mark(control, 'invalid', wording(control)); return false; }

    /* Success is announced only for fields that could meaningfully fail and
       that the person actually filled in. A blank optional field returning
       a tick is noise, and per Calibration 05 the success line costs a
       colour the system had to argue for — so it is not spent on nothing. */
    if (control.value && (control.required || control.type === 'email' || control.pattern))
      mark(control, 'valid', control.dataset.msgValid || 'Looks right.');
    else
      mark(control, 'rest');
    return true;
  }

  class VdForm extends HTMLElement {
    connectedCallback() {
      const form = this.querySelector('form');
      if (!form || this._wired) return;
      this._wired = true;

      form.setAttribute('novalidate', '');   // only once we can replace it

      const controls = Array.prototype.slice.call(
        form.querySelectorAll('.vd-input, .vd-textarea, .vd-select')
      );

      controls.forEach(function (c) {
        c.addEventListener('blur', function () {
          c.dataset.touched = '1';
          validate(c);
        });
        c.addEventListener('input', function () {
          if (c.dataset.touched) validate(c);
        });
      });

      /* No summary block, per Calibration 05: focus moves straight to the
         first invalid control. One source of truth per error, and the
         message is already wired to the control by aria-describedby, so
         moving focus is what announces it. */
      form.addEventListener('submit', function (e) {
        let first = null;
        controls.forEach(function (c) {
          c.dataset.touched = '1';
          if (!validate(c) && !first) first = c;
        });
        if (first) {
          e.preventDefault();
          first.focus();
          if (first.scrollIntoView) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });

      /* ── SUBMISSION ──────────────────────────────────────────────────
         Only when the form has an `action`. Without one the kit does
         nothing at all: a form with no endpoint is a specimen, and the
         consumer supplies whatever channel it falls back to.

         `action` IS the transport abstraction. A Cloudflare Worker, a
         hosted form service, anything that accepts a POST — the kit never
         knows which, and never carries a URL, a key or an address.

         NOT mailto:. It behaves differently in every browser, hands the
         reader a half-filled mail client, and publishes the address in the
         markup, which defeats the reason anyone wanted a form. If that is
         the channel, use a link and no form.

         With script off, none of this runs and the form posts natively.
         That path is the platform's, not a fallback this kit maintains. */
      const endpoint = form.getAttribute('action');
      if (endpoint && !/^mailto:/i.test(endpoint)) wireSubmit(this, form, controls);

      form.addEventListener('reset', function () {
        // Defer: the reset has not been applied to values yet.
        window.setTimeout(function () {
          controls.forEach(function (c) {
            delete c.dataset.touched;
            mark(c, 'rest');
          });
        }, 0);
      });
    }
  }

  /* --vd-nav-h is the height everything clears the nav by: the sticky rail
     offsets itself by it, and the mobile hero pulls itself up under it. The
     token declares 60px, which is true only while the nav fits one row. It
     wraps to two below 860 and measures 134, and at 320 it measures 178, so
     the value was wrong on exactly the screens that most need it right.
     Measured here and written back, so the token stops being a guess. */
  (function () {
    const nav = document.querySelector('vd-nav');
    if (!nav || !window.ResizeObserver) return;
    const root = document.documentElement;
    new ResizeObserver(function (entries) {
      const h = Math.round(entries[0].contentRect.height);
      if (h > 0) root.style.setProperty('--vd-nav-h', h + 'px');
      /* How far the retract moves: the identity row plus the row gap. Measured
         rather than assumed, because the mark's height is a 44px target
         minimum and the gap is a token — either can change without this. */
      const mark = nav.querySelector('.vd-nav__mark');
      const inner = nav.querySelector('.vd-nav__inner');
      if (mark && inner) {
        const gap = parseFloat(getComputedStyle(inner).rowGap) || 0;
        const peek = Math.round(mark.getBoundingClientRect().height + gap);
        if (peek > 0) root.style.setProperty('--vd-nav-peek', peek + 'px');
      }
    }).observe(nav);
  })();

  /* The mobile hero puts the nav over the field, so the nav has no ground of
     its own until the reader leaves the top. One boolean attribute, set from
     scroll position, and the CSS does the rest — a class toggled here rather
     than a style written here, so the appearance stays in the stylesheet.

     rAF-coalesced: scroll fires far faster than paint, and this runs on every
     page whether or not it has a hero. */
  (function () {
    const root = document.documentElement;
    let queued = false, last = 0;
    /* Direction, not just position. The mobile nav keeps its controls and
       retracts its identity row while the reader moves down the page, and
       brings it back the moment they move up — the row is wanted when you
       are looking for where you are, and in the way when you are reading.

       The threshold is deliberate. Without it, a 1px scroll jitter or the
       rubber-band at the top of iOS flickers the row on and off. 12px is
       under a single line of body text, so it never feels laggy. */
    function read() {
      queued = false;
      const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const past = y > 8;
      if (past !== root.hasAttribute('data-scrolled')) {
        if (past) root.setAttribute('data-scrolled', '');
        else root.removeAttribute('data-scrolled');
      }
      if (Math.abs(y - last) > 12) {
        /* Never retract while the nav holds focus: a keyboard reader tabbing
           through the links would lose the one they were on. */
        const navHasFocus = document.activeElement &&
          document.activeElement.closest && document.activeElement.closest('vd-nav');
        const dir = (y > last && past && !navHasFocus) ? 'down' : 'up';
        if (root.getAttribute('data-scroll-dir') !== dir)
          root.setAttribute('data-scroll-dir', dir);
        last = y;
      }
    }
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(read);
    }, { passive: true });
    /* Tabbing into the nav restores it, so focus can never land on a row
       that is translated off the top of the screen. */
    document.addEventListener('focusin', function (e) {
      if (e.target.closest && e.target.closest('vd-nav'))
        root.setAttribute('data-scroll-dir', 'up');
    });
    read();
  })();

  const defs = [
    ['vd-hero', VdHero], ['vd-system-card', VdSystemCard], ['vd-note-card', VdNoteCard],
    ['vd-code', VdCode], ['vd-redact', VdRedact], ['vd-toc', VdToc], ['vd-swatch', VdSwatch],
    ['vd-theme-toggle', VdThemeToggle], ['vd-form', VdForm]
  ];
  defs.forEach(function (d) {
    if (!customElements.get(d[0])) customElements.define(d[0], d[1]);
  });
})();
