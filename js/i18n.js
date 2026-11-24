/*
 * Languages: tr (default), en, ar (right-to-left).
 * Pages register their own strings with I18n.add({ key: { tr, en, ar } }) and mark elements with
 * data-i18n="key" (text), data-i18n-attr="placeholder:key,aria-label:key2" (attributes).
 */
(function () {
  const LANGS = ['tr', 'en', 'ar'];
  const KEY = 'tarbus.lang';
  const dict = {};

  function initial() {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    try {
      const saved = localStorage.getItem(KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (e) { /* storage blocked */ }
    return 'tr';
  }

  const I18n = {
    langs: LANGS,
    labels: { tr: 'TR', en: 'EN', ar: 'عربي' },
    fullLabels: { tr: 'Türkçe', en: 'English', ar: 'العربية' },
    lang: initial(),

    add(strings) { Object.assign(dict, strings); return I18n; },

    /* A string can be an object of plural forms ({ one, two, few, many, other }), picked by the
       language's own counting rule: Arabic changes the counted word for 1, 2, 3–10 and 11–99. */
    t(key, vars) {
      const entry = dict[key];
      let s = entry ? (entry[I18n.lang] ?? entry.tr ?? key) : key;
      if (typeof s === 'object') s = s[new Intl.PluralRules(I18n.lang).select(Number(vars && vars.n))] ?? s.other;
      if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
      return s;
    },

    /* t() in a given language, whatever the page is set to (staff messages carry all three). */
    tIn(lang, key, vars) {
      const keep = I18n.lang;
      I18n.lang = lang;
      try { return I18n.t(key, vars); } finally { I18n.lang = keep; }
    },

    /* Picks the current language from an object with tr/en/ar fields, falling back to Turkish. */
    name(obj) {
      if (!obj) return '';
      return obj[I18n.lang] || obj.tr || '';
    },

    /* The translated name to show under the Turkish one, or '' when the page is in Turkish or it would repeat. */
    sub(obj) {
      if (!obj || I18n.lang === 'tr') return '';
      const s = obj[I18n.lang];
      return s && s !== obj.tr ? s : '';
    },

    /* A dish's name in the page's language (Turkish when there is no translation). */
    title(item) {
      if (!item) return '';
      return (I18n.lang !== 'tr' && item[I18n.lang]) || item.tr;
    },

    /* The language the title is written in, for the lang attribute. */
    titleLang(item) {
      return item && I18n.lang !== 'tr' && item[I18n.lang] ? I18n.lang : 'tr';
    },

    /* The Turkish name shown small under a translated title, so guests can still say it to the waiter. */
    alt(item) {
      if (!item || I18n.lang === 'tr') return '';
      const t = item[I18n.lang];
      return t && t !== item.tr ? item.tr : '';
    },

    desc(item) {
      return item && item.desc ? (item.desc[I18n.lang] || item.desc.tr || '') : '';
    },

    isRTL() { return I18n.lang === 'ar'; },

    locale() { return { tr: 'tr-TR', en: 'en-GB', ar: 'ar' }[I18n.lang]; },

    /* 2000 -> "2.000 ₺" (Turkish grouping in every language so prices read the same as on the bill). */
    price(n) {
      if (n == null || n === '' || isNaN(n)) return '';
      const s = Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return I18n.lang === 'ar' ? '⁦' + s + ' ₺⁩' : s + ' ₺';
    },

    set(lang) {
      if (!LANGS.includes(lang)) return;
      I18n.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch (e) { /* storage blocked */ }
      I18n.apply();
      window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    },

    apply(root = document) {
      document.documentElement.lang = I18n.lang;
      document.documentElement.dir = I18n.isRTL() ? 'rtl' : 'ltr';
      root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = I18n.t(el.dataset.i18n); });
      root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = I18n.t(el.dataset.i18nHtml); });
      root.querySelectorAll('[data-i18n-attr]').forEach(el => {
        el.dataset.i18nAttr.split(',').forEach(pair => {
          const [attr, key] = pair.split(':').map(s => s.trim());
          el.setAttribute(attr, I18n.t(key));
        });
      });
      document.querySelectorAll('.lang-switch').forEach(sw => {
        sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === I18n.lang)));
      });
    },

    /* Renders the TR / EN / عربي segmented switch into el. */
    mountSwitcher(el) {
      el.classList.add('lang-switch');
      el.setAttribute('role', 'group');
      el.setAttribute('aria-label', I18n.t('lang.label'));
      el.innerHTML = LANGS.map(l =>
        `<button type="button" data-lang="${l}" lang="${l}" aria-pressed="${l === I18n.lang}" title="${I18n.fullLabels[l]}">${I18n.labels[l]}</button>`
      ).join('');
      el.addEventListener('click', e => {
        const b = e.target.closest('button[data-lang]');
        if (b) I18n.set(b.dataset.lang);
      });
    }
  };

  I18n.add({
    'lang.label': { tr: 'Dil', en: 'Language', ar: 'اللغة' },
    'brand.tagline': { tr: 'Antakya sofrası', en: 'An Antakya table', ar: 'مائدة أنطاكية' },
    'nav.home': { tr: 'Ana sayfa', en: 'Home', ar: 'الرئيسية' },
    'nav.menu': { tr: 'Menü', en: 'Menu', ar: 'القائمة' },
    'nav.story': { tr: 'Sofra', en: 'Our table', ar: 'مائدتنا' },
    'nav.book': { tr: 'Rezervasyon', en: 'Book', ar: 'الحجز' },
    'nav.visit': { tr: 'Ulaşım', en: 'Visit', ar: 'الموقع' },
    'cta.book': { tr: 'Masa ayırt', en: 'Book a table', ar: 'احجز طاولة' },
    'cta.menu': { tr: 'Menüyü aç', en: 'Open the menu', ar: 'افتح القائمة' },
    'cta.whatsapp': { tr: 'WhatsApp ile yaz', en: 'Message on WhatsApp', ar: 'راسلنا على واتساب' },
    'cta.call': { tr: 'Ara', en: 'Call', ar: 'اتصل' },
    'cta.directions': { tr: 'Yol tarifi al', en: 'Get directions', ar: 'الاتجاهات' },
    'price.ask': { tr: 'Garsona sorun', en: 'Ask your waiter', ar: 'اسأل النادل' },
    'item.soldOut': { tr: 'Bugün tükendi', en: 'Sold out today', ar: 'نفد اليوم' },
    'tag.veg': { tr: 'Vejetaryen', en: 'Vegetarian', ar: 'نباتي' },
    'tag.signature': { tr: 'Tarbuş imzası', en: 'Signature dish', ar: 'طبقنا المميز' },
    'tag.spicy': { tr: 'Acılı', en: 'Spicy', ar: 'حار' },
    'serves': { tr: 'yaklaşık {n} kişilik', en: 'for about {n} people',
      ar: { one: 'يكفي شخصاً واحداً', two: 'يكفي نحو شخصين', few: 'يكفي نحو {n} أشخاص', many: 'يكفي نحو {n} شخصاً', other: 'يكفي نحو {n} شخص' } },
    'hours.open': { tr: 'Şu an açık', en: 'Open now', ar: 'مفتوح الآن' },
    'hours.closed': { tr: 'Şu an kapalı', en: 'Closed now', ar: 'مغلق الآن' },
    'hours.until': { tr: '{t} saatine kadar açık', en: 'Open until {t}', ar: 'مفتوح حتى {t}' },
    'hours.opensAt': { tr: '{t} saatinde açılıyor', en: 'Opens at {t}', ar: 'يفتح الساعة {t}' },
    'day.0': { tr: 'Pazar', en: 'Sunday', ar: 'الأحد' },
    'day.1': { tr: 'Pazartesi', en: 'Monday', ar: 'الاثنين' },
    'day.2': { tr: 'Salı', en: 'Tuesday', ar: 'الثلاثاء' },
    'day.3': { tr: 'Çarşamba', en: 'Wednesday', ar: 'الأربعاء' },
    'day.4': { tr: 'Perşembe', en: 'Thursday', ar: 'الخميس' },
    'day.5': { tr: 'Cuma', en: 'Friday', ar: 'الجمعة' },
    'day.6': { tr: 'Cumartesi', en: 'Saturday', ar: 'السبت' },
    'photo.none': { tr: 'Fotoğraf eklenmedi', en: 'No photo provided', ar: 'لا توجد صورة' },
    'today': { tr: 'Bugün', en: 'Today', ar: 'اليوم' }
  });

  /* Open/closed status from TARBUS.info.hours, handling closing times after midnight. */
  I18n.openStatus = function (hours, now = new Date()) {
    const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const nowM = now.getHours() * 60 + now.getMinutes();
    const today = hours.find(h => h.day === now.getDay());
    const yesterday = hours.find(h => h.day === (now.getDay() + 6) % 7);
    if (yesterday && mins(yesterday.close) < mins(yesterday.open) && nowM < mins(yesterday.close)) {
      return { open: true, text: I18n.t('hours.until', { t: yesterday.close }) };
    }
    if (today) {
      const o = mins(today.open), c = mins(today.close);
      const overnight = c < o;
      if (nowM >= o && (overnight || nowM < c)) return { open: true, text: I18n.t('hours.until', { t: today.close }) };
      if (nowM < o) return { open: false, text: I18n.t('hours.opensAt', { t: today.open }) };
    }
    const next = hours.find(h => h.day === (now.getDay() + 1) % 7);
    return { open: false, text: next ? I18n.t('hours.opensAt', { t: next.open }) : I18n.t('hours.closed') };
  };

  window.I18n = I18n;
  document.documentElement.lang = I18n.lang;
  document.documentElement.dir = I18n.isRTL() ? 'rtl' : 'ltr';
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => I18n.apply());
  else I18n.apply();
})();
