# Text Directions

Drop-in `<wicko-text-directions>` web component. A user taps the button, types their phone number, and your venue's address gets texted to them as a tappable maps link.

Lifted from the funeral-mortuary playbook (Tukios). One field. One tap. No login.

---

## Install (CDN — recommended)

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://skills.wickowaypoint.com/brand/wicko-tokens.css">
<link rel="stylesheet" href="https://skills.wickowaypoint.com/skills/text-directions/text-directions.css">

<!-- Anywhere in <body> -->
<wicko-text-directions
  address="869 S 2000 W, Syracuse, UT 84075"
  worker="https://your-twilio-worker.workers.dev"
  brand
></wicko-text-directions>

<!-- Before </body> -->
<script src="https://skills.wickowaypoint.com/skills/text-directions/text-directions.js" defer></script>
```

That's it.

---

## Self-host

Copy `text-directions.css` and `text-directions.js` into your project. The component requires `wicko-tokens.css` for theming — copy that too, or override the `--w-*` custom properties yourself.

---

## Backend — deploy your own worker

The component POSTs to a Cloudflare Worker that sends the SMS via Twilio. The worker source is in this skill folder (`worker.js` + `wrangler.toml`).

```bash
cd skills/text-directions
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_FROM      # e.g. +18016907449
wrangler deploy
```

Then point the `worker` attribute at the deployed URL.

The worker accepts `POST { phone, address, maps_url }` and returns `{ ok: true }` on success.

---

## Attributes

| Attribute | Required | Description |
|---|---|---|
| `address` | yes | Full street address. Used in the SMS body and to build the maps URL. |
| `worker` | yes | URL of the Cloudflare Worker that sends the SMS. |
| `label` | no | Trigger button text. Default: `Text Directions`. |
| `title` | no | Modal heading. Default: `Get directions by text`. |
| `brand` | no | Boolean flag. If present, shows a small "Powered by Wicko Waypoint" link in the modal footer. |

---

## Events

The component emits a `wtd:sent` CustomEvent on successful send. Listen for it on the element or any ancestor:

```js
document.addEventListener('wtd:sent', (e) => {
  console.log('SMS sent', e.detail); // { phone, address }
});
```

Useful for analytics — track conversions, count usage per service block, etc.

---

## Accessibility

- The modal uses `role="dialog"` and `aria-modal="true"`.
- Escape closes the modal.
- The phone input uses `inputmode="tel"` and `autocomplete="tel"` so iOS/Android suggest the user's number.
- Font size is 16px to suppress iOS zoom-on-focus.
- Trigger and submit are real `<button>` elements.

---

## Theming

All visuals are driven by `--w-*` custom properties from `wicko-tokens.css`. Override on `:root` or any ancestor:

```css
:root {
  --w-accent: #1B3A4B;        /* navy instead of coral */
  --w-cream: #ffffff;          /* white modal */
  --w-radius-card: 8px;        /* tighter corners */
}
```

The component re-themes automatically.

---

## Example pages

See `example.html` in this folder.

---

## License

Proprietary — © Wicko Waypoint LLC. Free for use on Davis Education Foundation properties (`daviskids.org` and subdomains). Contact `hello@wickowaypoint.com` for other use.
