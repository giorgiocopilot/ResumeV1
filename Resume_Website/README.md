# Giorgio Tsoupis — Interactive Résumé

A premium, single-page interactive résumé with editorial typography, smooth scroll
reveals, a blurred "unlock" gate, one-click PDF export, and a WhatsApp / email
contact flow. Zero build step, zero runtime dependencies, no trackers, no cookies.

Built as static HTML, CSS, and vanilla JavaScript so it runs anywhere
(Cloudflare Pages, GitHub Pages, Netlify, any static host).

---

## What is inside

```
Resume_Website/
├── index.html               # The whole page (pre-rendered, works without JS)
├── privacy.html             # GDPR-style privacy notice (noindex)
├── build.mjs                # Optional: regenerate content from resume.json
├── _headers                 # Security headers + CSP (Cloudflare Pages / Netlify)
├── robots.txt               # Allows the site, hides /privacy
├── sitemap.xml              # Single-URL sitemap
├── .gitignore
└── assets/
    ├── css/
    │   ├── styles.css       # Full design system
    │   └── print.css        # A4 recruiter-ready PDF / print stylesheet
    ├── js/
    │   └── main.js          # Cursor, reveals, count-up, blur gate, PDF export
    ├── data/
    │   └── resume.json      # Editable content source of truth
    └── img/                 # Optimized portrait, avatar, OG image, favicon
```

---

## Key features

| Feature | Where |
|---|---|
| Editorial hero with clip-reveal name and staggered intro | `.hero` in `index.html`, `styles.css` |
| Smooth scroll reveals on every section | `IntersectionObserver` in `main.js` |
| Animated count-up KPIs | `.metrics`, `initCounters()` |
| Custom cursor with hover-grow (auto-off on touch / reduced-motion) | `initCursor()` |
| Résumé starts blurred, unlocks via WhatsApp or email button | `.resume-wrap.locked`, `unlockResume()` |
| "Just view the résumé" bypass link | `#gateSkip` |
| One-click Export to PDF (browser print, searchable, A4) | `#pdfBtn`, `#navPdf`, `print.css` |
| Portfolio card and link redirect to `www.copilotadoption.uk` | `#portfolio`, hero social links |
| Floating WhatsApp button | `.fab-whatsapp` |
| Respects `prefers-reduced-motion` | media queries in `styles.css`, guards in `main.js` |
| No cookies, analytics, fingerprinting, or third-party scripts | by design |

---

## Local preview

Because the page fetches nothing at runtime, you can just open `index.html`.
For an exact production-like preview, serve the folder over HTTP:

```bash
# Python (any version 3.x)
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Editing content (no UI changes needed)

1. Edit `assets/data/resume.json`.
2. Regenerate the Experience and Capabilities sections:

```bash
node build.mjs
```

This rewrites only the content between the `<!-- BUILD:* -->` markers in
`index.html`. Everything else (design, animations) is untouched.

> The hero summary, metrics, education, certifications, and languages are edited
> directly in `index.html` (they rarely change). The build script focuses on the
> two sections that grow over time.

### Replacing the photo

Drop a new portrait into `assets/img/` and update the `<img>` `src`/`srcset` in
the hero. Recommended widths: 320 / 600 / 900 px, JPEG, progressive.

---

## The blur gate and PDF export explained

- On load, the résumé (`#resumeWrap`) has the class `locked`, which blurs it and
  shows the gate overlay with two buttons.
- Clicking **WhatsApp** or **Email** (hero, gate, or footer) opens the visitor's
  own app with a pre-filled message **and** removes the blur. Nothing is sent
  automatically.
- **Export to PDF** (top toolbar or nav) unlocks the résumé, then calls
  `window.print()`. `print.css` forces the résumé fully visible, hides all site
  chrome, and lays it out on A4 as selectable, searchable text. In the print
  dialog choose **Save as PDF**.

To change the WhatsApp number or messages, edit the `CONTACT` object at the top
of `assets/js/main.js` (and the print contact line in `print.css`).

---

## Deploy — Cloudflare Pages (recommended)

1. Push this folder to your GitHub repo (e.g. `giorgiocopilot/Resume_Website`).
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → select the repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Deploy. The `_headers` file automatically applies the security headers and CSP.
5. **Custom domain:** Pages → your project → **Custom domains** → add
   `www.copilotadoption.uk` (and the apex if you want). Cloudflare provisions
   HTTPS automatically. Point the DNS `CNAME`/`A` records as Cloudflare prompts.

## Deploy — GitHub Pages (alternative)

1. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** →
   `main` / root.
2. For a custom domain, add a `CNAME` file containing `www.copilotadoption.uk`
   and configure DNS. Note: GitHub Pages ignores `_headers`; if you need the CSP
   there, front it with Cloudflare proxy.

---

## Accessibility and quality

- Semantic landmarks, skip link, visible focus, keyboard-operable controls.
- Content is pre-rendered, so it works with JavaScript disabled and is
  screen-reader and SEO friendly.
- Motion is disabled under `prefers-reduced-motion`; no information depends on
  animation.
- The private `privacy.html` is `noindex`.

---

## Notes and options

- **Fonts:** loaded from Google Fonts for the display look. To fully self-host
  (stricter CSP, no third-party font requests), download the Inter and Space
  Grotesk `.woff2` files into `assets/fonts/`, add `@font-face` rules, and remove
  the Google Fonts `<link>` tags plus the `fonts.g*` entries in `_headers`.
- **Education institution** is intentionally left blank in `resume.json` until you
  confirm it.
- The résumé content reflects verified and self-reported facts from the provided
  CV and LinkedIn export. Review before publishing.
