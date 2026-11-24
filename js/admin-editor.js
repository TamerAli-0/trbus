/*
 * The dish editor on the owner page: edit every field of a dish, or add a new one.
 * DishEditor.init({ confirm, undoToast }) once, then DishEditor.open(id) or DishEditor.create(catId).
 */
(function () {
  const { esc, icons, toast } = UI;
  const LOGO = 'assets/brand/tarbus-logo.png';

  I18n.add({
    'e.edit': { tr: 'Yemeği düzenle', en: 'Edit dish', ar: 'تعديل الطبق' },
    'e.new': { tr: 'Yeni yemek', en: 'New dish', ar: 'طبق جديد' },
    'e.close': { tr: 'Kapat', en: 'Close', ar: 'إغلاق' },
    'e.photo': { tr: 'Fotoğraf', en: 'Photo', ar: 'الصورة' },
    'e.pick': { tr: 'Fotoğraf seç', en: 'Choose photo', ar: 'اختر صورة' },
    'e.change': { tr: 'Fotoğrafı değiştir', en: 'Change photo', ar: 'غيّر الصورة' },
    'e.removePhoto': { tr: 'Fotoğrafı kaldır', en: 'Remove photo', ar: 'احذف الصورة' },
    'e.photoHint': { tr: 'Telefonunuzdan veya bilgisayarınızdan. Kare, üstten çekilmiş tabak fotoğrafları en iyi görünür.', en: 'From your phone or computer. Square, top-down plate photos look best.', ar: 'من هاتفك أو حاسوبك. أفضل الصور مربعة ومأخوذة من الأعلى.' },
    'e.photoBusy': { tr: 'Fotoğraf hazırlanıyor…', en: 'Preparing photo…', ar: 'جارٍ تجهيز الصورة…' },
    'e.photoBad': { tr: 'Bu dosya açılamadı. Bir JPG ya da PNG fotoğraf seçin.', en: 'That file could not be opened. Choose a JPG or PNG photo.', ar: 'تعذّر فتح هذا الملف. اختر صورة JPG أو PNG.' },
    'e.names': { tr: 'Yemeğin adı', en: 'Dish name', ar: 'اسم الطبق' },
    'e.nameTr': { tr: 'Türkçe (zorunlu)', en: 'Turkish (required)', ar: 'بالتركية (إلزامي)' },
    'e.nameEn': { tr: 'İngilizce', en: 'English', ar: 'بالإنجليزية' },
    'e.nameAr': { tr: 'Arapça', en: 'Arabic', ar: 'بالعربية' },
    'e.nameMissing': { tr: 'Türkçe adı yazın.', en: 'Write the Turkish name.', ar: 'اكتب الاسم بالتركية.' },
    'e.cat': { tr: 'Kategori', en: 'Category', ar: 'الفئة' },
    'e.price': { tr: 'Fiyat', en: 'Price', ar: 'السعر' },
    'e.priceHint': { tr: 'Boş bırakırsanız misafir “Garsona sorun” görür.', en: 'Leave empty and guests see “Ask your waiter”.', ar: 'اتركه فارغاً ليظهر للضيوف «اسأل النادل».' },
    'e.priceBad': { tr: 'Geçerli bir fiyat girin.', en: 'Enter a valid price.', ar: 'أدخل سعراً صحيحاً.' },
    'e.serving': { tr: 'Porsiyon / ambalaj', en: 'Portion / pack', ar: 'الحصة / العبوة' },
    'e.servingHint': { tr: 'Örn. Tek porsiyon, Kutu · 330 ml', en: 'e.g. Single portion, Can · 330 ml', ar: 'مثلاً: حصة واحدة، علبة · 330 مل' },
    'e.desc': { tr: 'Açıklama', en: 'Description', ar: 'الوصف' },
    'e.tags': { tr: 'Etiketler', en: 'Labels', ar: 'الوسوم' },
    'e.status': { tr: 'Durum', en: 'Status', ar: 'الحالة' },
    'e.soldOut': { tr: 'Bugün tükendi', en: 'Sold out today', ar: 'نفد اليوم' },
    'e.hidden': { tr: 'Misafirlerden gizle', en: 'Hide from guests', ar: 'إخفاء عن الضيوف' },
    'e.save': { tr: 'Kaydet', en: 'Save', ar: 'حفظ' },
    'e.add': { tr: 'Menüye ekle', en: 'Add to menu', ar: 'أضف إلى القائمة' },
    'e.cancel': { tr: 'Vazgeç', en: 'Cancel', ar: 'إلغاء' },
    'e.delete': { tr: 'Çöp kutusuna taşı', en: 'Move to trash', ar: 'انقل إلى سلة المحذوفات' },
    'e.saved': { tr: 'Kaydedildi, menü güncellendi', en: 'Saved, the menu is updated', ar: 'تم الحفظ وتحدّثت القائمة' },
    'e.added': { tr: '{name} menüye eklendi', en: '{name} added to the menu', ar: 'أضيف {name} إلى القائمة' },
    'e.trashed': { tr: '{name} çöp kutusuna taşındı', en: '{name} moved to the trash', ar: 'نُقل {name} إلى سلة المحذوفات' },
    'e.full': { tr: 'Kaydedilemedi: tarayıcıda yer kalmadı. Daha küçük bir fotoğraf deneyin.', en: 'Could not save: this browser is out of room. Try a smaller photo.', ar: 'تعذّر الحفظ: لا توجد مساحة في المتصفح. جرّب صورة أصغر.' },
    'e.leaveTitle': { tr: 'Değişiklikler kaydedilmedi', en: 'Changes not saved', ar: 'لم تُحفظ التغييرات' },
    'e.leaveText': { tr: 'Kapatırsanız bu yemekteki değişiklikler kaybolur.', en: 'If you close, the changes to this dish are lost.', ar: 'إذا أغلقت ستضيع التغييرات على هذا الطبق.' },
    'e.leaveDiscard': { tr: 'Kaydetmeden kapat', en: 'Close without saving', ar: 'أغلق دون حفظ' },
    'e.leaveKeep': { tr: 'Düzenlemeye devam', en: 'Keep editing', ar: 'تابع التعديل' },
    'e.edited': { tr: 'Düzenlendi', en: 'Edited', ar: 'معدّل' },
    'e.newBadge': { tr: 'Yeni', en: 'New', ar: 'جديد' }
  });

  const cats = window.TARBUS.categories;
  const $ = s => document.querySelector(s);
  let deps = { confirm: null, undoToast: null };
  let ed = null; // { mode, id, data, dirty, opener }

  const tri = v => ({ tr: (v && v.tr) || '', en: (v && v.en) || '', ar: (v && v.ar) || '' });
  const fmt = n => (n == null ? '' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  function parsePrice(s) {
    const t = String(s).trim().replace(/[₺\s]/g, '').replace(/\./g, '').replace(',', '.');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 && n < 1000000 ? Math.round(n) : NaN;
  }

  function fromItem(it) {
    return {
      tr: it.tr || '', en: it.en || '', ar: it.ar || '',
      cat: it.cat, price: it.price ?? null, photo: it.photo || null,
      variant: tri(it.variant), desc: tri(it.desc),
      tags: [...(it.tags || [])], soldOut: !!it.soldOut, hidden: !!it.hidden,
      sizes: it.sizes || null, custom: !!it.custom, edited: !!it.edited
    };
  }

  function blank(cat) {
    return {
      tr: '', en: '', ar: '', cat: cat || cats[0].id, price: null, photo: null,
      variant: tri(), desc: tri(), tags: [], soldOut: false, hidden: false, sizes: null, custom: true, edited: false
    };
  }

  /* ---------- Markup ---------- */
  function langInput(group, lang, value, opts = {}) {
    const id = `ed-${group}-${lang}`;
    const tag = opts.area ? 'textarea' : 'input';
    const attrs = `id="${id}" class="${opts.area ? 'textarea' : 'input'}" data-group="${group}" data-lang="${lang}" lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" maxlength="${opts.max || 80}" autocomplete="off"${opts.ph ? ` placeholder="${esc(opts.ph)}"` : ''}${opts.required ? ' required aria-required="true"' : ''}`;
    const body = opts.area ? `<${tag} ${attrs} rows="2">${esc(value)}</${tag}>` : `<${tag} ${attrs} value="${esc(value)}">`;
    return `<div class="ed-lang">
      <label for="${id}" class="ed-lang__tag" lang="${lang}">${lang === 'ar' ? 'عربي' : lang.toUpperCase()}</label>${body}
    </div>`;
  }

  function photoHTML(d) {
    const pic = d.photo
      ? `<img class="ed-photo__img" src="${esc(d.photo)}" alt="">`
      : `<div class="ed-photo__none"><img src="${LOGO}" alt=""><span>${esc(I18n.t('photo.none'))}</span></div>`;
    return `<div class="ed-photo__frame" id="ed-photo-frame">${pic}</div>
      <div class="ed-photo__actions">
        <label class="btn btn-quiet btn-sm" for="ed-file"><i data-lucide="image-plus"></i><span>${esc(I18n.t(d.photo ? 'e.change' : 'e.pick'))}</span></label>
        <input type="file" id="ed-file" accept="image/*" class="visually-hidden">
        ${d.photo ? `<button type="button" class="btn btn-ghost btn-sm" data-ed="remove-photo"><i data-lucide="trash-2"></i><span>${esc(I18n.t('e.removePhoto'))}</span></button>` : ''}
        <p class="ed-hint" id="ed-photo-msg">${esc(I18n.t('e.photoHint'))}</p>
      </div>`;
  }

  function formHTML() {
    const d = ed.data;
    const tagChip = (t, icon) => `<label class="ed-chip"><input type="checkbox" data-tag="${t}" ${d.tags.includes(t) ? 'checked' : ''}><span><i data-lucide="${icon}"></i>${esc(I18n.t('tag.' + t))}</span></label>`;
    return `
      <section class="ed-sec ed-photo">
        <h3>${esc(I18n.t('e.photo'))}</h3>
        <div class="ed-photo__row" id="ed-photo">${photoHTML(d)}</div>
      </section>

      <section class="ed-sec">
        <h3>${esc(I18n.t('e.names'))}</h3>
        <div class="field" id="ed-f-name">
          ${langInput('name', 'tr', d.tr, { required: true, ph: I18n.t('e.nameTr') })}
          ${langInput('name', 'en', d.en, { ph: I18n.t('e.nameEn') })}
          ${langInput('name', 'ar', d.ar, { ph: I18n.t('e.nameAr') })}
          <p class="field-error" id="ed-err-name" role="alert"></p>
        </div>
      </section>

      <section class="ed-sec">
        <h3 id="ed-cat-label">${esc(I18n.t('e.cat'))}</h3>
        <div class="ed-cats" role="radiogroup" aria-labelledby="ed-cat-label">
          ${cats.map(c => `<label class="ed-chip"><input type="radio" name="ed-cat" value="${c.id}" ${d.cat === c.id ? 'checked' : ''}><span>${esc(I18n.name(c))}</span></label>`).join('')}
        </div>
      </section>

      <section class="ed-sec ed-two">
        <div class="field" id="ed-f-price">
          <label for="ed-price" class="field-label">${esc(I18n.t('e.price'))}</label>
          <div class="ed-price">
            <input id="ed-price" class="input" inputmode="numeric" dir="ltr" autocomplete="off" value="${fmt(d.price)}" placeholder="${esc(I18n.t('price.ask'))}" ${d.sizes ? 'disabled' : ''}>
            <span aria-hidden="true">₺</span>
          </div>
          <p class="ed-hint">${esc(d.sizes ? I18n.t('a.sizes', { s: d.sizes.map(s => s.cm + ' cm ' + fmt(s.price) + ' ₺').join(' · ') }) : I18n.t('e.priceHint'))}</p>
          <p class="field-error" id="ed-err-price" role="alert"></p>
        </div>
        <div class="field">
          <span class="field-label">${esc(I18n.t('e.status'))}</span>
          <label class="toggle"><input type="checkbox" data-flag="soldOut" ${d.soldOut ? 'checked' : ''}><span class="track"></span><span>${esc(I18n.t('e.soldOut'))}</span></label>
          <label class="toggle"><input type="checkbox" data-flag="hidden" ${d.hidden ? 'checked' : ''}><span class="track"></span><span>${esc(I18n.t('e.hidden'))}</span></label>
        </div>
      </section>

      <section class="ed-sec">
        <h3>${esc(I18n.t('e.serving'))}</h3>
        <p class="ed-hint">${esc(I18n.t('e.servingHint'))}</p>
        ${langInput('variant', 'tr', d.variant.tr, { max: 60 })}
        ${langInput('variant', 'en', d.variant.en, { max: 60 })}
        ${langInput('variant', 'ar', d.variant.ar, { max: 60 })}
      </section>

      <section class="ed-sec">
        <h3>${esc(I18n.t('e.desc'))}</h3>
        ${langInput('desc', 'tr', d.desc.tr, { area: true, max: 240 })}
        ${langInput('desc', 'en', d.desc.en, { area: true, max: 240 })}
        ${langInput('desc', 'ar', d.desc.ar, { area: true, max: 240 })}
      </section>

      <section class="ed-sec">
        <h3>${esc(I18n.t('e.tags'))}</h3>
        <div class="ed-cats">${tagChip('veg', 'leaf')}${tagChip('spicy', 'flame')}${tagChip('signature', 'crown')}</div>
      </section>`;
  }

  function render() {
    const panel = $('#editor');
    $('#ed-title').textContent = I18n.t(ed.mode === 'new' ? 'e.new' : 'e.edit');
    $('#ed-badge').textContent = ed.mode === 'edit' && ed.data.custom ? I18n.t('e.newBadge') : (ed.data.edited ? I18n.t('e.edited') : '');
    $('#ed-badge').hidden = !$('#ed-badge').textContent;
    $('#ed-form').innerHTML = formHTML();
    $('#ed-delete').hidden = ed.mode !== 'edit';
    $('#ed-delete span').textContent = I18n.t('e.delete');
    $('#ed-cancel').textContent = I18n.t('e.cancel');
    $('#ed-save span').textContent = I18n.t(ed.mode === 'new' ? 'e.add' : 'e.save');
    $('#ed-close').setAttribute('aria-label', I18n.t('e.close'));
    icons(panel);
  }

  /* ---------- Photo: shrink on this device before saving ---------- */
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let out = c.toDataURL('image/webp', 0.8);
        if (!out.startsWith('data:image/webp')) out = c.toDataURL('image/jpeg', 0.82);
        resolve(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  function refreshPhoto() {
    $('#ed-photo').innerHTML = photoHTML(ed.data);
    icons($('#ed-photo'));
  }

  /* ---------- Open / close ---------- */
  function show() {
    ed.opener = document.activeElement;
    render();
    // The panel is reused for every dish: start each one at the top, not where the last one was left.
    // A hidden panel ignores scrollTop and keeps its old offset, so reset it once it is shown.
    $('#editor').hidden = false;
    $('#ed-form').scrollTop = 0;
    $('#ed-scrim').classList.add('is-open');
    requestAnimationFrame(() => $('#editor').classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    const first = ed.mode === 'new' ? $('#ed-name-tr') : $('#ed-close');
    (first || $('#editor')).focus();
  }

  function hide() {
    const panel = $('#editor');
    panel.classList.remove('is-open');
    $('#ed-scrim').classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!panel.classList.contains('is-open')) panel.hidden = true; }, 320);
    const opener = ed && ed.opener;
    ed = null;
    if (opener && document.contains(opener)) opener.focus();
  }

  function requestClose() {
    if (!ed) return;
    if (!ed.dirty) return hide();
    deps.confirm({
      title: I18n.t('e.leaveTitle'), text: I18n.t('e.leaveText'),
      yes: I18n.t('e.leaveDiscard'), no: I18n.t('e.leaveKeep'),
      onYes: hide
    });
  }

  /* ---------- Save ---------- */
  function save() {
    const d = ed.data;
    let ok = true;
    $('#ed-err-name').textContent = '';
    $('#ed-err-price').textContent = '';
    $('#ed-f-name').classList.remove('has-error');
    $('#ed-f-price').classList.remove('has-error');
    if (!d.tr.trim()) {
      $('#ed-err-name').textContent = I18n.t('e.nameMissing');
      $('#ed-f-name').classList.add('has-error');
      $('#ed-name-tr').focus();
      ok = false;
    }
    const price = d.sizes ? d.price : parsePrice($('#ed-price').value);
    if (Number.isNaN(price)) {
      $('#ed-err-price').textContent = I18n.t('e.priceBad');
      $('#ed-f-price').classList.add('has-error');
      if (ok) $('#ed-price').focus();
      ok = false;
    }
    if (!ok) return;

    const patch = {
      tr: d.tr, en: d.en, ar: d.ar, cat: d.cat, price, photo: d.photo,
      variant: d.variant, desc: d.desc, tags: d.tags, soldOut: d.soldOut, hidden: d.hidden
    };
    if (ed.mode === 'new') {
      const id = Store.add(patch);
      if (!id) return toast(I18n.t('e.full'), 'triangle-alert');
      ed.dirty = false;
      hide();
      toast(I18n.t('e.added', { name: d.tr.trim() }), 'circle-plus');
      window.dispatchEvent(new CustomEvent('dishsaved', { detail: { id } }));
    } else {
      if (!Store.update(ed.id, patch)) return toast(I18n.t('e.full'), 'triangle-alert');
      const id = ed.id;
      ed.dirty = false;
      hide();
      toast(I18n.t('e.saved'));
      window.dispatchEvent(new CustomEvent('dishsaved', { detail: { id } }));
    }
  }

  function trash() {
    const id = ed.id, name = ed.data.tr;
    if (!Store.remove(id)) return;
    ed.dirty = false;
    hide();
    deps.undoToast(I18n.t('e.trashed', { name }), () => Store.restore(id));
  }

  /* ---------- Events ---------- */
  function wire() {
    const form = $('#ed-form');
    form.addEventListener('input', e => {
      const t = e.target;
      if (!ed) return;
      if (t.dataset.group === 'name') ed.data[t.dataset.lang] = t.value;
      else if (t.dataset.group === 'variant' || t.dataset.group === 'desc') ed.data[t.dataset.group][t.dataset.lang] = t.value;
      else if (t.id === 'ed-price') {
        const raw = t.value.replace(/[^\d.,]/g, '');
        if (raw !== t.value) t.value = raw;
      }
      ed.dirty = true;
    });
    form.addEventListener('change', async e => {
      const t = e.target;
      if (!ed) return;
      if (t.name === 'ed-cat') ed.data.cat = t.value;
      else if (t.dataset.tag) ed.data.tags = [...form.querySelectorAll('[data-tag]:checked')].map(x => x.dataset.tag);
      else if (t.dataset.flag) ed.data[t.dataset.flag] = t.checked;
      else if (t.id === 'ed-file' && t.files[0]) {
        const msg = $('#ed-photo-msg');
        msg.textContent = I18n.t('e.photoBusy');
        try {
          ed.data.photo = await shrink(t.files[0]);
          refreshPhoto();
        } catch (err) {
          msg.textContent = I18n.t('e.photoBad');
          return;
        }
      } else return;
      ed.dirty = true;
    });
    form.addEventListener('click', e => {
      if (e.target.closest('[data-ed="remove-photo"]')) {
        ed.data.photo = null;
        ed.dirty = true;
        refreshPhoto();
        $('#ed-file') && $('#ed-photo label[for="ed-file"]').focus();
      }
    });
    form.addEventListener('submit', e => { e.preventDefault(); save(); });
    $('#ed-save').addEventListener('click', save);
    $('#ed-cancel').addEventListener('click', requestClose);
    $('#ed-close').addEventListener('click', requestClose);
    $('#ed-scrim').addEventListener('click', requestClose);
    $('#ed-delete').addEventListener('click', trash);
    $('#editor').addEventListener('keydown', e => {
      if (!ed) return;
      if (e.key === 'Escape' && !document.querySelector('.confirm:not([hidden])')) { e.preventDefault(); requestClose(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); save(); }
      if (e.key !== 'Tab') return;
      const f = [...$('#editor').querySelectorAll('button:not([disabled]):not([hidden]), input:not([disabled]):not(.visually-hidden), textarea, label[for="ed-file"]')]
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    });
    window.addEventListener('langchange', () => { if (ed) render(); });
  }

  window.DishEditor = {
    init(d) { deps = d; wire(); },
    /* draft: unsaved quick changes from the list row (price, sold out, hidden), carried into the editor. */
    open(id, draft) {
      const it = Store.item(id);
      if (!it) return;
      ed = { mode: 'edit', id, data: { ...fromItem(it), ...(draft || {}) }, dirty: !!draft };
      show();
    },
    create(cat) {
      ed = { mode: 'new', id: null, data: blank(cat), dirty: false };
      show();
    },
    isOpen: () => !!ed
  };
})();
