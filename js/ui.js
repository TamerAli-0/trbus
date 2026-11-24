/*
 * Small shared UI helpers.
 * Icons: Lucide (ISC licence), loaded per page with
 *   <script src="https://unpkg.com/lucide@1.73.0/dist/umd/lucide.min.js"></script>
 * then <i data-lucide="search"></i> + UI.icons() after rendering.
 */
(function () {
  const UI = {
    icons(root) {
      if (window.lucide) window.lucide.createIcons({ root: root || document, attrs: { 'stroke-width': 1.75 } });
    },

    toast(text, icon = 'check') {
      let host = document.querySelector('.toast-host');
      if (!host) {
        host = document.createElement('div');
        host.className = 'toast-host';
        host.setAttribute('role', 'status');
        host.setAttribute('aria-live', 'polite');
        document.body.appendChild(host);
      }
      const el = document.createElement('div');
      el.className = 'toast';
      el.innerHTML = `<i data-lucide="${icon}"></i><span></span>`;
      el.querySelector('span').textContent = text;
      host.appendChild(el);
      UI.icons(el);
      setTimeout(() => {
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => el.remove(), { once: true });
      }, 2600);
    },

    esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    /* Lowercase, Turkish letters folded to plain Latin, Arabic diacritics removed: for search. */
    fold(s) {
      return String(s ?? '')
        .replace(/İ/g, 'i').replace(/I/g, 'ı')
        .toLowerCase()
        .replace(/[çğıöşü]/g, c => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }[c]))
        .replace(/[ً-ْـ]/g, '')
        .replace(/[أإآ]/g, 'ا')
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
    },

    reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  };
  window.UI = UI;
})();
