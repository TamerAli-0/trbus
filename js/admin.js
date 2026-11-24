/*
 * Owner menu editor. Edits are kept as a draft until Save, then written through Store.
 * The PIN is a demo placeholder, not security: a real version signs staff in on a server.
 */
(function () {
  const DEMO_PIN = '1234';
  const SESSION = 'tarbus.admin.unlocked';
  const { esc, fold, icons, toast } = UI;

  I18n.add({
    'a.skip': { tr: 'Listeye geç', en: 'Skip to list', ar: 'انتقل إلى القائمة' },
    'a.demo': { tr: 'Demo', en: 'Demo', ar: 'تجريبي' },
    'a.gate.title': { tr: 'Menü yönetimi', en: 'Menu manager', ar: 'إدارة القائمة' },
    'a.gate.lead': {
      tr: 'Fiyatları güncelleyin, biten yemekleri işaretleyin. Değişiklikler QR menüde hemen görünür.',
      en: 'Update prices and mark dishes that have run out. Changes show on the QR menu straight away.',
      ar: 'حدّث الأسعار وحدّد الأطباق التي نفدت. تظهر التغييرات في قائمة QR فوراً.'
    },
    'a.gate.label': { tr: 'Personel PIN kodu', en: 'Staff PIN', ar: 'رمز الموظفين' },
    'a.gate.enter': { tr: 'Giriş', en: 'Sign in', ar: 'دخول' },
    'a.gate.hint': { tr: 'Bu demoda PIN: 1234', en: 'PIN for this demo: 1234', ar: 'رمز هذا العرض: 1234' },
    'a.gate.wrong': { tr: 'PIN yanlış, tekrar deneyin.', en: 'Wrong PIN, try again.', ar: 'الرمز غير صحيح، حاول مرة أخرى.' },
    'a.gate.short': { tr: '4 haneli PIN girin.', en: 'Enter the 4-digit PIN.', ar: 'أدخل الرمز المكوّن من 4 أرقام.' },
    'a.openMenu': { tr: 'QR menüyü aç', en: 'Open QR menu', ar: 'افتح قائمة QR' },
    'a.more': { tr: 'Diğer işlemler', en: 'More actions', ar: 'إجراءات أخرى' },
    'a.export': { tr: 'Değişiklikleri dışa aktar', en: 'Export changes', ar: 'تصدير التغييرات' },
    'a.import': { tr: 'Dosyadan yükle', en: 'Load from file', ar: 'تحميل من ملف' },
    'a.reset': { tr: 'Orijinal menüye dön', en: 'Back to original menu', ar: 'العودة إلى القائمة الأصلية' },
    'a.lock': { tr: 'Kilitle', en: 'Lock', ar: 'قفل' },
    'a.notice': {
      tr: 'Bu bir demo: değişiklikler yalnızca bu tarayıcıda saklanır. Gerçek sürümde fiyatlar internette kaydedilir ve tüm misafirlerin telefonunda anında güncellenir.',
      en: 'This is a demo: changes are kept in this browser only. In the real version prices are saved online and update on every guest’s phone at once.',
      ar: 'هذا عرض تجريبي: تُحفظ التغييرات في هذا المتصفح فقط. في النسخة الحقيقية تُحفظ الأسعار على الإنترنت وتتحدّث فوراً على هاتف كل ضيف.'
    },
    'a.s.all': { tr: 'ürün menüde', en: 'items on the menu', ar: 'صنفاً في القائمة' },
    'a.s.missing': { tr: 'fiyatı eksik', en: 'without a price', ar: 'بلا سعر' },
    'a.s.soldout': { tr: 'bugün tükendi', en: 'sold out today', ar: 'نفد اليوم' },
    'a.s.hidden': { tr: 'menüden gizli', en: 'hidden from guests', ar: 'مخفي عن الضيوف' },
    'a.search': { tr: 'Ürün ara', en: 'Search items', ar: 'ابحث عن صنف' },
    'a.filter': { tr: 'Filtre', en: 'Filter', ar: 'تصفية' },
    'a.cats': { tr: 'Kategoriler', en: 'Categories', ar: 'الفئات' },
    'a.f.all': { tr: 'Tümü', en: 'All', ar: 'الكل' },
    'a.f.missing': { tr: 'Fiyatı eksik', en: 'Missing price', ar: 'بلا سعر' },
    'a.f.soldout': { tr: 'Tükendi', en: 'Sold out', ar: 'نفد' },
    'a.f.hidden': { tr: 'Gizli', en: 'Hidden', ar: 'مخفي' },
    'a.f.changed': { tr: 'Kaydedilmedi', en: 'Unsaved', ar: 'غير محفوظ' },
    'a.allCats': { tr: 'Tüm kategoriler', en: 'All categories', ar: 'كل الفئات' },
    'a.soldOut': { tr: 'Tükendi', en: 'Sold out', ar: 'نفد' },
    'a.hide': { tr: 'Gizle', en: 'Hide', ar: 'إخفاء' },
    'a.priceFor': { tr: '{name} fiyatı', en: 'Price of {name}', ar: 'سعر {name}' },
    'a.was': { tr: 'önce: {p}', en: 'was {p}', ar: 'كان {p}' },
    'a.wasAsk': { tr: 'önce: boş', en: 'was empty', ar: 'كان فارغاً' },
    'a.undo': { tr: 'Bu satırı geri al', en: 'Undo this row', ar: 'تراجع عن هذا السطر' },
    'a.bad': { tr: 'Geçerli bir fiyat girin', en: 'Enter a valid price', ar: 'أدخل سعراً صحيحاً' },
    'a.sizes': { tr: 'Boy fiyatları: {s}', en: 'Size prices: {s}', ar: 'أسعار الأطوال: {s}' },
    'a.unsaved.1': { tr: '1 kaydedilmemiş değişiklik', en: '1 unsaved change', ar: 'تغيير واحد غير محفوظ' },
    'a.unsaved.n': { tr: '{n} kaydedilmemiş değişiklik', en: '{n} unsaved changes', ar: { two: 'تغييران غير محفوظين', few: '{n} تغييرات غير محفوظة', many: '{n} تغييراً غير محفوظ', other: '{n} تغيير غير محفوظ' } },
    'a.discard': { tr: 'Vazgeç', en: 'Discard', ar: 'تجاهل' },
    'a.save': { tr: 'Kaydet', en: 'Save', ar: 'حفظ' },
    'a.saved': { tr: 'Kaydedildi, QR menü güncellendi', en: 'Saved, the QR menu is updated', ar: 'تم الحفظ وتحدّثت قائمة QR' },
    'a.savedAt': { tr: 'Son kayıt: {t}', en: 'Last saved {t}', ar: 'آخر حفظ: {t}' },
    'a.neverSaved': { tr: 'Henüz değişiklik yok', en: 'No changes yet', ar: 'لا توجد تغييرات بعد' },
    'a.empty.title': { tr: 'Burada bir şey yok', en: 'Nothing here', ar: 'لا شيء هنا' },
    'a.empty.missing': { tr: 'Tüm ürünlerin fiyatı girilmiş.', en: 'Every item has a price.', ar: 'كل الأصناف لها سعر.' },
    'a.empty.other': { tr: 'Aramayı ya da filtreyi değiştirin.', en: 'Try another search or filter.', ar: 'جرّب بحثاً أو تصفية أخرى.' },
    'a.reset.title': { tr: 'Orijinal menüye dönülsün mü?', en: 'Go back to the original menu?', ar: 'العودة إلى القائمة الأصلية؟' },
    'a.reset.text': {
      tr: 'Kaydedilen tüm fiyat, tükendi ve gizli değişiklikleri silinir. Önce dışa aktararak yedek alabilirsiniz.',
      en: 'All saved price, sold-out and hidden changes will be removed. You can export them first to keep a copy.',
      ar: 'ستُحذف كل تغييرات الأسعار والأصناف النافدة والمخفية. يمكنك تصديرها أولاً للاحتفاظ بنسخة.'
    },
    'a.reset.yes': { tr: 'Evet, sıfırla', en: 'Yes, reset', ar: 'نعم، أعد الضبط' },
    'a.cancel': { tr: 'Vazgeç', en: 'Cancel', ar: 'إلغاء' },
    'a.reset.done': { tr: 'Orijinal menü geri yüklendi', en: 'Original menu restored', ar: 'تمت استعادة القائمة الأصلية' },
    'a.exported': { tr: 'Dosya indirildi', en: 'File downloaded', ar: 'تم تنزيل الملف' },
    'a.imported': { tr: '{n} ürün dosyadan yüklendi', en: { one: '{n} item loaded from file', other: '{n} items loaded from file' },
      ar: { one: 'تم تحميل صنف واحد من الملف', two: 'تم تحميل صنفين من الملف', few: 'تم تحميل {n} أصناف من الملف', many: 'تم تحميل {n} صنفاً من الملف', other: 'تم تحميل {n} صنف من الملف' } },
    'a.importBad': { tr: 'Bu dosya bir Tarbuş menü dosyası değil', en: 'That file is not a Tarbuş menu file', ar: 'هذا الملف ليس ملف قائمة Tarbuş' },
    'a.leave.title': { tr: 'Kaydedilmemiş değişiklikler var', en: 'You have unsaved changes', ar: 'لديك تغييرات غير محفوظة' },
    'a.leave.text': { tr: 'Kilitlemeden önce kaydetmek ister misiniz?', en: 'Save them before locking?', ar: 'هل تريد حفظها قبل القفل؟' },
    'a.leave.discard': { tr: 'Kaydetmeden kilitle', en: 'Lock without saving', ar: 'قفل دون حفظ' },
    'a.trash': { tr: 'Çöp kutusu', en: 'Trash', ar: 'سلة المحذوفات' },
    'a.addDish': { tr: 'Yeni yemek', en: 'New dish', ar: 'طبق جديد' },
    'a.trashNote': { tr: 'Buradaki yemekler misafirlere görünmez. Geri yükleyebilir ya da kalıcı silebilirsiniz.', en: 'Dishes here are hidden from guests. Restore them, or delete them for good.', ar: 'الأطباق هنا مخفية عن الضيوف. يمكنك استعادتها أو حذفها نهائياً.' },
    'a.trashEmpty': { tr: 'Çöp kutusu boş', en: 'The trash is empty', ar: 'سلة المحذوفات فارغة' },
    'a.trashEmptySub': { tr: 'Silinen yemekler buraya gelir ve geri yüklenebilir.', en: 'Deleted dishes land here and can be restored.', ar: 'تنتقل الأطباق المحذوفة إلى هنا ويمكن استعادتها.' },
    'a.back': { tr: 'Menüye dön', en: 'Back to menu', ar: 'العودة إلى القائمة' },
    'a.restore': { tr: 'Geri yükle', en: 'Restore', ar: 'استعادة' },
    'a.purge': { tr: 'Kalıcı sil', en: 'Delete for good', ar: 'حذف نهائي' },
    'a.purgeTitle': { tr: '{name} kalıcı silinsin mi?', en: 'Delete {name} for good?', ar: 'حذف {name} نهائياً؟' },
    'a.purgeText': { tr: 'Bu işlem geri alınamaz.', en: 'This cannot be undone.', ar: 'لا يمكن التراجع عن هذا.' },
    'a.purgeYes': { tr: 'Evet, kalıcı sil', en: 'Yes, delete for good', ar: 'نعم، احذف نهائياً' },
    'a.emptyTrash': { tr: 'Çöp kutusunu boşalt', en: 'Empty trash', ar: 'إفراغ السلة' },
    'a.emptyTitle': { tr: 'Çöp kutusu boşaltılsın mı?', en: 'Empty the trash?', ar: 'إفراغ سلة المحذوفات؟' },
    'a.emptyText': { tr: '{n} yemek kalıcı olarak silinecek. Bu işlem geri alınamaz.', en: { one: '1 dish will be deleted for good. This cannot be undone.', other: '{n} dishes will be deleted for good. This cannot be undone.' },
      ar: { one: 'سيُحذف طبق واحد نهائياً. لا يمكن التراجع عن هذا.', two: 'سيُحذف طبقان نهائياً. لا يمكن التراجع عن هذا.', few: 'ستُحذف {n} أطباق نهائياً. لا يمكن التراجع عن هذا.', many: 'سيُحذف {n} طبقاً نهائياً. لا يمكن التراجع عن هذا.', other: 'سيُحذف {n} طبق نهائياً. لا يمكن التراجع عن هذا.' } },
    'a.deletedAt': { tr: 'silindi: {t}', en: 'deleted {t}', ar: 'حُذف: {t}' },
    'a.restored': { tr: '{name} menüye geri döndü', en: '{name} is back on the menu', ar: 'عاد {name} إلى القائمة' },
    'a.purged': { tr: 'Kalıcı olarak silindi', en: 'Deleted for good', ar: 'حُذف نهائياً' },
    'a.undoAction': { tr: 'Geri al', en: 'Undo', ar: 'تراجع' },
    'a.editNamed': { tr: '{name} düzenle', en: 'Edit {name}', ar: 'تعديل {name}' },
    'a.leave.save': { tr: 'Kaydet ve kilitle', en: 'Save and lock', ar: 'احفظ واقفل' }
  });

  const $ = s => document.querySelector(s);
  const cats = window.TARBUS.categories;
  const catById = Object.fromEntries(cats.map(c => [c.id, c]));

  const state = { draft: {}, filter: 'all', cat: 'all', q: '', view: 'menu' };

  /* ---------- PIN gate ---------- */
  const gate = $('#gate'), app = $('#app');
  const pinForm = $('#pin-form');
  const boxes = [...pinForm.querySelectorAll('.pin-box')];

  I18n.mountSwitcher($('#gate-lang'));
  I18n.mountSwitcher($('#app-lang'));

  function unlocked() {
    try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; }
  }

  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      // Several digits at once come from fast typing, paste or a phone's code autofill: spread them over the boxes.
      const digits = b.value.replace(/\D/g, '');
      pinForm.classList.remove('is-wrong');
      $('#pin-error').textContent = '';
      if (digits.length > 1) {
        [...digits].slice(0, boxes.length - i).forEach((d, k) => { boxes[i + k].value = d; boxes[i + k].classList.add('is-filled'); });
        (boxes[Math.min(i + digits.length, boxes.length - 1)]).focus();
      } else {
        b.value = digits;
        b.classList.toggle('is-filled', !!b.value);
        if (b.value && i < boxes.length - 1) boxes[i + 1].focus();
      }
      if (boxes.every(x => x.value)) pinForm.requestSubmit();
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; boxes[i - 1].classList.remove('is-filled'); }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
    });
    b.addEventListener('paste', e => {
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
      if (!digits) return;
      e.preventDefault();
      boxes.forEach((x, j) => { x.value = digits[j] || ''; x.classList.toggle('is-filled', !!x.value); });
      (boxes[digits.length] || boxes[3]).focus();
      if (digits.length === 4) pinForm.requestSubmit();
    });
  });

  pinForm.addEventListener('submit', e => {
    e.preventDefault();
    const pin = boxes.map(b => b.value).join('');
    if (pin.length < 4) { $('#pin-error').textContent = I18n.t('a.gate.short'); boxes[pin.length].focus(); return; }
    if (pin !== DEMO_PIN) {
      pinForm.classList.remove('is-wrong'); void pinForm.offsetWidth; pinForm.classList.add('is-wrong');
      $('#pin-error').textContent = I18n.t('a.gate.wrong');
      boxes.forEach(b => { b.value = ''; b.classList.remove('is-filled'); });
      boxes[0].focus();
      return;
    }
    try { sessionStorage.setItem(SESSION, '1'); } catch (err) { /* ignore */ }
    openApp();
  });

  function openApp() {
    gate.hidden = true;
    app.hidden = false;
    renderAll();
    $('#q').focus({ preventScroll: true });
  }

  function lock() {
    try { sessionStorage.removeItem(SESSION); } catch (e) { /* ignore */ }
    state.draft = {};
    app.hidden = true;
    gate.hidden = false;
    boxes.forEach(b => { b.value = ''; b.classList.remove('is-filled'); });
    boxes[0].focus();
  }

  /* ---------- Data ---------- */
  function rows() {
    return Store.items().map(it => {
      const d = state.draft[it.id];
      if (!d) return it;
      return { ...it, ...d, saved: { price: it.price, soldOut: it.soldOut, hidden: it.hidden } };
    });
  }

  function isMissing(it) { return it.price == null && !it.sizes; }

  function matches(it) {
    if (state.cat !== 'all' && it.cat !== state.cat) return false;
    if (state.filter === 'missing' && !isMissing(it)) return false;
    if (state.filter === 'soldout' && !it.soldOut) return false;
    if (state.filter === 'hidden' && !it.hidden) return false;
    if (state.filter === 'changed' && !state.draft[it.id]) return false;
    if (state.q) {
      const hay = fold([it.tr, it.en, it.ar, it.size, catById[it.cat].tr, catById[it.cat].en].join(' '));
      if (!state.q.split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }

  function setDraft(id, patch) {
    const saved = Store.item(id);
    const next = { ...(state.draft[id] || {}), ...patch };
    for (const k of Object.keys(next)) if (next[k] === saved[k]) delete next[k];
    if (Object.keys(next).length) state.draft[id] = next; else delete state.draft[id];
  }

  function parsePrice(s) {
    const t = String(s).trim().replace(/[₺\s]/g, '').replace(/\./g, '').replace(',', '.');
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 && n < 1000000 ? Math.round(n) : NaN;
  }

  const fmt = n => (n == null ? '' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));

  /* ---------- Render ---------- */
  function renderAll() {
    renderStats();
    renderCats();
    renderList();
    renderSaveBar();
    renderSavedAt();
  }

  function renderStats() {
    const all = rows();
    $('#s-all').textContent = all.filter(i => !i.hidden).length;
    $('#s-missing').textContent = all.filter(isMissing).length;
    $('#s-soldout').textContent = all.filter(i => i.soldOut).length;
    $('#s-hidden').textContent = all.filter(i => i.hidden).length;
    const tn = Store.trash().length;
    $('#trash-n').textContent = tn;
    $('#trash-n').hidden = !tn;
    document.querySelectorAll('.stat').forEach(s => s.classList.toggle('is-active', s.dataset.filter === state.filter && state.filter !== 'all'));
    document.querySelectorAll('#filters .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === state.filter)));
  }

  function renderCats() {
    const all = rows();
    const btn = (id, label, n, warn) =>
      `<button type="button" data-cat="${id}" aria-pressed="${state.cat === id}">${esc(label)} <span class="n">${n}</span>${warn ? '<span class="warn-dot" aria-hidden="true"></span>' : ''}</button>`;
    $('#cats').innerHTML = btn('all', I18n.t('a.allCats'), all.length, false) +
      cats.map(c => {
        const inCat = all.filter(i => i.cat === c.id);
        return btn(c.id, I18n.name(c), inCat.length, inCat.some(isMissing));
      }).join('');
  }

  function rowHTML(it) {
    const changed = !!state.draft[it.id];
    const name = it.size ? `${it.tr} · ${it.size}` : it.tr;
    const sub = [I18n.sub(it), it.variant ? I18n.name(it.variant) : ''].filter(Boolean).join(' · ');
    const drinkIcon = { mesrubatlar: 'cup-soda' }[it.cat];
    const thumb = it.photo
      ? `<img src="${esc(it.photo)}" alt="" loading="lazy" width="64" height="64">`
      : drinkIcon
        ? `<i data-lucide="${drinkIcon}" aria-hidden="true"></i>`
        : `<span aria-hidden="true">${esc(it.tr.replace(/^\d+\s*/, '').charAt(0))}</span>`;
    let was = '';
    if (changed && 'price' in state.draft[it.id]) {
      was = it.saved.price == null ? I18n.t('a.wasAsk') : I18n.t('a.was', { p: fmt(it.saved.price) + ' ₺' });
    }
    const sizes = it.sizes ? `<span class="tag tag-signature">${esc(I18n.t('a.sizes', { s: it.sizes.map(s => s.cm + ' cm ' + fmt(s.price) + ' ₺').join(' · ') }))}</span>` : '';
    return `
      <div class="row${changed ? ' is-changed' : ''}${it.hidden ? ' is-hidden' : ''}" data-id="${esc(it.id)}">
        <button type="button" class="thumb" data-act="edit" tabindex="-1" aria-hidden="true">${thumb}</button>
        <button type="button" class="row-name" data-act="edit" aria-label="${esc(I18n.t('a.editNamed', { name }))}">
          <strong lang="tr">${esc(name)}<i data-lucide="pencil" class="row-name__pen" aria-hidden="true"></i></strong>
          ${sub ? `<span class="sub">${esc(sub)}</span>` : ''}
          ${sizes || it.custom || it.edited ? `<span class="flags">${sizes}${it.custom ? `<span class="tag tag-new">${esc(I18n.t('e.newBadge'))}</span>` : it.edited ? `<span class="tag">${esc(I18n.t('e.edited'))}</span>` : ''}</span>` : ''}
        </button>
        <div class="price-field${it.price == null ? ' is-empty' : ''}">
          <input type="text" inputmode="numeric" dir="ltr" autocomplete="off"
            value="${fmt(it.price)}" placeholder="${esc(I18n.t('price.ask'))}"
            aria-label="${esc(I18n.t('a.priceFor', { name }))}" data-field="price">
          <span class="cur" aria-hidden="true">₺</span>
          ${was ? `<span class="was">${esc(was)}</span>` : ''}
        </div>
        <label class="toggle t-sold">
          <input type="checkbox" data-field="soldOut" ${it.soldOut ? 'checked' : ''}>
          <span class="track"></span><span class="lbl">${esc(I18n.t('a.soldOut'))}</span>
        </label>
        <label class="toggle t-hide">
          <input type="checkbox" data-field="hidden" ${it.hidden ? 'checked' : ''}>
          <span class="track"></span><span class="lbl">${esc(I18n.t('a.hide'))}</span>
        </label>
        <button type="button" class="icon-btn undo" data-act="undo" aria-label="${esc(I18n.t('a.undo'))}" title="${esc(I18n.t('a.undo'))}"><i data-lucide="undo-2"></i></button>
      </div>`;
  }

  function renderTrash() {
    const list = $('#list');
    const items = Store.trash();
    const when = t => new Date(t).toLocaleString(I18n.locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const head = `<div class="trash-head">
        <div><h2 class="display">${esc(I18n.t('a.trash'))} <span class="n">${items.length}</span></h2><p>${esc(I18n.t('a.trashNote'))}</p></div>
        <div class="trash-head__actions">
          <button type="button" class="btn btn-ghost btn-sm" data-act="back"><i data-lucide="arrow-left"></i>${esc(I18n.t('a.back'))}</button>
          ${items.length ? `<button type="button" class="btn btn-quiet btn-sm danger" data-act="empty-trash"><i data-lucide="trash"></i>${esc(I18n.t('a.emptyTrash'))}</button>` : ''}
        </div>
      </div>`;
    if (!items.length) {
      list.innerHTML = head + `<div class="empty"><i data-lucide="trash-2"></i><strong>${esc(I18n.t('a.trashEmpty'))}</strong><p>${esc(I18n.t('a.trashEmptySub'))}</p></div>`;
      icons(list);
      return;
    }
    list.innerHTML = head + `<div class="trash-list">${items.map(it => `
      <div class="trow" data-id="${esc(it.id)}">
        <div class="thumb">${it.photo ? `<img src="${esc(it.photo)}" alt="" loading="lazy">` : `<span aria-hidden="true">${esc(it.tr.charAt(0))}</span>`}</div>
        <div class="row-name is-static">
          <strong lang="tr">${esc(it.tr)}</strong>
          <span class="sub">${esc(I18n.name(catById[it.cat]))} · ${esc(I18n.t('a.deletedAt', { t: when(it.deletedAt) }))}</span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-act="restore"><i data-lucide="rotate-ccw"></i>${esc(I18n.t('a.restore'))}</button>
        <button type="button" class="btn btn-quiet btn-sm danger" data-act="purge"><i data-lucide="x"></i>${esc(I18n.t('a.purge'))}</button>
      </div>`).join('')}</div>`;
    icons(list);
  }

  function renderList() {
    const list = $('#list');
    document.body.classList.toggle('is-trash', state.view === 'trash');
    $('#trash-btn').setAttribute('aria-pressed', String(state.view === 'trash'));
    if (state.view === 'trash') return renderTrash();
    const shown = rows().filter(matches);
    if (!shown.length) {
      list.innerHTML = `<div class="empty"><i data-lucide="${state.filter === 'missing' ? 'circle-check' : 'search-x'}"></i>
        <strong>${esc(I18n.t('a.empty.title'))}</strong>
        <p>${esc(I18n.t(state.filter === 'missing' && !state.q ? 'a.empty.missing' : 'a.empty.other'))}</p></div>`;
      icons(list);
      return;
    }
    list.innerHTML = cats.map(c => {
      const inCat = shown.filter(i => i.cat === c.id);
      if (!inCat.length) return '';
      return `<section class="group" aria-labelledby="g-${c.id}">
        <h2 id="g-${c.id}">${esc(I18n.name(c))} <span class="n">${inCat.length}</span></h2>
        ${inCat.map(rowHTML).join('')}
      </section>`;
    }).join('');
    icons(list);
  }

  /* Rebuilds a row (undo, language). Never while its price field is being typed in: see syncRow. */
  function refreshRow(id) {
    const el = document.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
    if (!el || !el.isConnected) return;
    const it = rows().find(r => r.id === id);
    const tmp = document.createElement('div');
    tmp.innerHTML = rowHTML(it).trim();
    const fresh = tmp.firstElementChild;
    el.replaceWith(fresh);
    icons(fresh);
  }

  /* Updates a row's marks in place, so the field being typed in keeps focus and caret. */
  function syncRow(row) {
    const id = row.dataset.id;
    const it = rows().find(r => r.id === id);
    const d = state.draft[id];
    row.classList.toggle('is-changed', !!d);
    row.classList.toggle('is-hidden', !!it.hidden);
    const field = row.querySelector('.price-field');
    field.classList.toggle('is-empty', it.price == null);
    let was = field.querySelector('.was');
    const text = d && 'price' in d
      ? (it.saved.price == null ? I18n.t('a.wasAsk') : I18n.t('a.was', { p: fmt(it.saved.price) + ' ₺' }))
      : '';
    if (text && !was) { was = document.createElement('span'); was.className = 'was'; field.appendChild(was); }
    if (was) { if (text) was.textContent = text; else was.remove(); }
  }

  function renderSaveBar() {
    const n = Object.keys(state.draft).length;
    const bar = $('#savebar');
    bar.classList.toggle('is-shown', n > 0);
    bar.setAttribute('aria-hidden', String(n === 0));
    bar.querySelectorAll('button').forEach(b => { b.tabIndex = n ? 0 : -1; });
    $('#savebar-count').textContent = n === 1 ? I18n.t('a.unsaved.1') : I18n.t('a.unsaved.n', { n });
  }

  function renderSavedAt() {
    const at = Store.updatedAt();
    $('#saved-at').textContent = at
      ? I18n.t('a.savedAt', { t: new Date(at).toLocaleString(I18n.locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) })
      : I18n.t('a.neverSaved');
  }

  /* ---------- Events ---------- */
  $('#list').addEventListener('input', e => {
    const input = e.target.closest('input[data-field="price"]');
    if (!input) return;
    const id = input.closest('.row').dataset.id;
    const field = input.closest('.price-field');
    const raw = input.value.replace(/[^\d.,]/g, '');
    if (raw !== input.value) input.value = raw;
    const p = parsePrice(raw);
    field.classList.toggle('is-bad', Number.isNaN(p));
    if (Number.isNaN(p)) { input.setAttribute('aria-invalid', 'true'); input.title = I18n.t('a.bad'); return; }
    input.removeAttribute('aria-invalid'); input.removeAttribute('title');
    setDraft(id, { price: p });
    syncRow(input.closest('.row'));
    renderSaveBar();
    renderStats();
  });

  $('#list').addEventListener('focusout', e => {
    const input = e.target.closest('input[data-field="price"]');
    if (!input) return;
    const p = parsePrice(input.value);
    if (!Number.isNaN(p)) input.value = fmt(p);
  });

  $('#list').addEventListener('keydown', e => {
    const input = e.target.closest('input[data-field="price"]');
    if (!input || e.key !== 'Enter') return;
    e.preventDefault();
    const all = [...document.querySelectorAll('#list input[data-field="price"]')];
    const next = all[all.indexOf(input) + (e.shiftKey ? -1 : 1)];
    if (next) { next.focus(); next.select(); }
  });

  $('#list').addEventListener('change', e => {
    const box = e.target.closest('input[type="checkbox"][data-field]');
    if (!box) return;
    const id = box.closest('.row').dataset.id;
    setDraft(id, { [box.dataset.field]: box.checked });
    syncRow(box.closest('.row'));
    renderSaveBar();
    renderStats();
    renderCats();
  });

  $('#list').addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    const row = e.target.closest('.row, .trow');
    const id = row && row.dataset.id;
    if (act && act.dataset.act === 'edit') return DishEditor.open(id, state.draft[id]);
    if (act && act.dataset.act === 'back') { state.view = 'menu'; return renderAll(); }
    if (act && act.dataset.act === 'restore') {
      const it = Store.trash().find(x => x.id === id);
      if (Store.restore(id)) toast(I18n.t('a.restored', { name: it ? it.tr : '' }), 'rotate-ccw');
      return renderAll();
    }
    if (act && act.dataset.act === 'purge') {
      const it = Store.trash().find(x => x.id === id);
      return confirmBox({
        title: I18n.t('a.purgeTitle', { name: it ? it.tr : '' }), text: I18n.t('a.purgeText'),
        yes: I18n.t('a.purgeYes'), no: I18n.t('a.cancel'),
        onYes: () => { Store.purge(id); renderAll(); toast(I18n.t('a.purged'), 'trash-2'); }
      });
    }
    if (act && act.dataset.act === 'empty-trash') {
      const items = Store.trash();
      return confirmBox({
        title: I18n.t('a.emptyTitle'), text: I18n.t('a.emptyText', { n: items.length }),
        yes: I18n.t('a.purgeYes'), no: I18n.t('a.cancel'),
        onYes: () => { items.forEach(it => Store.purge(it.id)); renderAll(); toast(I18n.t('a.purged'), 'trash-2'); }
      });
    }
    const undo = e.target.closest('[data-act="undo"]');
    if (!undo) return;
    delete state.draft[id];
    refreshRow(id);
    renderSaveBar();
    renderStats();
    renderCats();
  });

  $('#q').addEventListener('input', e => {
    state.q = fold(e.target.value.trim());
    renderList();
  });

  function setFilter(f) {
    state.filter = f;
    renderStats();
    renderList();
  }
  $('#filters').addEventListener('click', e => { const c = e.target.closest('[data-filter]'); if (c) setFilter(c.dataset.filter); });
  document.querySelector('.stats').addEventListener('click', e => {
    const s = e.target.closest('[data-filter]');
    if (!s) return;
    setFilter(s.dataset.filter === state.filter ? 'all' : s.dataset.filter);
    $('#list').scrollIntoView({ behavior: UI.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  });
  $('#cats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.dataset.cat;
    renderCats();
    renderList();
  });

  function save() {
    const n = Object.keys(state.draft).length;
    if (!n) return;
    Store.setMany(state.draft);
    state.draft = {};
    renderAll();
    toast(I18n.t('a.saved'));
  }
  $('#save').addEventListener('click', save);
  $('#discard').addEventListener('click', () => { state.draft = {}; renderAll(); });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !app.hidden) { e.preventDefault(); save(); }
  });

  /* More menu */
  const moreBtn = $('#more-btn'), moreMenu = $('#more-menu');
  function closeMore() { moreMenu.hidden = true; moreBtn.setAttribute('aria-expanded', 'false'); }
  moreBtn.addEventListener('click', () => {
    const open = moreMenu.hidden;
    moreMenu.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
    if (open) moreMenu.querySelector('button').focus();
  });
  document.addEventListener('click', e => { if (!e.target.closest('.more')) closeMore(); });
  moreMenu.addEventListener('keydown', e => {
    const items = [...moreMenu.querySelectorAll('button')];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === 'Escape') { closeMore(); moreBtn.focus(); }
  });
  moreMenu.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    closeMore();
    ({ export: doExport, import: () => $('#import-file').click(), reset: askReset, lock: askLock })[b.dataset.act]();
  });

  function doExport() {
    const blob = new Blob([Store.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tarbus-menu-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(I18n.t('a.exported'), 'download');
  }

  $('#import-file').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const n = Store.import(await f.text());
      state.draft = {};
      renderAll();
      toast(I18n.t('a.imported', { n }), 'upload');
    } catch (err) {
      toast(I18n.t('a.importBad'), 'triangle-alert');
    }
  });

  /* In-page confirm */
  let lastFocus = null;
  function confirmBox({ title, text, yes, no, onYes, onNo }) {
    lastFocus = document.activeElement;
    $('#confirm-title').textContent = title;
    $('#confirm-text').textContent = text;
    $('#confirm-yes').textContent = yes;
    $('#confirm-no').textContent = no;
    $('#confirm').hidden = false;
    $('#scrim').classList.add('is-open');
    $('#confirm-no').focus();
    const close = () => {
      $('#confirm').hidden = true;
      $('#scrim').classList.remove('is-open');
      $('#confirm-yes').onclick = $('#confirm-no').onclick = $('#scrim').onclick = null;
      if (lastFocus && document.contains(lastFocus) && !app.hidden) lastFocus.focus();
    };
    $('#confirm-yes').onclick = () => { close(); onYes(); };
    $('#confirm-no').onclick = () => { close(); onNo && onNo(); };
    $('#scrim').onclick = close;
  }
  $('#confirm').addEventListener('keydown', e => {
    if (e.key === 'Escape') $('#scrim').onclick && $('#scrim').onclick();
    if (e.key === 'Tab') {
      const f = [$('#confirm-no'), $('#confirm-yes')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + 2) % 2].focus();
    }
  });

  function askReset() {
    confirmBox({
      title: I18n.t('a.reset.title'), text: I18n.t('a.reset.text'),
      yes: I18n.t('a.reset.yes'), no: I18n.t('a.cancel'),
      onYes: () => { Store.reset(); state.draft = {}; renderAll(); toast(I18n.t('a.reset.done'), 'rotate-ccw'); }
    });
  }

  function askLock() {
    if (!Object.keys(state.draft).length) return lock();
    confirmBox({
      title: I18n.t('a.leave.title'), text: I18n.t('a.leave.text'),
      yes: I18n.t('a.leave.save'), no: I18n.t('a.leave.discard'),
      onYes: () => { save(); lock(); }, onNo: lock
    });
  }

  /* Toast with an Undo button, for moves that are easy to regret */
  function undoToast(text, onUndo) {
    let host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast toast--action';
    el.innerHTML = `<i data-lucide="trash-2"></i><span></span><button type="button">${esc(I18n.t('a.undoAction'))}</button>`;
    el.querySelector('span').textContent = text;
    host.appendChild(el);
    icons(el);
    const leave = () => { el.classList.add('is-leaving'); el.addEventListener('animationend', () => el.remove(), { once: true }); };
    const timer = setTimeout(leave, 6000);
    el.querySelector('button').addEventListener('click', () => { clearTimeout(timer); onUndo(); leave(); renderAll(); });
  }

  DishEditor.init({ confirm: confirmBox, undoToast });
  $('#add-dish').addEventListener('click', () => {
    state.view = 'menu';
    DishEditor.create(state.cat !== 'all' ? state.cat : 'meze');
  });
  $('#trash-btn').addEventListener('click', () => {
    state.view = state.view === 'trash' ? 'menu' : 'trash';
    renderAll();
  });
  window.addEventListener('dishsaved', e => {
    const id = e.detail.id;
    delete state.draft[id];
    renderAll();
    const row = document.querySelector(`.row[data-id="${CSS.escape(id)}"]`);
    if (row) {
      row.scrollIntoView({ block: 'center', behavior: UI.reducedMotion() ? 'auto' : 'smooth' });
      row.classList.add('is-flash');
      setTimeout(() => row.classList.remove('is-flash'), 1600);
    }
  });

  /* Live: language and saves from another tab */
  window.addEventListener('langchange', () => { if (!app.hidden) renderAll(); });
  window.addEventListener('menuchange', () => {
    if (app.hidden) return;
    renderStats(); renderCats(); renderSavedAt();
    if (!document.activeElement || !document.activeElement.closest('#list')) renderList();
  });

  icons();
  if (unlocked()) openApp();
  else boxes[0].focus();
})();
