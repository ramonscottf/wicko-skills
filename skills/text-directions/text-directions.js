/* ============================================================
   WICKO • TEXT DIRECTIONS — v1.0
   <wicko-text-directions> custom element

   Usage:
     <wicko-text-directions
       address="869 S 2000 W, Syracuse, UT 84075"
       worker="https://your-worker.workers.dev/send"
       label="Text Directions"           (optional)
       title="Get directions by text"    (optional, modal heading)
       brand                              (optional, shows microbrand)
     ></wicko-text-directions>

   The 'worker' endpoint receives:
     POST { phone: "+18015551234", address: "...", maps_url: "..." }
   It should send the SMS via Twilio (or your provider) and respond
   with { ok: true } on success.
   ============================================================ */

(function () {
  if (customElements.get('wicko-text-directions')) return;

  const ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  // Format US phone number as the user types — non-destructive
  function formatUS(digits) {
    const d = digits.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  }

  function toE164(raw) {
    const d = (raw || '').replace(/\D/g, '');
    if (d.length === 10) return `+1${d}`;
    if (d.length === 11 && d.startsWith('1')) return `+${d}`;
    return null;
  }

  class WickoTextDirections extends HTMLElement {
    constructor() {
      super();
      this._open = false;
      this._onKey = this._onKey.bind(this);
    }

    connectedCallback() {
      const address = this.getAttribute('address') || '';
      const label   = this.getAttribute('label')   || 'Text Directions';
      const title   = this.getAttribute('title')   || 'Get directions by text';
      const showBrand = this.hasAttribute('brand');

      this.innerHTML = `
        <div class="wtd">
          <button type="button" class="wtd__trigger" data-wtd-open>
            ${ICON_PHONE}<span>${label}</span>
          </button>
        </div>
        <div class="wtd__backdrop" data-wtd-backdrop></div>
        <div class="wtd__modal" role="dialog" aria-modal="true" aria-labelledby="wtd-title-${this._id()}">
          <button type="button" class="wtd__close" data-wtd-close aria-label="Close">${ICON_X}</button>
          <div data-wtd-form-view>
            <h3 class="wtd__title" id="wtd-title-${this._id()}">${title}</h3>
            <p class="wtd__address">${address}</p>
            <div class="wtd__field">
              <label class="wtd__label" for="wtd-phone-${this._id()}">Phone Number</label>
              <input
                id="wtd-phone-${this._id()}"
                class="wtd__input"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="(801) 555-0199"
                data-wtd-input
              >
              <p class="wtd__error" data-wtd-error hidden></p>
            </div>
            <button type="button" class="wtd__submit" data-wtd-submit>Send Directions</button>
            <p class="wtd__hint">Standard text messaging rates apply.</p>
          </div>
          <div class="wtd__success" data-wtd-success-view hidden>
            <div class="wtd__success-icon">${ICON_CHECK}</div>
            <h3 class="wtd__success-title">On its way</h3>
            <p class="wtd__success-msg">Directions have been texted to your phone.</p>
          </div>
          ${showBrand ? `
            <div class="wtd__brand">
              <a class="w-microbrand" href="https://wickowaypoint.com" target="_blank" rel="noopener">Powered by Wicko Waypoint</a>
            </div>
          ` : ''}
        </div>
      `;

      this._trigger    = this.querySelector('[data-wtd-open]');
      this._backdrop   = this.querySelector('[data-wtd-backdrop]');
      this._modal      = this.querySelector('.wtd__modal');
      this._closeBtn   = this.querySelector('[data-wtd-close]');
      this._input      = this.querySelector('[data-wtd-input]');
      this._submit     = this.querySelector('[data-wtd-submit]');
      this._error      = this.querySelector('[data-wtd-error]');
      this._formView   = this.querySelector('[data-wtd-form-view]');
      this._successView= this.querySelector('[data-wtd-success-view]');

      this._trigger.addEventListener('click', () => this.open());
      this._backdrop.addEventListener('click', () => this.close());
      this._closeBtn.addEventListener('click', () => this.close());
      this._submit.addEventListener('click', () => this._send());
      this._input.addEventListener('input', (e) => {
        e.target.value = formatUS(e.target.value);
        this._setError('');
      });
      this._input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this._send(); }
      });
    }

    _id() {
      if (!this.__uid) this.__uid = Math.random().toString(36).slice(2, 8);
      return this.__uid;
    }

    open() {
      this._open = true;
      this._backdrop.classList.add('is-open');
      this._modal.classList.add('is-open');
      document.addEventListener('keydown', this._onKey);
      // reset to form view in case it was previously submitted
      this._formView.hidden = false;
      this._successView.hidden = true;
      this._submit.classList.remove('is-loading');
      this._submit.disabled = false;
      this._submit.textContent = 'Send Directions';
      setTimeout(() => this._input.focus(), 80);
    }

    close() {
      this._open = false;
      this._backdrop.classList.remove('is-open');
      this._modal.classList.remove('is-open');
      document.removeEventListener('keydown', this._onKey);
    }

    _onKey(e) {
      if (e.key === 'Escape') this.close();
    }

    _setError(msg) {
      if (!msg) {
        this._error.hidden = true;
        this._error.textContent = '';
      } else {
        this._error.hidden = false;
        this._error.textContent = msg;
      }
    }

    async _send() {
      const e164 = toE164(this._input.value);
      if (!e164) {
        this._setError('Please enter a valid 10-digit US phone number.');
        this._input.focus();
        return;
      }

      const worker  = this.getAttribute('worker');
      const address = this.getAttribute('address') || '';

      if (!worker) {
        this._setError('Configuration error: no worker endpoint set.');
        return;
      }

      const mapsUrl = 'https://www.google.com/maps/place/' + encodeURIComponent(address);

      this._submit.classList.add('is-loading');
      this._submit.disabled = true;
      this._setError('');

      try {
        const res = await fetch(worker, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: e164, address, maps_url: mapsUrl }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.ok === false) {
          throw new Error((data && data.error) || `Send failed (${res.status})`);
        }

        // Fire success event so host pages can hook in
        this.dispatchEvent(new CustomEvent('wtd:sent', {
          bubbles: true,
          detail: { phone: e164, address }
        }));

        // Show success view
        this._formView.hidden = true;
        this._successView.hidden = false;

        // Auto-close after a beat
        setTimeout(() => this.close(), 2400);
      } catch (err) {
        this._submit.classList.remove('is-loading');
        this._submit.disabled = false;
        this._setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  }

  customElements.define('wicko-text-directions', WickoTextDirections);
})();
