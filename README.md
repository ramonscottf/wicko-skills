# Wicko Skills

A library of small, opinionated, drop-in web components and CSS systems built by **Wicko Waypoint LLC**. Each skill solves one problem well, themes from a shared design vocabulary, and self-hosts in minutes.

> **The thesis:** every site we build keeps reinventing the same five interactions. Build them once. Brand them. Reuse forever.

---

## Live at

**[skills.wickowaypoint.com](https://skills.wickowaypoint.com)**

CDN-served, instantly cached, ready to drop into any HTML page.

---

## Available skills

| Skill | What it does |
|---|---|
| [`text-directions`](./skills/text-directions/) | One-tap "text me directions to this venue" SMS modal. The Tukios funeral-mortuary pattern, productized. |

More coming.

---

## Brand

- [`brand/wicko-tokens.css`](./brand/wicko-tokens.css) — shared design tokens (color, type, motion, shape). Every skill inherits.
- [`brand/wicko-pill-nav.css`](./brand/wicko-pill-nav.css) — the signature floating pill navigation (the Foster ecosystem header).

---

## Two ways to use a skill

### 1. CDN drop-in (default)

```html
<link rel="stylesheet" href="https://skills.wickowaypoint.com/brand/wicko-tokens.css">
<link rel="stylesheet" href="https://skills.wickowaypoint.com/skills/text-directions/text-directions.css">
<script src="https://skills.wickowaypoint.com/skills/text-directions/text-directions.js" defer></script>
```

### 2. Self-host

Clone the repo, copy the files for the skills you want into your project, theme via the `--w-*` custom properties on `:root`.

```bash
git clone https://github.com/ramonscottf/wicko-skills.git
```

---

## Repo layout

```
wicko-skills/
├── README.md
├── LICENSE
├── brand/
│   ├── wicko-tokens.css         ← shared design tokens
│   └── wicko-pill-nav.css       ← signature header CSS
├── skills/
│   └── text-directions/
│       ├── SKILL.md             ← install + reference
│       ├── text-directions.css
│       ├── text-directions.js   ← <wicko-text-directions> custom element
│       ├── worker.js            ← reference Twilio backend (Cloudflare Worker)
│       ├── wrangler.toml
│       └── example.html
└── docs/
    └── index.html               ← skills.wickowaypoint.com landing page
```

---

## License

Each skill ships with a license header. Default: proprietary, with a free-use grant for **Davis Education Foundation** (`daviskids.org` and its subdomains).

For other use, contact **hello@wickowaypoint.com**.

---

© 2026 Wicko Waypoint LLC · Farmington, Utah · EIN 41-5171763
