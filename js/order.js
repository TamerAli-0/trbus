/*
 * The guest's dish list ("Listem"), shared by the menu and the homepage.
 * Kept in this browser so it survives a reload; sent as a WhatsApp message to TARBUS.info.phone.
 * Load after store.js and i18n.js. Fires 'orderchange' on window.
 */
(function () {
  const KEY = 'tarbus.order';

  I18n.add({
    'order.title': { tr: 'Listem', en: 'My list', ar: 'قائمتي' },
    'order.add': { tr: 'Listeme ekle', en: 'Add to my list', ar: 'أضف إلى قائمتي' },
    'order.addShort': { tr: 'Ekle', en: 'Add', ar: 'أضف' },
    'order.addNamed': { tr: '{name} listeye ekle', en: 'Add {name} to my list', ar: 'أضف {name} إلى القائمة' },
    'order.added': { tr: 'Listene eklendi', en: 'Added to your list', ar: 'أضيف إلى قائمتك' },
    'order.inList': { tr: 'Listende {n}', en: '{n} in your list', ar: '{n} في قائمتك' },
    'order.view': { tr: 'Listeyi gör', en: 'View list', ar: 'عرض القائمة' },
    'order.count.1': { tr: '1 ürün', en: '1 item', ar: 'صنف واحد' },
    'order.count.n': { tr: '{n} ürün', en: '{n} items', ar: { zero: 'لا أصناف', one: 'صنف واحد', two: 'صنفان', few: '{n} أصناف', many: '{n} صنفاً', other: '{n} صنف' } },
    'order.empty': { tr: 'Listeniz boş', en: 'Your list is empty', ar: 'قائمتك فارغة' },
    'order.emptySub': { tr: 'Menüden istediğiniz yemekleri + ile ekleyin, sonra tek dokunuşla WhatsApp’tan gönderin.', en: 'Add what you want from the menu with +, then send it on WhatsApp in one tap.', ar: 'أضف ما تريده من القائمة بزر +، ثم أرسله عبر واتساب بلمسة واحدة.' },
    'order.table': { tr: 'Masa numarası', en: 'Table number', ar: 'رقم الطاولة' },
    'order.tablePh': { tr: 'Örn. 12', en: 'e.g. 12', ar: 'مثلاً 12' },
    'order.note': { tr: 'Not', en: 'Note', ar: 'ملاحظة' },
    'order.notePh': { tr: 'Az acılı, soğansız…', en: 'Less spicy, no onion…', ar: 'حار قليلاً، بدون بصل…' },
    'order.total': { tr: 'Toplam', en: 'Total', ar: 'المجموع' },
    'order.plusAsk.1': { tr: '+ fiyatı sorulacak 1 ürün', en: '+ 1 item priced by the waiter', ar: '+ صنف واحد يحدّد سعره النادل' },
    'order.plusAsk.n': { tr: '+ fiyatı sorulacak {n} ürün', en: '+ {n} items priced by the waiter', ar: { two: '+ صنفان يحدّد سعرهما النادل', few: '+ {n} أصناف يحدّد سعرها النادل', many: '+ {n} صنفاً يحدّد سعرها النادل', other: '+ {n} صنف يحدّد سعرها النادل' } },
    'order.send': { tr: 'WhatsApp ile gönder', en: 'Send on WhatsApp', ar: 'أرسل عبر واتساب' },
    'order.sendHint': { tr: 'WhatsApp’ta mesajınız hazır açılır; göndere basmanız yeterli.', en: 'WhatsApp opens with your message ready; just press send.', ar: 'يفتح واتساب ورسالتك جاهزة؛ اضغط إرسال فقط.' },
    'order.clear': { tr: 'Listeyi temizle', en: 'Clear list', ar: 'امسح القائمة' },
    'order.clearSure': { tr: 'Tüm liste silinsin mi?', en: 'Remove everything?', ar: 'حذف كل شيء؟' },
    'order.yes': { tr: 'Evet, temizle', en: 'Yes, clear', ar: 'نعم، امسح' },
    'order.no': { tr: 'Vazgeç', en: 'Keep it', ar: 'إلغاء' },
    'order.remove': { tr: '{name} listeden çıkar', en: 'Remove {name}', ar: 'احذف {name}' },
    'order.less': { tr: 'Azalt', en: 'Fewer', ar: 'أقل' },
    'order.more': { tr: 'Artır', en: 'More', ar: 'أكثر' },
    'order.amount': { tr: 'Adet', en: 'Amount', ar: 'الكمية' },
    'order.dropped': { tr: '{name} tükendi ve listeden çıkarıldı', en: '{name} ran out and was removed from your list', ar: 'نفد {name} وحُذف من قائمتك' },
    'order.chooseSize': { tr: 'Boy seçin', en: 'Choose a length', ar: 'اختر الطول' },
    // WhatsApp message
    'order.msg.hello': { tr: 'Merhaba Tarbuş!', en: 'Hello Tarbuş!', ar: 'مرحباً Tarbuş!' },
    'order.msg.order': { tr: 'Siparişim:', en: 'My order:', ar: 'طلبي:' },
    'order.msg.ask': { tr: 'fiyatı sorulacak', en: 'price to confirm', ar: 'السعر يُحدَّد لاحقاً' },
    'order.msg.table': { tr: 'Masa', en: 'Table', ar: 'الطاولة' },
    'order.msg.note': { tr: 'Not', en: 'Note', ar: 'ملاحظة' },
    'order.cardLabel': { tr: 'Mesajınızla giden sipariş kartı', en: 'Order card sent with your message', ar: 'بطاقة الطلب التي تُرسل مع رسالتك' },
    'order.step.share1': { tr: 'Gönder’e basın: kart ve mesaj hazır eklenir.', en: 'Tap Send: the card and the message are attached for you.', ar: 'اضغط إرسال: تُرفق البطاقة والرسالة تلقائياً.' },
    'order.step.share2': { tr: 'WhatsApp’ı, sonra Tarbuş sohbetini seçin (ilk siparişten sonra en üstte çıkar).', en: 'Pick WhatsApp, then the Tarbuş chat (it shows at the top after your first order).', ar: 'اختر واتساب ثم محادثة Tarbuş (تظهر في الأعلى بعد أول طلب).' },
    'order.step.share3': { tr: 'Gönder’e basın.', en: 'Press send.', ar: 'اضغط إرسال.' },
    'order.step.paste1': { tr: 'Gönder’e basın: Tarbuş sohbeti siparişiniz yazılı olarak açılır.', en: 'Tap Send: the Tarbuş chat opens with your order written.', ar: 'اضغط إرسال: تفتح محادثة Tarbuş وطلبك مكتوب.' },
    'order.step.paste2': { tr: 'Kart resmi kopyalanır: sohbette Ctrl+V (Mac’te ⌘V) ile ekleyin.', en: 'The card picture is copied: press Ctrl+V (⌘V on Mac) in the chat to add it.', ar: 'تُنسخ صورة البطاقة: اضغط \u2066Ctrl+V\u2069 (أو \u2066⌘V\u2069 على ماك) في المحادثة لإضافتها.' },
    'order.step.paste3': { tr: 'Gönder’e basın.', en: 'Press send.', ar: 'اضغط إرسال.' },
    'order.copied': { tr: 'Kart kopyalandı: sohbette Ctrl+V', en: 'Card copied: press Ctrl+V in the chat', ar: 'نُسخت البطاقة: اضغط \u2066Ctrl+V\u2069 في المحادثة' },
    'order.copiedMac': { tr: 'Kart kopyalandı: sohbette ⌘V', en: 'Card copied: press ⌘V in the chat', ar: 'نُسخت البطاقة: اضغط \u2066⌘V\u2069 في المحادثة' },
    'order.hintShare': { tr: 'Paylaş menüsünde WhatsApp’ı, sonra Tarbuş sohbetini seçip gönderin. Kart ve mesaj birlikte gider.', en: 'In the Share menu pick WhatsApp, then the Tarbuş chat, and send. The card and the message go together.', ar: 'في قائمة المشاركة اختر واتساب ثم محادثة Tarbuş واضغط إرسال. تُرسل البطاقة والرسالة معاً.' },
    'order.hintDesk': { tr: 'WhatsApp sipariş mesajıyla açılır; kart resmi indirilir, sohbete ekleyebilirsiniz.', en: 'WhatsApp opens with the order message; the card picture is saved so you can attach it.', ar: 'يفتح واتساب برسالة الطلب، وتُحفظ صورة البطاقة لتتمكن من إرفاقها.' },
    'order.hintDirect': { tr: 'WhatsApp, Tarbuş sohbetinde siparişiniz yazılı olarak açılır; göndere basmanız yeterli.', en: 'WhatsApp opens your chat with Tarbuş with the order written out; just press send.', ar: 'يفتح واتساب محادثتك مع Tarbuş والطلب مكتوب؛ اضغط إرسال فقط.' },
    'order.shareCard': { tr: 'Kart resmiyle paylaş', en: 'Share with the card picture', ar: 'شارك مع صورة البطاقة' },
    'order.saveCard': { tr: 'Kart resmini kaydet', en: 'Save the card picture', ar: 'احفظ صورة البطاقة' },
    'order.textOnly': { tr: 'Sadece yazı olarak gönder', en: 'Send as text only', ar: 'أرسل كنص فقط' },
    'order.cardSaved': { tr: 'Sipariş kartı indirildi', en: 'Order card saved', ar: 'تم حفظ بطاقة الطلب' },
    'order.msg.lang': { tr: 'TÜRKÇE', en: 'ENGLISH', ar: 'العربية' },
    'order.msg.greet': { tr: 'Merhaba Tarbuş, bilgi almak istiyorum.', en: 'Hello Tarbuş, I have a question.', ar: 'مرحباً Tarbuş، لدي استفسار.' }
  });

  // A short number staff can answer with: "4821 approved".
  function newRef() { return String(1000 + Math.floor(Math.random() * 9000)); }

  function read() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.lines)) return { lines: d.lines, table: d.table || '', note: d.note || '', ref: d.ref || newRef() };
    } catch (e) { /* ignore */ }
    return { lines: [], table: '', note: '', ref: newRef() };
  }

  let state = read();

  function save(silent) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: list lasts for this page */ }
    if (!silent) window.dispatchEvent(new CustomEvent('orderchange'));
  }

  const keyOf = (id, cm) => (cm ? id + '@' + cm : id);

  /* A line with its current menu item, unit price and display names. */
  function resolve(line) {
    const item = Store.item(line.id);
    if (!item) return null;
    let unit = item.price;
    let size = null;
    if (line.cm && item.sizes) {
      size = item.sizes.find(s => s.cm === line.cm) || null;
      unit = size ? size.price : null;
    }
    const sizeTxt = item.size || (line.cm ? line.cm + ' cm' : '');
    return { ...line, item, unit, sizeTxt, lineTotal: unit != null ? unit * line.qty : null };
  }

  const Order = {
    lines() { return state.lines.map(resolve).filter(Boolean); },

    count() { return state.lines.reduce((n, l) => n + l.qty, 0); },

    qtyOf(id) { return state.lines.filter(l => l.id === id).reduce((n, l) => n + l.qty, 0); },

    total() {
      let sum = 0, unpriced = 0;
      for (const l of Order.lines()) {
        if (l.lineTotal == null) unpriced += l.qty; else sum += l.lineTotal;
      }
      return { sum, unpriced };
    },

    canAdd(item) { return !!item && !item.soldOut && !item.hidden; },

    add(id, opts = {}) {
      const item = Store.item(id);
      if (!Order.canAdd(item)) return false;
      const qty = Math.max(1, Math.min(50, opts.qty || 1));
      const key = keyOf(id, opts.cm);
      const ex = state.lines.find(l => l.key === key);
      if (ex) ex.qty = Math.min(50, ex.qty + qty);
      else state.lines.push({ key, id, cm: opts.cm || null, qty });
      save();
      return true;
    },

    setQty(key, qty) {
      const l = state.lines.find(x => x.key === key);
      if (!l) return;
      if (qty <= 0) state.lines = state.lines.filter(x => x.key !== key);
      else l.qty = Math.min(50, qty);
      save();
    },

    remove(key) { state.lines = state.lines.filter(x => x.key !== key); save(); },

    clear() { state.lines = []; state.note = ''; state.ref = newRef(); save(); },

    ref() { return state.ref; },

    meta() { return { table: state.table, note: state.note }; },

    setMeta(patch) { Object.assign(state, patch); save(true); },

    /* The staff message: a header, then the order in English, Turkish and Arabic, so every worker can read
       their own language. The guest's note is their own words and appears once, untranslated. */
    message() {
      const lines = Order.lines();
      if (!lines.length) return I18n.t('order.msg.greet');
      const t = Order.total();
      const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const head = [`*TARBUŞ · #${state.ref}*`];
      const facts = [time];
      if (state.table.trim()) facts.push(`${I18n.tIn('en', 'order.msg.table')} / ${I18n.tIn('tr', 'order.msg.table')} / ${I18n.tIn('ar', 'order.msg.table')}: *${state.table.trim()}*`);
      head.push(facts.join(' · '));
      if (state.note.trim()) head.push(`${I18n.tIn('en', 'order.msg.note')} / ${I18n.tIn('tr', 'order.msg.note')} / ${I18n.tIn('ar', 'order.msg.note')}: _${state.note.trim()}_`);

      const section = lang => {
        const out = [`*${I18n.tIn(lang, 'order.msg.lang')}*`];
        for (const l of lines) {
          const name = (lang === 'tr' ? l.item.tr : (l.item[lang] || l.item.tr)) + (l.sizeTxt ? ' (' + l.sizeTxt + ')' : '');
          const price = l.lineTotal != null ? plainPrice(l.lineTotal) : I18n.tIn(lang, 'order.msg.ask');
          out.push(`${l.qty} × ${name}: ${price}`);
        }
        let total = `*${I18n.tIn(lang, 'order.total')}: ${plainPrice(t.sum)}*`;
        if (t.unpriced) total += ' ' + I18n.tIn(lang, t.unpriced === 1 ? 'order.plusAsk.1' : 'order.plusAsk.n', { n: t.unpriced });
        out.push(total);
        return out.join('\n');
      };

      return [head.join('\n'), section('en'), section('tr'), section('ar')].join('\n\n');
    },

    whatsappUrl() {
      const phone = window.TARBUS.info.phone.replace(/\D/g, '');
      return `https://wa.me/${phone}?text=${encodeURIComponent(Order.message())}`;
    },

    /* Points a link at WhatsApp with the current list, and keeps it current. */
    bindWhatsApp(a) {
      if (!a) return;
      const sync = () => { a.href = Order.whatsappUrl(); };
      a.target = '_blank';
      a.rel = 'noopener';
      sync();
      window.addEventListener('orderchange', sync);
      window.addEventListener('langchange', sync);
      window.addEventListener('menuchange', sync);
      a.addEventListener('pointerdown', sync);
      a.addEventListener('focus', sync);
    }
  };

  function plainPrice(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₺';
  }

  // The owner marked something sold out or hidden: it leaves the list.
  window.addEventListener('menuchange', () => {
    const dropped = [];
    state.lines = state.lines.filter(l => {
      const item = Store.item(l.id);
      const ok = Order.canAdd(item);
      if (!ok && item) dropped.push(item.tr);
      return ok;
    });
    if (dropped.length) {
      save();
      if (window.UI) dropped.forEach(name => UI.toast(I18n.t('order.dropped', { name }), 'circle-alert'));
    }
  });

  // The list changed in another tab.
  window.addEventListener('storage', e => {
    if (e.key === KEY) { state = read(); window.dispatchEvent(new CustomEvent('orderchange')); }
  });

  window.Order = Order;
})();
