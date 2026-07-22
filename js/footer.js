/*!
 * World Trainer Forum — Unified Footer Component v3.0
 * Self-contained: Injects CSS + HTML on every page automatically.
 * Replaces any existing <footer> element found in the DOM.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     CSS — All footer styles scoped under #wtf-footer to avoid
     conflicts with existing page styles.
  ───────────────────────────────────────────────────────────────── */
  var CSS = [
    '#wtf-footer {',
    '  background: linear-gradient(180deg, #070e1c 0%, #0a1628 100%);',
    '  color: #c8d3e0;',
    '  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    '  position: relative;',
    '  overflow: hidden;',
    '  box-sizing: border-box;',
    '  width: 100%;',
    '}',

    /* Gold gradient top border */
    '#wtf-footer::before {',
    '  content: "";',
    '  position: absolute; top: 0; left: 0; right: 0;',
    '  height: 3px;',
    '  background: linear-gradient(90deg, transparent 0%, #c5a059 25%, #f0d080 55%, #c5a059 78%, transparent 100%);',
    '}',

    /* Radial glow behind top border */
    '#wtf-footer::after {',
    '  content: "";',
    '  position: absolute; top: 0; left: 50%; transform: translateX(-50%);',
    '  width: min(1000px, 100%);',
    '  height: 380px;',
    '  background: radial-gradient(ellipse at 50% 0%, rgba(197,160,89,.08) 0%, transparent 65%);',
    '  pointer-events: none;',
    '}',

    /* ── Upper wave separator ── */
    '.ftc-wave {',
    '  width: 100%;',
    '  line-height: 0;',
    '  overflow: hidden;',
    '}',
    '.ftc-wave svg { display: block; width: 100%; }',

    /* ── Outer container ── */
    '.ftc-outer {',
    '  max-width: 1280px;',
    '  margin: 0 auto;',
    '  padding: 0 32px;',
    '  position: relative;',
    '  z-index: 1;',
    '}',

    /* ── Newsletter banner (full-width accent block) ── */
    '.ftc-nl-banner {',
    '  background: linear-gradient(135deg, rgba(197,160,89,.12) 0%, rgba(197,160,89,.04) 100%);',
    '  border: 1px solid rgba(197,160,89,.2);',
    '  border-radius: 20px;',
    '  padding: 32px 36px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  gap: 24px;',
    '  flex-wrap: wrap;',
    '  margin: 48px 0 52px;',
    '}',
    '.ftc-nl-txt { flex: 1; min-width: 200px; }',
    '.ftc-nl-txt strong {',
    '  display: block;',
    '  font-size: 1.05rem;',
    '  font-weight: 700;',
    '  color: #fff;',
    '  margin-bottom: 4px;',
    '}',
    '.ftc-nl-txt span {',
    '  font-size: .82rem;',
    '  color: #8898aa;',
    '}',
    '.ftc-nl-row {',
    '  display: flex;',
    '  gap: 8px;',
    '  flex: 1;',
    '  min-width: 260px;',
    '  max-width: 460px;',
    '}',
    '.ftc-nl-input {',
    '  flex: 1;',
    '  padding: 12px 16px;',
    '  background: rgba(255,255,255,.07);',
    '  border: 1px solid rgba(255,255,255,.14);',
    '  border-radius: 12px;',
    '  color: #fff;',
    '  font-size: .875rem;',
    '  outline: none;',
    '  transition: border-color .2s, background .2s;',
    '  box-sizing: border-box;',
    '  font-family: inherit;',
    '}',
    '.ftc-nl-input:focus {',
    '  border-color: rgba(197,160,89,.55);',
    '  background: rgba(255,255,255,.1);',
    '}',
    '.ftc-nl-input::placeholder { color: #3a4a5c; }',
    '.ftc-nl-btn {',
    '  padding: 12px 22px;',
    '  background: linear-gradient(135deg, #c5a059, #d9b870);',
    '  color: #0a1628;',
    '  font-weight: 700;',
    '  font-size: .82rem;',
    '  border: none;',
    '  border-radius: 12px;',
    '  cursor: pointer;',
    '  white-space: nowrap;',
    '  transition: transform .2s, box-shadow .2s;',
    '  font-family: inherit;',
    '  letter-spacing: .03em;',
    '}',
    '.ftc-nl-btn:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: 0 8px 20px rgba(197,160,89,.4);',
    '}',

    /* ── Main 4-column grid ── */
    '.ftc-grid {',
    '  display: grid;',
    '  grid-template-columns: 1.7fr 1fr 1fr 1.3fr;',
    '  gap: 48px;',
    '  padding-bottom: 48px;',
    '  border-bottom: 1px solid rgba(255,255,255,.07);',
    '}',

    /* ── Brand column ── */
    '.ftc-brand-logo {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  text-decoration: none;',
    '  margin-bottom: 14px;',
    '}',
    '.ftc-brand-logo img {',
    '  height: 40px; width: auto; flex-shrink: 0;',
    '}',
    '.ftc-brand-logo-txt {',
    '  font-size: 1.1rem;',
    '  font-weight: 700;',
    '  color: #fff;',
    '  line-height: 1.2;',
    '  letter-spacing: -.01em;',
    '}',
    '.ftc-brand-logo-txt em {',
    '  font-style: normal;',
    '  color: #c5a059;',
    '}',
    '.ftc-brand-desc {',
    '  font-size: .85rem;',
    '  line-height: 1.75;',
    '  color: #6b7f94;',
    '  margin: 0 0 20px;',
    '  max-width: 265px;',
    '}',

    /* Badges */
    '.ftc-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; }',
    '.ftc-badge {',
    '  display: inline-flex; align-items: center; gap: 5px;',
    '  background: rgba(255,255,255,.04);',
    '  border: 1px solid rgba(255,255,255,.09);',
    '  border-radius: 99px;',
    '  padding: 4px 10px;',
    '  font-size: .7rem;',
    '  font-weight: 600;',
    '  color: #6b7f94;',
    '  letter-spacing: .02em;',
    '}',
    '.ftc-badge-dot {',
    '  width: 6px; height: 6px;',
    '  border-radius: 50%;',
    '  background: #c5a059;',
    '  flex-shrink: 0;',
    '}',

    /* Social icons */
    '.ftc-social { display: flex; gap: 8px; flex-wrap: wrap; }',
    '.ftc-soc-btn {',
    '  width: 40px; height: 40px;',
    '  border-radius: 50%;',
    '  background: rgba(255,255,255,.06);',
    '  border: 1px solid rgba(255,255,255,.1);',
    '  display: flex; align-items: center; justify-content: center;',
    '  color: #6b7f94;',
    '  text-decoration: none;',
    '  transition: background .25s, color .25s, border-color .25s, transform .2s;',
    '  flex-shrink: 0;',
    '}',
    '.ftc-soc-btn:hover {',
    '  background: rgba(197,160,89,.15);',
    '  border-color: rgba(197,160,89,.45);',
    '  color: #c5a059;',
    '  transform: translateY(-3px);',
    '}',

    /* ── Link column heading ── */
    '.ftc-col-hd {',
    '  font-size: .7rem;',
    '  font-weight: 700;',
    '  letter-spacing: .13em;',
    '  text-transform: uppercase;',
    '  color: #c5a059;',
    '  margin: 0 0 16px;',
    '  padding: 0;',
    '}',

    /* Link list */
    '.ftc-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }',
    '.ftc-links li a {',
    '  display: flex; align-items: center; gap: 7px;',
    '  font-size: .855rem;',
    '  color: #6b7f94;',
    '  text-decoration: none;',
    '  padding: 6px 0;',
    '  min-height: 36px;',
    '  transition: color .2s, padding-left .2s;',
    '  border-radius: 4px;',
    '}',
    '.ftc-links li a::before {',
    '  content: "";',
    '  width: 4px; height: 4px;',
    '  border-radius: 50%;',
    '  background: #c5a059;',
    '  opacity: 0;',
    '  flex-shrink: 0;',
    '  transition: opacity .2s;',
    '}',
    '.ftc-links li a:hover { color: #e0c87a; padding-left: 5px; }',
    '.ftc-links li a:hover::before { opacity: 1; }',

    /* CTA button */
    '.ftc-cta-btn {',
    '  display: inline-flex; align-items: center; gap: 7px;',
    '  margin-top: 18px;',
    '  background: linear-gradient(135deg, #c5a059, #d9b870);',
    '  color: #0a1628;',
    '  font-size: .8rem; font-weight: 700;',
    '  padding: 11px 20px;',
    '  border-radius: 99px;',
    '  text-decoration: none;',
    '  transition: transform .2s, box-shadow .2s;',
    '  box-shadow: 0 4px 14px rgba(197,160,89,.25);',
    '  letter-spacing: .02em;',
    '}',
    '.ftc-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(197,160,89,.4); }',

    /* Contact column */
    '.ftc-contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }',
    '.ftc-contact-ico {',
    '  width: 34px; height: 34px;',
    '  border-radius: 9px;',
    '  background: rgba(197,160,89,.1);',
    '  border: 1px solid rgba(197,160,89,.18);',
    '  display: flex; align-items: center; justify-content: center;',
    '  color: #c5a059;',
    '  flex-shrink: 0;',
    '}',
    '.ftc-contact-lbl {',
    '  display: block;',
    '  font-size: .75rem; font-weight: 600; color: #c8d3e0;',
    '  margin-bottom: 2px;',
    '}',
    '.ftc-contact-val {',
    '  font-size: .82rem; color: #6b7f94;',
    '  text-decoration: none;',
    '  transition: color .2s;',
    '}',
    'a.ftc-contact-val:hover { color: #c5a059; }',

    /* ── Topics strip ── */
    '.ftc-topics-wrap {',
    '  padding: 32px 0 28px;',
    '  border-bottom: 1px solid rgba(255,255,255,.07);',
    '}',
    '.ftc-topics-lbl {',
    '  display: block;',
    '  font-size: .68rem; font-weight: 700;',
    '  text-transform: uppercase; letter-spacing: .13em;',
    '  color: #3a4a5c;',
    '  margin-bottom: 14px;',
    '}',
    '.ftc-chips { display: flex; flex-wrap: wrap; gap: 8px; }',
    '.ftc-chip {',
    '  background: rgba(255,255,255,.04);',
    '  border: 1px solid rgba(255,255,255,.08);',
    '  color: #6b7f94;',
    '  font-size: .78rem;',
    '  padding: 6px 13px;',
    '  border-radius: 99px;',
    '  text-decoration: none;',
    '  transition: background .2s, color .2s, border-color .2s;',
    '  min-height: 32px; display: inline-flex; align-items: center;',
    '}',
    '.ftc-chip:hover {',
    '  background: rgba(197,160,89,.12);',
    '  border-color: rgba(197,160,89,.35);',
    '  color: #c5a059;',
    '}',

    /* ── Trust bar ── */
    '.ftc-trust {',
    '  display: flex; align-items: center; justify-content: center;',
    '  flex-wrap: wrap; gap: 0;',
    '  padding: 18px 32px;',
    '  background: rgba(255,255,255,.02);',
    '  border-top: 1px solid rgba(255,255,255,.06);',
    '  border-bottom: 1px solid rgba(255,255,255,.06);',
    '}',
    '.ftc-trust-item {',
    '  display: flex; align-items: center; gap: 7px;',
    '  padding: 6px 22px;',
    '  font-size: .75rem; font-weight: 600; color: #3a4a5c;',
    '}',
    '.ftc-trust-item svg { color: #c5a059; flex-shrink: 0; }',
    '.ftc-trust-div { width: 1px; height: 18px; background: rgba(255,255,255,.08); }',

    /* ── Bottom legal bar ── */
    '.ftc-bottom {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  flex-wrap: wrap; gap: 12px;',
    '  max-width: 1280px;',
    '  margin: 0 auto;',
    '  padding: 20px 32px 24px;',
    '}',
    '.ftc-copy { font-size: .75rem; color: #3a4a5c; }',
    '.ftc-legal { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }',
    '.ftc-legal a {',
    '  font-size: .75rem; color: #3a4a5c;',
    '  text-decoration: none; padding: 4px 8px; border-radius: 4px;',
    '  transition: color .2s; min-height: 32px; display: inline-flex; align-items: center;',
    '}',
    '.ftc-legal a:hover { color: #c5a059; }',
    '.ftc-legal-dot { color: #1d2a3a; font-size: .7rem; padding: 0 1px; }',
    '.ftc-made { font-size: .75rem; color: #3a4a5c; }',

    /* ════════════════════════════════════════════
       RESPONSIVE BREAKPOINTS
    ════════════════════════════════════════════ */
    '@media (max-width: 1024px) {',
    '  .ftc-grid { grid-template-columns: 1fr 1fr; gap: 36px; }',
    '  .ftc-outer { padding: 0 24px; }',
    '  .ftc-bottom { padding: 20px 24px 24px; }',
    '}',

    '@media (max-width: 768px) {',
    '  .ftc-grid { grid-template-columns: 1fr; gap: 32px; }',
    '  .ftc-outer { padding: 0 20px; }',
    '  .ftc-brand-desc { max-width: 100%; }',
    '  .ftc-nl-banner {',
    '    flex-direction: column;',
    '    padding: 24px 20px;',
    '    gap: 16px;',
    '    border-radius: 14px;',
    '    margin: 32px 0 40px;',
    '  }',
    '  .ftc-nl-row { max-width: 100%; min-width: unset; width: 100%; }',
    '  .ftc-nl-txt strong { font-size: .95rem; }',
    '  .ftc-links li a { min-height: 44px; font-size: .9rem; }',
    '  .ftc-soc-btn { width: 44px; height: 44px; }',
    '  .ftc-cta-btn { width: 100%; justify-content: center; padding: 14px 20px; }',
    '  .ftc-trust { padding: 14px 16px; }',
    '  .ftc-trust-item { padding: 5px 12px; font-size: .72rem; }',
    '  .ftc-trust-div { display: none; }',
    '  .ftc-bottom {',
    '    flex-direction: column; align-items: center; text-align: center;',
    '    padding: 20px; gap: 10px;',
    '  }',
    '  .ftc-legal { justify-content: center; }',
    '  .ftc-topics-wrap { padding: 24px 0 20px; }',
    '  .ftc-chip { min-height: 36px; }',
    '}',

    '@media (max-width: 480px) {',
    '  .ftc-outer { padding: 0 16px; }',
    '  .ftc-bottom { padding: 16px; }',
    '  .ftc-trust-item span { display: none; }',
    '  .ftc-trust-item { padding: 5px 10px; }',
    '  .ftc-badges { gap: 5px; }',
    '}'
  ].join('\n');

  /* ─────────────────────────────────────────────────────────────────
     SVG icons (inline, no FontAwesome dependency)
  ───────────────────────────────────────────────────────────────── */
  var ico = {
    check:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    globe:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    star:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    mail:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    phone:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    pin:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    lock:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    user:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    card:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    arrow:  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    li:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    ig:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    tw:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    yt:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#070e1c"/></svg>',
    fb:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'
  };

  /* ─────────────────────────────────────────────────────────────────
     HTML — Build footer markup
  ───────────────────────────────────────────────────────────────── */
  function buildHTML() {
    return '' +
    '<footer id="wtf-footer" role="contentinfo" aria-label="Site footer">' +

    /* ── Newsletter Banner ── */
    '<div class="ftc-outer">' +
    '<div class="ftc-nl-banner">' +
    '  <div class="ftc-nl-txt">' +
    '    <strong>&#128176; Weekly Training Insights — Free</strong>' +
    '    <span>Expert tips, industry trends &amp; event updates. No spam. Unsubscribe anytime.</span>' +
    '  </div>' +
    '  <form class="ftc-nl-row" id="ftc-nl-form" onsubmit="return false;" role="form" aria-label="Newsletter signup">' +
    '    <input type="email" class="ftc-nl-input" placeholder="your@email.com" aria-label="Your email address">' +
    '    <button type="submit" class="ftc-nl-btn">Subscribe ' + ico.arrow + '</button>' +
    '  </form>' +
    '</div>' +

    /* ── Main 4-Column Grid ── */
    '<div class="ftc-grid">' +

    /* COL 1: Brand */
    '<div>' +
    '  <a class="ftc-brand-logo" href="index.html" aria-label="World Trainer Forum Home">' +
    '    <img src="img/logo.svg" alt="World Trainer Forum" loading="lazy">' +
    '    <span class="ftc-brand-logo-txt">World Trainer <em>Forum</em></span>' +
    '  </a>' +
    '  <p class="ftc-brand-desc">The premier global marketplace connecting organizations &amp; individuals with verified trainers, coaches, mentors &amp; speakers across 140+ disciplines in 120+ countries.</p>' +
    '  <div class="ftc-badges">' +
    '    <span class="ftc-badge"><span class="ftc-badge-dot"></span>Verified Trainers</span>' +
    '    <span class="ftc-badge"><span class="ftc-badge-dot"></span>120+ Countries</span>' +
    '    <span class="ftc-badge"><span class="ftc-badge-dot"></span>50K+ Experts</span>' +
    '    <span class="ftc-badge"><span class="ftc-badge-dot"></span>1M+ Learners</span>' +
    '  </div>' +
    '  <div class="ftc-social">' +
    '    <a href="#" class="ftc-soc-btn" aria-label="LinkedIn">' + ico.li + '</a>' +
    '    <a href="#" class="ftc-soc-btn" aria-label="Instagram">' + ico.ig + '</a>' +
    '    <a href="#" class="ftc-soc-btn" aria-label="X (Twitter)">' + ico.tw + '</a>' +
    '    <a href="#" class="ftc-soc-btn" aria-label="YouTube">' + ico.yt + '</a>' +
    '    <a href="#" class="ftc-soc-btn" aria-label="Facebook">' + ico.fb + '</a>' +
    '  </div>' +
    '</div>' +

    /* COL 2: Quick Navigation */
    '<div>' +
    '  <h4 class="ftc-col-hd">Quick Links</h4>' +
    '  <ul class="ftc-links">' +
    '    <li><a href="index.html">Home</a></li>' +
    '    <li><a href="find-trainers.html">Find Trainers</a></li>' +
    '    <li><a href="certificates.html">Certificates</a></li>' +
    '    <li><a href="news-events.html">News &amp; Events</a></li>' +
    '    <li><a href="blog.html">Blog</a></li>' +
    '    <li><a href="about.html">About Us</a></li>' +
    '    <li><a href="contact.html">Contact Us</a></li>' +
    '    <li><a href="pricing.html">Pricing</a></li>' +
    '    <li><a href="faqs.html">FAQs</a></li>' +
    '    <li><a href="corporate-training.html">Corporate Training</a></li>' +
    '    <li><a href="request-custom-training.html">Custom Training</a></li>' +
    '  </ul>' +
    '</div>' +

    /* COL 3: Training Areas + CTA */
    '<div>' +
    '  <h4 class="ftc-col-hd">Training Areas</h4>' +
    '  <ul class="ftc-links">' +
    '    <li><a href="soft-skills-training.html">Soft Skills</a></li>' +
    '    <li><a href="technology-training.html">Tech &amp; AI</a></li>' +
    '    <li><a href="health-wellness.html">Fitness &amp; Health</a></li>' +
    '    <li><a href="leadership-training.html">Leadership</a></li>' +
    '    <li><a href="sales-training.html">Sales &amp; Marketing</a></li>' +
    '    <li><a href="executive-coaching.html">Executive Coaching</a></li>' +
    '    <li><a href="team-building.html">Team Building</a></li>' +
    '    <li><a href="public-speaking.html">Public Speaking</a></li>' +
    '    <li><a href="finance-training.html">Finance</a></li>' +
    '    <li><a href="hr-training.html">HR Training</a></li>' +
    '  </ul>' +
    '  <a href="dashboard.html" class="ftc-cta-btn">' + ico.check + ' Join as Trainer</a>' +
    '</div>' +

    /* COL 4: Contact & Community */
    '<div>' +
    '  <h4 class="ftc-col-hd">Contact &amp; Support</h4>' +
    '  <div class="ftc-contact-item">' +
    '    <div class="ftc-contact-ico">' + ico.mail + '</div>' +
    '    <div>' +
    '      <span class="ftc-contact-lbl">Email Support</span>' +
    '      <a href="mailto:support@worldtrainerforum.com" class="ftc-contact-val">support@worldtrainerforum.com</a>' +
    '    </div>' +
    '  </div>' +
    '  <div class="ftc-contact-item">' +
    '    <div class="ftc-contact-ico">' + ico.phone + '</div>' +
    '    <div>' +
    '      <span class="ftc-contact-lbl">24/7 Helpdesk</span>' +
    '      <span class="ftc-contact-val">+91 98765 43210</span>' +
    '    </div>' +
    '  </div>' +
    '  <div class="ftc-contact-item">' +
    '    <div class="ftc-contact-ico">' + ico.pin + '</div>' +
    '    <div>' +
    '      <span class="ftc-contact-lbl">Global Headquarters</span>' +
    '      <span class="ftc-contact-val">Mumbai, India &amp; Dubai, UAE</span>' +
    '    </div>' +
    '  </div>' +
    '  <h4 class="ftc-col-hd" style="margin-top:20px;">For Trainers</h4>' +
    '  <ul class="ftc-links">' +
    '    <li><a href="dashboard.html">Trainer Dashboard</a></li>' +
    '    <li><a href="become-verified.html">Become Verified</a></li>' +
    '    <li><a href="trainer-resources.html">Resources</a></li>' +
    '    <li><a href="community-forum.html">Community Forum</a></li>' +
    '    <li><a href="earnings-program.html">Earnings Program</a></li>' +
    '  </ul>' +
    '</div>' +

    '</div>' + /* /ftc-grid */

    /* ── Topics strip ── */
    '<div class="ftc-topics-wrap">' +
    '  <span class="ftc-topics-lbl">Popular Training Topics</span>' +
    '  <div class="ftc-chips">' +
    '    <a class="ftc-chip" href="leadership-training.html">Leadership</a>' +
    '    <a class="ftc-chip" href="soft-skills-training.html">Communication Skills</a>' +
    '    <a class="ftc-chip" href="technology-training.html">AI &amp; Technology</a>' +
    '    <a class="ftc-chip" href="sales-training.html">Sales &amp; Marketing</a>' +
    '    <a class="ftc-chip" href="hr-training.html">HR Training</a>' +
    '    <a class="ftc-chip" href="public-speaking.html">Public Speaking</a>' +
    '    <a class="ftc-chip" href="personal-development.html">Personal Development</a>' +
    '    <a class="ftc-chip" href="business-strategy.html">Business Strategy</a>' +
    '    <a class="ftc-chip" href="finance-training.html">Finance</a>' +
    '    <a class="ftc-chip" href="health-wellness.html">Health &amp; Wellness</a>' +
    '    <a class="ftc-chip" href="executive-coaching.html">Executive Coaching</a>' +
    '    <a class="ftc-chip" href="team-building.html">Team Building</a>' +
    '    <a class="ftc-chip" href="ai-technology.html">Data Science</a>' +
    '    <a class="ftc-chip" href="corporate-training.html">Corporate Training</a>' +
    '  </div>' +
    '</div>' +
    '</div>' + /* /ftc-outer */

    /* ── Trust bar ── */
    '<div class="ftc-trust" role="list" aria-label="Trust indicators">' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.shield + '<span>SSL Secure</span></div>' +
    '  <div class="ftc-trust-div"></div>' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.lock + '<span>GDPR Compliant</span></div>' +
    '  <div class="ftc-trust-div"></div>' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.user + '<span>Verified Profiles</span></div>' +
    '  <div class="ftc-trust-div"></div>' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.card + '<span>Safe Payments</span></div>' +
    '  <div class="ftc-trust-div"></div>' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.globe + '<span>Global Community</span></div>' +
    '  <div class="ftc-trust-div"></div>' +
    '  <div class="ftc-trust-item" role="listitem">' + ico.check + '<span>ISO Certified</span></div>' +
    '</div>' +

    /* ── Bottom legal bar ── */
    '<div class="ftc-bottom">' +
    '  <span class="ftc-copy">&#169; 2026 World Trainer Forum Technologies Pvt. Ltd. All rights reserved.</span>' +
    '  <nav class="ftc-legal" aria-label="Legal links">' +
    '    <a href="privacy-policy.html">Privacy Policy</a>' +
    '    <span class="ftc-legal-dot">&#183;</span>' +
    '    <a href="terms-conditions.html">Terms of Service</a>' +
    '    <span class="ftc-legal-dot">&#183;</span>' +
    '    <a href="#">Cookie Policy</a>' +
    '    <span class="ftc-legal-dot">&#183;</span>' +
    '    <a href="#">Accessibility</a>' +
    '    <span class="ftc-legal-dot">&#183;</span>' +
    '    <a href="sitemap.html">Sitemap</a>' +
    '  </nav>' +
    '  <span class="ftc-made">Made for Global Learning &amp; Growth &#127757;</span>' +
    '</div>' +

    '</footer>';
  }

  /* ─────────────────────────────────────────────────────────────────
     Inject CSS into <head>
  ───────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('wtf-footer-styles')) return;
    var style = document.createElement('style');
    style.id = 'wtf-footer-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────────────────────────
     Inject footer HTML
  ───────────────────────────────────────────────────────────────── */
  function injectFooter() {
    var html = buildHTML();
    var existing = document.querySelector('footer');
    if (existing) {
      existing.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('beforeend', html);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     Newsletter interaction
  ───────────────────────────────────────────────────────────────── */
  function bindNewsletter() {
    var form = document.getElementById('ftc-nl-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('.ftc-nl-input');
      var btn   = form.querySelector('.ftc-nl-btn');
      var email = input ? input.value.trim() : '';
      if (!email || !email.includes('@')) {
        if (input) { input.style.borderColor = 'rgba(231,76,60,.5)'; setTimeout(function(){ input.style.borderColor = ''; }, 2000); }
        return;
      }
      if (btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = '&#10003; Subscribed!';
        btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        btn.disabled = true;
        setTimeout(function () {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.disabled = false;
          if (input) input.value = '';
        }, 3500);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     Entry point
  ───────────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    injectFooter();
    bindNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
