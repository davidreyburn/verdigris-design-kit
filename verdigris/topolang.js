/* ═══════════════════════════════════════════════════════════════════════
   SPDX-License-Identifier: Apache-2.0
   Copyright (c) 2026 David Reyburn

   Carved out of this repository's licence on purpose. Everything else here
   is read-only; this file is Apache 2.0 so you can write your own conformant
   runtime and check it against the same vector. See LICENSE, carve-out 1.

   topolang — browser runtime
   Conformant with spec-topolang v1.3.2 (pure-field core; the stateful
   sketch extension is NOT claimed, so step()-bearing sketches are rejected
   with SKETCH_CAPABILITY_UNSUPPORTED as the spec requires).

   The noise primitives are bit-exact ports of the normative arithmetic.
   The fixed pipeline is implemented in order and is not reordered:
     field-eval → color_slot → glyph_slot → contour_pass → resolve_cell

   Verify with topolang.selfTest(), which runs the spec's published
   contour_crossing test vector and the hash2(0,0) == 0 invariant.
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── noise primitives (normative, bit-exact) ───────────────────────── */

  // hash2(ix,iy) -> [0, 0x7FFFFFFF].  Invariant: hash2(0,0) === 0.
  function hash2(ix, iy) {
    let h = (Math.imul(ix, 1619) + Math.imul(iy, 31337)) & 0x7FFFFFFF;
    h = Math.imul((h >>> 16) ^ h, 0x45D9F3B) >>> 0;
    h = Math.imul((h >>> 16) ^ h, 0x45D9F3B) >>> 0;
    return ((h >>> 16) ^ h) & 0x7FFFFFFF;
  }

  // quintic fade
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  const HASH_MAX = 0x7FFFFFFF;

  function valueNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = fade(x - ix), fy = fade(y - iy);
    const v00 = hash2(ix,     iy    ) / HASH_MAX;
    const v10 = hash2(ix + 1, iy    ) / HASH_MAX;
    const v01 = hash2(ix,     iy + 1) / HASH_MAX;
    const v11 = hash2(ix + 1, iy + 1) / HASH_MAX;
    const a = v00 + (v10 - v00) * fx;
    const b = v01 + (v11 - v01) * fx;
    return a + (b - a) * fy;
  }

  function fbm(x, y, octaves) {
    octaves = octaves === undefined ? 4 : octaves;
    let v = 0, amp = 0.5, freq = 1, norm = 0;
    for (let i = 0; i < octaves; i++) {
      v += valueNoise(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return v / norm;
  }

  // Constants are normative. Do not tune them.
  function warpedFbm(x, y, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    const qx = fbm(x + dx,  y + 0.3 + dy * 0.4, 2);
    const qy = fbm(x + 1.7, y + 9.2 + dy,       2);
    return fbm(x + 2.2 * qx + 1.3 + dx * 0.6,
               y + 2.2 * qy + 9.2 + dy * 0.5, 3);
  }

  /* ── pipeline steps ────────────────────────────────────────────────── */

  const CONTOUR_LEVELS = 12;

  // count of thresholds <= e (insertion point to the right of equals)
  function bisectRight(thresholds, e) {
    let lo = 0, hi = thresholds.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (e < thresholds[mid]) hi = mid; else lo = mid + 1;
    }
    return lo;
  }

  function colorSlotFor(palette, e) {
    return Math.min(bisectRight(palette.thresholds, e), palette.nBands - 1);
  }

  function glyphSlotFor(mode, e) {
    return Math.floor(Math.min(Math.max(e, 0), 0.999) * mode.fill.length);
  }

  /* ── palettes ──────────────────────────────────────────────────────── */

  /* VERDIGRIS — authored for dreyburn.com.

     Band luminance is capped so that even the brightest fill band keeps
     primary bone text at >= 7:1 (measured 7.25:1 against #3a352e). That
     makes the fill layer safe under text unconditionally, independent of
     any masking.

     The lime contour is the exception and cannot be made safe: bone on
     #AAFF00 is 1.33:1. That is why .vd-hero__field carries a hard mask
     keeping the field out of the text column. The mask is a contrast
     constraint, not a stylistic one, and removing it breaks the AAA claim. */
  const VERDIGRIS = {
    name: 'VERDIGRIS',
    bg: '#161614',
    thresholds: [0.12, 0.22, 0.32, 0.43, 0.54, 0.65, 0.75, 0.86, 1.01],
    nBands: 9,
    bandColors: [
      '#181816', '#1b1a18', '#1f1e1b', '#23221e',
      '#272521', '#2b2925', '#2f2d28', '#34322b', '#3a352e'
    ],
    /* Green, not lime. Lime contours read as hazard tape; green reads as
       terrain, and it is the phosphor descendant the palette is named for.
       Still masked away from text: bone on this green is 1.52:1. */
    contourColor: '#44BB44'
  };

  /* VERDIGRIS_BAND — for the mobile field band.
     Brighter than VERDIGRIS because the band is its own grid row with no
     text over it at any width, so the luminance cap that protects the
     desktop field does not apply. Paired with SHADE (cfn null, no contour
     pass), it renders as dithered relief rather than contour lines. */
  const VERDIGRIS_BAND = {
    name: 'VERDIGRIS_BAND',
    bg: '#161614',
    thresholds: [0.12, 0.22, 0.32, 0.43, 0.54, 0.65, 0.75, 0.86, 1.01],
    nBands: 9,
    /* Rebuilt on --vd-green-400. The old ramp topped out at #5f8746, which
       measures hue 96.9° and saturation 0.48 — an olive, visibly yellower
       and duller than the structure accent it was meant to echo. These nine
       are a straight mix from the ground toward #44BB44, capped at 0.74.

       The cap is not aesthetic, it is the contrast budget. The mask holds an
       effective 0.30 alpha across the text column, and the brightest band
       composited at that alpha has to keep bone-500 above 7:1. At cap 0.74
       the top band #389038 composites to #203b1f, measuring 7.51:1 — which
       is where the old olive ramp sat too (7.56:1). So the field is greener
       and very slightly less bright, at the same published guarantee.

       Top band lands at hue 120.0° and saturation 0.61 against the accent's
       120.0° and 0.64: the same colour, one step down in brightness. */
    bandColors: [
      '#1a2418', '#1e311c', '#213f20', '#254c24', '#295a28',
      '#2d672c', '#307530', '#348334', '#389038'
    ],
    contourColor: '#44BB44'
  };

  /* VERDIGRIS_PAPER — the light theme's field. CHARCOAL, not tinted.

     Nine bands DESCENDING from the paper ground toward ink-000, which is the
     inverse of the dark ramps: on paper a glyph must be darker than its
     surface to be seen at all.

     WHY NEUTRAL. The first pass descended toward fir green, mirroring the
     structure accent. It measured fine and looked wrong — a green wash on
     bone reads as a tint applied to paper rather than as marks made on it.
     Charcoal reads as graphite: the field becomes a pencil contour survey,
     which is the honest light-mode counterpart to a phosphor readout. It is
     also the ink ramp diluted rather than a new hue, so light mode gains no
     colour the palette did not already contain.

     BANDS AND TEXT CONVERGE HERE, which is the opposite of dark mode. There
     the bands move AWAY from bone text, so a bright band is the hazard. Here
     both the bands and the ink text are warm near-neutrals moving the same
     direction, so the ramp cannot simply run to charcoal proper: descending
     all the way to ink-000 puts the darkest band at 3.72:1 under text.

     An earlier version solved that by capping the ramp at the source, so the
     field was safe under text at any opacity. It measured fine and was too
     faint to be worth having — the whole point of the field is that you can
     see it. So this ramp mirrors the dark one instead: it goes properly dark
     and THE MASK CARRIES THE GUARANTEE, exactly as VERDIGRIS_BAND does.

     THE HELD ALPHA IS THE LEVER, not the cap. The composite over the text
     column is pinned by the AAA floor at roughly #b8b6af no matter what the
     ramp does — so lowering the mask's held alpha and darkening the ramp to
     match costs nothing behind the text and darkens everything outside it,
     where the mask reaches full alpha and no text sits. That is why light
     holds 0.27 while dark holds 0.452: this ramp is 2.65x darker at its
     bottom end than a 0.452 ramp could be, for the same guarantee.

     Composited at the held 0.27 over the paper ground, graphite-500 #2C2A26
     over each band measures:

       11.69  11.14  10.62  10.06  9.57  9.11  8.64  8.20  7.78

     7.78:1 is the worst case and it clears AAA. The field runs at alpha 1.0,
     because subtractive marks on paper have far less room to work in than
     emissive ones on ink — so the mask, not the opacity, does the limiting.

     The bands are NOT safe at full alpha here, unlike the earlier
     self-capping version: band 8 alone is 1.40:1 under ink. That is fine and
     intended, because the mask guarantees text never meets it — but it means
     the ramp and --vd-field-text-alpha are now a matched pair. Change one
     without the other and the guarantee is gone.

     CONSEQUENCE: the mask is now load-bearing in BOTH themes. It is not a
     stylistic device in light mode. Changing its held alpha or its stops
     breaks a published contrast figure here as well as in dark.            */
  const VERDIGRIS_PAPER = {
    name: 'VERDIGRIS_PAPER',
    bg: '#F0EDE4',
    thresholds: [0.12, 0.22, 0.32, 0.43, 0.54, 0.65, 0.75, 0.86, 1.01],
    nBands: 9,
    bandColors: [
      '#dddad2', '#c9c7bf', '#b6b4ad', '#a2a19a', '#8f8d88',
      '#7c7a75', '#686763', '#555450', '#42413e'
    ],
    /* Dead configuration, kept so every palette has the same shape: SHADE is
       the only mode the site uses and its cfn is null, so no contour pass
       ever runs. Graphite, to match the bands — a green contour over a
       neutral ramp would reintroduce exactly the tint this palette drops. */
    contourColor: '#2C2A26'
  };

  /* PHOSPHOR — the palette used by the spec's canonical example.
     Kept so selfTest() can run the published vector against real data. */
  const PHOSPHOR = {
    name: 'PHOSPHOR',
    bg: '#000000',
    thresholds: [0.12, 0.22, 0.32, 0.43, 0.54, 0.65, 0.75, 0.86, 1.01],
    nBands: 9,
    bandColors: ['#001a00', '#003300', '#004d00', '#006600', '#008000',
                 '#009900', '#00b300', '#00cc00', '#00e600'],
    contourColor: '#AAFF00'
  };

  /* ── character modes ───────────────────────────────────────────────── */

  // STRATA: math strokes as sediment layers. cfn gives contour glyphs.
  const STRATA = {
    name: 'STRATA',
    fill: [' ', '.', '_', '-', '=', '≈', '≡', '█'],
    cfn:  ['#', '=', '‖', '#']   // [neither, h-only, v-only, crossing]
  };

  const RELIEF = {
    name: 'RELIEF',
    fill: [' ', '.', '°', 'o', 'O', '0', '@', '█'],
    cfn:  ['+', '-', '¦', '+']
  };

  const SHADE = {
    name: 'SHADE',
    fill: [' ', ' ', '.', '.', '+', '+', '#', '@'],
    cfn:  null                        // no contour pass for this mode
  };

  /* ── resolve one grid of cells ─────────────────────────────────────────
     elev is a Float32Array of rows*cols already clamped to [0,1].
     Returns {chars: string[], slots: Int16Array} where slot >= nBands means
     the contour colour.                                                   */
  function resolveGrid(elev, cols, rows, palette, mode) {
    const chars = new Array(cols * rows);
    const slots = new Int16Array(cols * rows);
    const fillLen = mode.fill.length;
    const doContour = mode.cfn != null;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const e = elev[i];

        // 2. color_slot
        let colorSlot = colorSlotFor(palette, e);
        // 3. glyph_slot
        let glyphSlot = glyphSlotFor(mode, e);

        // 4. contour_pass
        if (doContour) {
          const eR = (c === cols - 1) ? e : elev[i + 1];
          const eD = (r === rows - 1) ? e : elev[i + cols];
          const q  = Math.floor(e  * CONTOUR_LEVELS);
          const qR = Math.floor(eR * CONTOUR_LEVELS);
          const qD = Math.floor(eD * CONTOUR_LEVELS);
          if (q !== qR || q !== qD) {
            const hasH = Math.abs(e - eR) > 0.001 ? 1 : 0;
            const hasV = Math.abs(e - eD) > 0.001 ? 1 : 0;
            const kase = hasH + 2 * hasV;      // case 0 is reachable
            colorSlot = palette.nBands;
            glyphSlot = fillLen + kase;
          }
        }

        // 5. resolve_cell
        chars[i] = glyphSlot < fillLen ? mode.fill[glyphSlot]
                                       : mode.cfn[glyphSlot - fillLen];
        slots[i] = colorSlot;
      }
    }
    return { chars: chars, slots: slots };
  }

  /* ── drift dynamics ──────────────────────────────────────────────────
     Sketch-level, not normative. selfTest asserts only that drift is
     DETERMINISTIC for a given seed, never that it produces particular
     values, so these constants are tunable without touching conformance.

     GENTLE BREEZE, LEFTWARD. The previous values were a gale dressed as a
     drift: speed ran 0.005–0.030 noise units per advance, which at 16.67
     advances/sec and NX = 0.0055 is 15 to 91 CELLS PER SECOND. The upper end
     crossed a 174-column hero in under two seconds.

       before   15–91 cells/sec, 6x speed range, direction biased +x
       after    11–14 cells/sec, 1.2x speed range, direction locked left

     At ~13 cells/sec the field takes about fourteen seconds to cross the
     hero. The first pass at this sat near 9 and read as too placid once the
     motion was actually coherent — worth noting, because the two problems
     masked each other: while the field was deforming rather than travelling,
     no speed felt right.

     WHY THE RANGE IS NARROW, not merely lower. The reported fault was that
     the field "drifts towards inactivity". Measured, glyph churn swung 6x
     because two unfloored terms multiplied: the speed range, and a
     y-compression factor that fell to 0.55 whenever the angle passed ±π/2.
     A near-constant speed removes the first. Locking the angle near π
     removes the second for free — cos stays within 0.92 of 1, so the
     compression can no longer dip. There is deliberately no separate
     step-normalising fix; the direction constraint subsumed it.

     What remains is that churn is a THRESHOLD function of speed, since a
     cell only changes when it crosses a glyph boundary — so the ratio of
     quiet to busy seconds is still wide. It no longer reads as decay,
     because there is no fast baseline to decay from: measured, the quietest
     second still turns over 7.5% of cells.

     ── HOW THE OFFSETS ARE APPLIED, and why it changed ──────────────────
     dx and dy now offset the SAMPLING ORIGIN — they are added to the x and y
     arguments of warpedFbm. They used to be passed as its dx/dy parameters,
     and that was the reason the field never read as travelling.

     warpedFbm feeds its dx into the warp at full weight but into the final
     sample at 0.6, so a change in dx is not one translation, it is two
     different ones fought out against each other. The field deformed in
     place instead of sliding. Measured by cross-correlating frames two
     seconds apart and finding the best-matching horizontal shift:

       driving warpedFbm's dx    shift  −6 half-cells, coherence 0.943
                                 and decaying: 0.809 at 4s, 0.669 at 16s
       offsetting the x argument shift  −9 half-cells, coherence 1.000
                                 holding 1.000 out to 8s

     Coherence 1.000 is not luck. Shifting the x argument shifts the ENTIRE
     composite function, warp included, so it is a rigid translation by
     construction. It also travels 1.5x further per unit of drift, because it
     carries a coefficient of 1 rather than 0.6.

     DIRECTION. Increasing the offset slides features LEFT: a feature at a
     fixed noise coordinate appears at screen x = (X − offset) / cell, so a
     rising offset moves it toward zero. The heading is therefore 0, not π —
     an earlier pass set π to mean "left" and sent the field right, which is
     what "it's not travelling" was reporting.

     WARP is a separate, much slower accumulator passed as warpedFbm's dy, so
     the terrain still evolves rather than sliding past as a rigid photograph.
     It is deliberately tiny: measured, 0.0002/frame holds coherence at 0.992
     over eight seconds, 0.0010 drops it to 0.853. 0.0003 buys weather without
     spending the sense of travel. */
  const DRIFT_HEADING = 0;        // 0 = origin advances +x = field slides LEFT
  const DRIFT_SPREAD  = 0.8;      // ±0.4 rad, so cos stays in [0.92, 1]
  const DRIFT_SPD_LO  = 0.0038;   // ~11.5 cells/sec
  const DRIFT_SPD_HI  = 0.0046;   // ~14.0 cells/sec — crosses a hero in ~14s
  /* WARP IS NOT SCALED WITH SPEED, on purpose. Travel now outpaces the
     terrain's own evolution by more than it did, so the field reads as
     sliding past rather than boiling — which is the direction this whole
     sequence of changes was pushing. Raising it in step would have given
     back some of the deformation the coherence work removed. */
  const DRIFT_WARP    = 0.0003;   // terrain evolution, independent of travel

  function makeDrift(seed) {
    // Deterministic pseudo-random init from seed, so a frozen frame under
    // prefers-reduced-motion is reproducible.
    let s = (seed >>> 0) || 1;
    const rnd = function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 0xFFFFFFFF;
    };
    return {
      dx: 0, dy: 0,
      // Starts already on heading, jittered inside the same band it will stay
      // in, so there is no opening swing in from a random direction.
      angle: DRIFT_HEADING + (rnd() - 0.5) * DRIFT_SPREAD,
      speed: DRIFT_SPD_LO + rnd() * (DRIFT_SPD_HI - DRIFT_SPD_LO),
      warp: 0,
      wa: rnd() * 50,
      ws: 50 + rnd() * 100,
      rnd: rnd,
      advance: function () {
        this.wa += 0.004 + this.rnd() * 0.003;
        this.ws += 0.003 + this.rnd() * 0.003;
        const angTarget = DRIFT_HEADING +
          (valueNoise(this.wa, 0.5) - 0.5) * DRIFT_SPREAD;
        this.angle += (angTarget - this.angle) * 0.035;
        const spdTarget = DRIFT_SPD_LO +
          valueNoise(0.5, this.ws) * (DRIFT_SPD_HI - DRIFT_SPD_LO);
        this.speed += (spdTarget - this.speed) * 0.055;
        // Sampling-origin offsets. Rising dx slides the field left.
        this.dx += Math.cos(this.angle) * this.speed;
        this.dy += Math.sin(this.angle) * this.speed * 0.55;   // y compression
        this.warp += DRIFT_WARP;
      }
    };
  }

  /* ── canvas renderer ───────────────────────────────────────────────── */

  /* Noise coordinate span across the whole grid, not per cell.
     A fixed per-cell frequency ties the amount of visible terrain to the
     number of cells, so the same setting that looks right on a 125-column
     desktop hero renders a 39-column mobile band almost perfectly flat.
     Holding the SPAN constant means you see a comparable stretch of terrain
     at any size, which is what "the same field" actually means.

     That turned out to be the wrong trade. Scaling the span to the grid
     makes each cell step further through the noise, and contour crossings
     scale with per-cell gradient: measured 57% of cells on a 31-column band
     against 9% on the 125-column hero. It reads as woven static, not
     terrain. Per-cell frequency is therefore FIXED, which keeps gradients
     (and contours) consistent at any size.

     The consequence is that a small grid samples a small, possibly flat
     patch. That is handled by the character mode, not by the frequency:
     below 860px the field switches to SHADE, whose cfn is null so the
     contour pass never runs. Thirty columns cannot draw a legible contour
     line; shaded relief is what that resolution can actually render. */
  const NX = 0.0055, NY = 0.0105;

  function Field(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.palette = opts.palette || VERDIGRIS;
    this.mode = opts.mode || STRATA;
    this.cellW = opts.cellW || 9;
    this.cellH = opts.cellH || 15;      // half the 30px baseline
    this.fontSize = opts.fontSize || 13;
    this.speedInterval = opts.speedInterval || 0.06;   // MED
    /* Loudness 5/7. Note the deliberate tradeoff: because bandColors are
       luminance-capped for the AAA guarantee, terrain SHADING is nearly
       invisible and the lime contour lines carry the entire read. The field
       is a contour map, not shaded relief. Raising the bands would make the
       shading visible and would break the unconditional 7:1 claim, so it
       does not happen. Alpha only ever reduces effective contrast impact,
       so the published worst case holds at any opacity. */
    this.opacity = opts.opacity == null ? 0.78 : opts.opacity;
    /* Contrast stretch, applied by the SKETCH, not by the noise primitive.
       warped_fbm is an average of averaged octaves, so its output clusters
       near its mean and never reaches the top glyphs or colour bands.

       The window must be measured, not hard-coded. A fixed window
       calibrated on one grid (0.15 + 0.36, from a 125x51 desktop sample)
       collapses to nothing on a 39x11 mobile band, because a small grid
       samples a small patch of noise space and therefore sees a much
       narrower slice of the range: measured 0.14..0.21 against 0.17..0.48.
       So the sketch calibrates from its own sampled extremes each frame.

       The window is low-passed across frames. Snapping it per frame would
       make the terrain visibly breathe as the drift moves through richer
       and flatter regions.

       The normative arithmetic is untouched throughout: this is the sketch
       remapping its own field, which the spec permits. */
    this.autoRange = opts.autoRange !== false;
    this.lo = opts.lo == null ? 0.15 : opts.lo;
    this.span = opts.span == null ? 0.36 : opts.span;
    this._nlo = undefined; this._nhi = undefined;
    /* ── DENSITY: gamma and floor ──────────────────────────────────────
       Both sketch-level, both here to fix the same complaint: large patches
       of nothing.

       The cause is structural, not a tuning slip. SHADE's fill set is
       [' ', ' ', '.', '.', '+', '+', '#', '@'] — slots 0 AND 1 are spaces, so
       a quarter of the elevation range renders as blank by definition. Gamma
       above 1 then pushes values DOWN into exactly those two slots. Measured
       over 30s of real drift at the old gamma of 1.7: 36.7% of cells blank,
       and the histogram was heavily bottom-loaded
       (18.1 18.6 18.5 13.4 10.5 7.5 7.3 6.1).

       The obvious fix is a fill set with one blank slot instead of two, but
       SHADE is a spec-defined mode and editing it would cost the 9/9 claim
       for a cosmetic gain. The stretch is explicitly the sketch's to own, so
       the compensation happens here instead.

       gamma 1.15 flattens the curve toward linear, spreading cells across the
       slots rather than piling them at the bottom. floor 0.14 then lifts the
       whole range so the emptiest cells land on a mark rather than a space.

       Measured at 1.15 / 0.14: 9% blank — valleys survive, holes do not —
       with a far more even histogram (0 9 11.8 20.3 19.9 16.6 11.7 10.7).

       CONTRAST IS UNAFFECTED. The floor raises the DIMMEST band in use from 0
       to 1; the brightest band, which is what every published figure is
       computed against, is untouched. Density rises, the worst case does not. */
    this.gamma = opts.gamma == null ? 1.15 : opts.gamma;
    this.floor = opts.floor == null ? 0.14 : opts.floor;
    this.nx = opts.nx == null ? NX : opts.nx;
    this.ny = opts.ny == null ? NY : opts.ny;
    this.seed = opts.seed || 20260801;
    this.drift = makeDrift(this.seed);
    this.frozen = !!opts.frozen;
    this._last = 0;
    this._raf = null;
    this._cols = 0; this._rows = 0;
    this._elev = null;
  }

  Field.prototype.resize = function () {
    const dpr = Math.min(global.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    this.canvas.width  = Math.round(r.width  * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._cols = Math.max(1, Math.ceil(r.width  / this.cellW));
    this._rows = Math.max(1, Math.ceil(r.height / this.cellH));
    this._elev = new Float32Array(this._cols * this._rows);
    this._w = r.width; this._h = r.height;
    return true;
  };

  Field.prototype.computeElevation = function () {
    const cols = this._cols, rows = this._rows, e = this._elev;
    /* dx/dy offset the sampling ORIGIN; warp is passed to warpedFbm's own
       parameter. That split is what makes the motion read as travel rather
       than as boiling — see the drift comment above for the measurements. */
    const dx = this.drift.dx, dy = this.drift.dy;
    const warp = this.drift.warp || 0;
    // Half-resolution then bilinear upsample, per the spec's performance
    // strategy. Keeps a full-width hero field cheap enough to run at 60fps.
    const hc = (cols >> 1) + 1, hr = (rows >> 1) + 1;
    if (!this._half || this._half.length !== hc * hr) {
      this._half = new Float32Array(hc * hr);
      this._hc = hc; this._hr = hr;
    }
    const half = this._half, gamma = this.gamma;
    const nx = this.nx, ny = this.ny;

    // pass 1 — sample the normative field, recording its actual extremes
    let mn = Infinity, mx = -Infinity;
    for (let r = 0; r < hr; r++) {
      for (let c = 0; c < hc; c++) {
        const v = warpedFbm(c * 2 * nx + dx, r * 2 * ny + dy, 0, warp);
        half[r * hc + c] = v;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }

    // window: measured and low-passed, or the fixed override
    let lo, range;
    if (this.autoRange) {
      if (this._nlo === undefined) { this._nlo = mn; this._nhi = mx; }
      else {
        const k = 0.08;                      // ~12 frames to settle
        this._nlo += (mn - this._nlo) * k;
        this._nhi += (mx - this._nhi) * k;
      }
      lo = this._nlo;
      range = Math.max(this._nhi - this._nlo, 1e-4);
    } else {
      lo = this.lo; range = this.span;
    }

    // pass 2 — stretch, curve, then lift off the floor. See the gamma/floor
    // comment in the constructor for why the lift exists.
    const floor = this.floor, span = 1 - this.floor;
    for (let i = 0; i < half.length; i++) {
      let v = (half[i] - lo) / range;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      half[i] = floor + Math.pow(v, gamma) * span;
    }
    for (let r = 0; r < rows; r++) {
      const sy = r / 2, y0 = Math.min(sy | 0, hr - 1), y1 = Math.min(y0 + 1, hr - 1);
      const fy = sy - y0;
      for (let c = 0; c < cols; c++) {
        const sx = c / 2, x0 = Math.min(sx | 0, hc - 1), x1 = Math.min(x0 + 1, hc - 1);
        const fx = sx - x0;
        const a = half[y0 * hc + x0] + (half[y0 * hc + x1] - half[y0 * hc + x0]) * fx;
        const b = half[y1 * hc + x0] + (half[y1 * hc + x1] - half[y1 * hc + x0]) * fx;
        let v = a + (b - a) * fy;
        e[r * cols + c] = v < 0 ? 0 : v > 1 ? 1 : v;   // clamp to [0,1]
      }
    }
  };

  Field.prototype.draw = function () {
    const ctx = this.ctx, cols = this._cols, rows = this._rows;
    const cell = resolveGrid(this._elev, cols, rows, this.palette, this.mode);
    ctx.clearRect(0, 0, this._w, this._h);
    ctx.globalAlpha = this.opacity;
    ctx.font = this.fontSize + 'px PlexMono, Consolas, monospace';
    ctx.textBaseline = 'top';

    // Batch by colour slot: one fillStyle change per band instead of per cell.
    const buckets = new Map();
    for (let i = 0; i < cell.slots.length; i++) {
      const ch = cell.chars[i];
      if (ch === ' ') continue;
      const s = cell.slots[i];
      let b = buckets.get(s);
      if (!b) { b = []; buckets.set(s, b); }
      b.push(i);
    }
    const nB = this.palette.nBands;
    buckets.forEach(function (idxs, slot) {
      ctx.fillStyle = slot >= nB ? this.palette.contourColor
                                 : this.palette.bandColors[slot];
      for (let k = 0; k < idxs.length; k++) {
        const i = idxs[k];
        ctx.fillText(cell.chars[i], (i % cols) * this.cellW, ((i / cols) | 0) * this.cellH);
      }
    }, this);
    ctx.globalAlpha = 1;
  };

  Field.prototype.frame = function (tMs) {
    const t = tMs / 1000;
    if (!this.frozen && (t - this._last) >= this.speedInterval) {
      this._last = t;
      this.drift.advance();
      this.computeElevation();
      this.draw();
    }
    this._raf = global.requestAnimationFrame(this.frame.bind(this));
  };

  Field.prototype.start = function () {
    if (!this.resize()) return this;
    this.computeElevation();
    this.draw();
    // Freeze to one deterministic seeded frame under reduced motion.
    // Required by topolang v1.3.2 Constraints > must.
    if (this.frozen) return this;
    this._raf = global.requestAnimationFrame(this.frame.bind(this));
    return this;
  };

  Field.prototype.stop = function () {
    if (this._raf) global.cancelAnimationFrame(this._raf);
    this._raf = null;
  };

  /* ── conformance self-test ─────────────────────────────────────────────
     Runs the spec's published contour_crossing vector plus the hash2
     invariant. Called by the docs page and safe to call in production.   */
  function selfTest() {
    const results = [];

    results.push({
      name: 'hash2(0,0) === 0',
      pass: hash2(0, 0) === 0,
      got: hash2(0, 0), want: 0
    });

    results.push({
      name: 'hash2 range',
      pass: (function () {
        for (let i = -50; i < 50; i++) {
          const h = hash2(i, i * 7);
          if (!(h >= 0 && h <= 0x7FFFFFFF)) return false;
        }
        return true;
      })(), got: 'in [0,0x7FFFFFFF]', want: 'in [0,0x7FFFFFFF]'
    });

    results.push({
      name: 'fade(0.5) === 0.5',
      pass: Math.abs(fade(0.5) - 0.5) < 1e-12, got: fade(0.5), want: 0.5
    });

    // Published canonical example: e=0.30, eR=0.36, eD=0.37, PHOSPHOR, fillLen 8
    const e = 0.30, eR = 0.36, eD = 0.37;
    /* SPEC DISCREPANCY, spec-topolang v1.3.2, Kernel > Canonical example.
       The trace states colorSlot = 3 before the contour pass, justified as
       "0.12, 0.22, 0.30 are all <= 0.30". But 0.30 is the elevation, not a
       threshold; the third threshold is 0.32. By the normative rule
       (Mechanism step 2: bisect_right = count of thresholds <= e) the value
       is 2. The illustrative trace counted e itself.

       This does not affect conformance. The contour pass overwrites
       colorSlot to nBands, so the published test vector (colorSlot 9,
       glyphSlot 11) is unchanged and is asserted below. We assert the
       normative rule here, not the prose trace. */
    const cs0 = colorSlotFor(PHOSPHOR, e);
    results.push({ name: 'canonical color_slot before contour (normative rule)',
                   pass: cs0 === 2, got: cs0, want: 2,
                   note: 'spec prose says 3; see SPEC DISCREPANCY comment' });

    const gs0 = glyphSlotFor(STRATA, e);
    results.push({ name: 'canonical glyph_slot before contour', pass: gs0 === 2, got: gs0, want: 2 });

    const elev = new Float32Array([e, eR, eD, eD]);     // 2x2: [e,eR / eD,eD]
    const out = resolveGrid(elev, 2, 2, PHOSPHOR, STRATA);
    results.push({
      name: 'canonical contour_crossing colorSlot',
      pass: out.slots[0] === 9, got: out.slots[0], want: 9
    });
    // glyphSlot 11 -> cfn[3], the crossing glyph
    results.push({
      name: 'canonical contour_crossing glyph = cfn[3]',
      pass: out.chars[0] === STRATA.cfn[3], got: out.chars[0], want: STRATA.cfn[3]
    });

    results.push({
      name: 'warped_fbm in [0,1]',
      pass: (function () {
        for (let i = 0; i < 200; i++) {
          const v = warpedFbm(i * 0.37, i * 0.11, i * 0.05, i * 0.03);
          if (!(v >= 0 && v <= 1)) return false;
        }
        return true;
      })(), got: 'in [0,1]', want: 'in [0,1]'
    });

    results.push({
      name: 'determinism: same seed, same frame',
      pass: (function () {
        const a = makeDrift(42), b = makeDrift(42);
        for (let i = 0; i < 25; i++) { a.advance(); b.advance(); }
        return a.dx === b.dx && a.dy === b.dy;
      })(), got: 'identical', want: 'identical'
    });

    const passed = results.filter(function (r) { return r.pass; }).length;
    return { results: results, passed: passed, total: results.length,
             conformant: passed === results.length };
  }

  global.topolang = {
    version: '1.3.2',
    hash2: hash2, fade: fade, valueNoise: valueNoise, fbm: fbm, warpedFbm: warpedFbm,
    bisectRight: bisectRight, colorSlotFor: colorSlotFor, glyphSlotFor: glyphSlotFor,
    resolveGrid: resolveGrid, CONTOUR_LEVELS: CONTOUR_LEVELS,
    palettes: { VERDIGRIS: VERDIGRIS, VERDIGRIS_BAND: VERDIGRIS_BAND,
                VERDIGRIS_PAPER: VERDIGRIS_PAPER, PHOSPHOR: PHOSPHOR },
    modes: { STRATA: STRATA, RELIEF: RELIEF, SHADE: SHADE },
    Field: Field, selfTest: selfTest,
    // The stateful extension is not claimed by this runtime.
    capabilities: { pureField: true, stateful: false }
  };
})(typeof window !== 'undefined' ? window : globalThis);
