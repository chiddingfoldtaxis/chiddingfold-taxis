#!/usr/bin/env node
/**
 * build-pages.mjs — generate the local/route landing pages from content/landing-pages.json
 *
 *   node scripts/build-pages.mjs
 *
 * Writes <slug>/index.html for each entry. The OUTPUT is plain static HTML that gets
 * committed — the site itself still has no build step. This is a one-off authoring
 * tool (like generate-images.mjs) so the five pages stay consistent with each other
 * and with index.html. Edit the JSON and re-run to update copy.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://chiddingfoldtaxis.co.uk';
const TEL_DISPLAY = '01483&nbsp;387&nbsp;475';
const TEL_HREF = 'tel:+441483387475';
const WA_HREF = 'https://wa.me/447453267475';

const pages = JSON.parse(readFileSync(join(ROOT, 'content', 'landing-pages.json'), 'utf8'));

const PHONE_SVG =
  '<svg class="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z"/></svg>';
const WA_SVG =
  '<svg class="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M17.5 14.4c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1c-.2.3-.7 1-.9 1.2s-.3.2-.6.1c-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2s0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5c-.1-.1-.7-1.5-.9-2.1-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1.1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4s.2-1.2.2-1.4c-.1-.1-.3-.2-.6-.3M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.9-1.3A10 10 0 1 0 12 2m0 18.2c-1.6 0-3.2-.4-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2"/></svg>';

const LOGO = `<img class="brand__mark" src="../assets/icons/logo-mark.svg" width="40" height="40" alt="" aria-hidden="true">`;

const header = () => `
  <header class="site-header" id="top">
    <div class="container site-header__inner">
      <a class="brand" href="../" aria-label="Chiddingfold Taxis — home">
        ${LOGO}
        <span class="brand__name">Chiddingfold&nbsp;Taxis</span>
      </a>
      <nav class="nav" aria-label="Primary">
        <button class="nav__toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <ul class="nav__menu" id="nav-menu">
          <li><a class="nav__link" href="../airport-transfers/">Airports</a></li>
          <li><a class="nav__link" href="../godalming-taxis/">Godalming</a></li>
          <li><a class="nav__link" href="../haslemere-taxis/">Haslemere</a></li>
          <li><a class="nav__link" href="../#areas">Areas</a></li>
          <li><a class="nav__link" href="../#quote">Quote</a></li>
        </ul>
      </nav>
      <a class="header-cta" href="${TEL_HREF}" data-call>
        ${PHONE_SVG.replace('width="20" height="20"', 'width="18" height="18"')}
        <span class="header-cta__text"><span class="header-cta__label">Call now</span><span class="header-cta__num">${TEL_DISPLAY}</span></span>
      </a>
    </div>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="container footer__grid">
      <div class="footer__col footer__brand">
        <a class="brand" href="../" aria-label="Chiddingfold Taxis — home">${LOGO}<span class="brand__name">Chiddingfold&nbsp;Taxis</span></a>
        <p class="footer__tag">Reliable, friendly local taxis &amp; airport transfers across the Surrey Hills. 24 hours a day, 7 days a week.</p>
      </div>
      <div class="footer__col">
        <h3>Contact</h3>
        <ul class="footer__list">
          <li><a class="link" href="${TEL_HREF}" data-call>${TEL_DISPLAY}</a></li>
          <li><a class="link" href="${WA_HREF}" target="_blank" rel="noopener">WhatsApp 07453&nbsp;267&nbsp;475</a></li>
          <li><a class="link" href="mailto:info@chiddingfoldtaxis.co.uk">info@chiddingfoldtaxis.co.uk</a></li>
          <li>Hartsgrove, Chiddingfold, Surrey GU8&nbsp;4RG</li>
          <li>Open 24 hours · 7 days a week</li>
        </ul>
      </div>
      <div class="footer__col">
        <h3>Airports</h3>
        <ul class="footer__list footer__list--links">
          <li><a href="../airport-transfers/">Airport transfers</a></li>
          <li><a href="../godalming-to-heathrow-taxi/">Godalming to Heathrow</a></li>
          <li><a href="../godalming-to-gatwick-taxi/">Godalming to Gatwick</a></li>
          <li><a href="../#airports">Luton, Stansted &amp; City</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h3>Nearby</h3>
        <ul class="footer__list footer__list--links">
          <li><a href="../">Chiddingfold taxi</a></li>
          <li><a href="../godalming-taxis/">Godalming taxi</a></li>
          <li><a href="../haslemere-taxis/">Haslemere taxi</a></li>
          <li><a href="../#areas">Witley &amp; Milford</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer__legal">
      <p>© <span data-year>2026</span> Chiddingfold Taxis · Chiddingfold, Surrey.
      <!-- ⚑ CONFIRM licensing line before publishing -->
      Licensed private hire — Waverley Borough Council.</p>
    </div>
  </footer>`;

const related = (slug) => {
  const all = pages.filter((p) => p.slug !== slug);
  return `
      <h2>More from Chiddingfold Taxis</h2>
      <ul>
        ${all.map((p) => `<li><a href="../${p.slug}/">${p.linkText || p.h1}</a></li>`).join('\n        ')}
        <li><a href="../">Chiddingfold, Godalming &amp; Haslemere taxis — main page</a></li>
      </ul>`;
};

const render = (p) => {
  const faqLd = p.faqs.length
    ? `,
      {
        "@type": "FAQPage",
        "@id": "${SITE}/${p.slug}/#faq",
        "mainEntity": [${p.faqs
          .map(
            (f) => `
          { "@type": "Question", "name": ${JSON.stringify(f.q)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(
              f.a.replace(/<[^>]+>/g, '')
            )} } }`
          )
          .join(',')}
        ]
      }`
    : '';

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${p.title}</title>
  <meta name="description" content="${p.metaDescription}">
  <link rel="canonical" href="${SITE}/${p.slug}/">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="theme-color" content="#0e2e3e">
  <meta name="format-detection" content="telephone=yes">
  <meta name="geo.region" content="GB-SRY">
  <meta name="geo.placename" content="Chiddingfold, Surrey">
  <meta name="geo.position" content="51.117773;-0.635982">
  <meta name="ICBM" content="51.117773, -0.635982">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Chiddingfold Taxis">
  <meta property="og:title" content="${p.title}">
  <meta property="og:description" content="${p.metaDescription}">
  <meta property="og:url" content="${SITE}/${p.slug}/">
  <meta property="og:image" content="${SITE}/assets/images/og-image.jpg">
  <meta property="og:image:alt" content="Chiddingfold Taxis — 24/7 local taxi &amp; airport transfers">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${p.title}">
  <meta name="twitter:description" content="${p.metaDescription}">
  <meta name="twitter:image" content="${SITE}/assets/images/og-image.jpg">

  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="icon" type="image/png" sizes="48x48" href="../assets/icons/icon-48.png">
  <link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="preload" href="../assets/fonts/fraunces-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/styles.css">

  <!-- The LocalBusiness lives on the homepage; sub-pages reference it by @id so
       there is exactly one business entity across the site. -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "${SITE}/${p.slug}/#webpage",
        "url": "${SITE}/${p.slug}/",
        "name": ${JSON.stringify(p.title)},
        "description": ${JSON.stringify(p.metaDescription)},
        "inLanguage": "en-GB",
        "isPartOf": { "@id": "${SITE}/#website" },
        "about": { "@id": "${SITE}/#business" },
        "breadcrumb": { "@id": "${SITE}/${p.slug}/#breadcrumb" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "${SITE}/${p.slug}/#breadcrumb",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/" },
          { "@type": "ListItem", "position": 2, "name": ${JSON.stringify(p.h1)} }
        ]
      },
      {
        "@type": "Service",
        "@id": "${SITE}/${p.slug}/#service",
        "serviceType": ${JSON.stringify(p.serviceType || 'Taxi service')},
        "name": ${JSON.stringify(p.h1)},
        "provider": { "@id": "${SITE}/#business" },
        "areaServed": ${JSON.stringify(p.areaServed || ['Godalming', 'Chiddingfold', 'Haslemere'])},
        "description": ${JSON.stringify(p.metaDescription)}
      }${faqLd}
    ]
  }
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${header()}

  <main id="main">
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="breadcrumb"><a href="../">Home</a> › ${p.h1}</p>
        <h1>${p.h1}</h1>
        <p class="page-hero__intro">${p.intro}</p>
        <div class="page-hero__cta">
          <a class="btn btn--call" href="${TEL_HREF}" data-call>${PHONE_SVG} Call ${TEL_DISPLAY}</a>
          <a class="btn btn--ghost" href="${WA_HREF}" target="_blank" rel="noopener">${WA_SVG} WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container container--narrow prose">
${p.sections.map((s) => `        <h2>${s.heading}</h2>\n${s.body.split('\n').map((l) => '        ' + l).join('\n')}`).join('\n\n')}

${related(p.slug).split('\n').map((l) => '  ' + l).join('\n')}
      </div>
    </section>

${p.faqs.length ? `    <section class="section section--faq" aria-labelledby="faq-title">
      <div class="container container--narrow">
        <div class="section__head">
          <p class="eyebrow">Good to know</p>
          <h2 class="section__title" id="faq-title">Frequently asked questions</h2>
        </div>
        <div class="faq">
${p.faqs
  .map(
    (f) => `          <details class="faq__item">
            <summary>${f.q}</summary>
            <div class="faq__body"><p>${f.a}</p></div>
          </details>`
  )
  .join('\n')}
        </div>
      </div>
    </section>` : ''}

    <section class="cta-band" aria-labelledby="cta-title">
      <div class="container cta-band__inner">
        <h2 id="cta-title">Ready when you are — day or night</h2>
        <p>Call for a fixed-price quote on your next airport run or local trip. We're here 24/7.</p>
        <a class="btn btn--light btn--lg" href="${TEL_HREF}" data-call>${PHONE_SVG.replace('width="20" height="20"', 'width="22" height="22"')} Call ${TEL_DISPLAY}</a>
      </div>
    </section>
  </main>

${footer()}

  <a class="callbar" href="${TEL_HREF}" data-call>
    ${PHONE_SVG}
    <span>Call now · ${TEL_DISPLAY}</span>
  </a>

  <script src="../assets/js/main.js" defer></script>
</body>
</html>
`;
};

let n = 0;
for (const p of pages) {
  const dir = join(ROOT, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), render(p));
  const words = (p.sections.map((s) => s.body).join(' ') + p.intro).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`  ${(p.slug + '/').padEnd(30)} ${String(words).padStart(4)} words  ${p.faqs.length} FAQs`);
  n++;
}
console.log(`\nBuilt ${n} pages.`);
