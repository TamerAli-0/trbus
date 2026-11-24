/*
 * Tarbuş — Homepage logic
 * Renders hero sofra, category doors, Beyti ruler, meze spread, grill highlights,
 * drinks section, visit info. Responds to langchange and menuchange events.
 */
(function () {
  'use strict';

  /* ---- i18n strings owned by this page ---- */
  I18n.add({
    'home.skip':       { tr: 'İçeriğe geç', en: 'Skip to content', ar: 'انتقل إلى المحتوى' },
    'home.explore':    { tr: 'Sofranızı keşfedin', en: 'Explore the table', ar: 'اكتشف المائدة' },
    'home.mezeTitle':  { tr: '23 çeşit Antakya mezesi', en: '23 Antakya starters', ar: '23 صنفاً من المقبلات الأنطاكية' },
    'home.mezeSub':    { tr: 'Her sofra meze ile başlar.', en: 'Every table opens with a spread of starters.', ar: 'كل مائدة تبدأ بالمقبلات.' },
    'home.moreMeze':   { tr: 'meze daha menüde', en: 'more starters on the menu', ar: 'أصناف أخرى من المقبلات في القائمة' },
    'home.seeMenu':    { tr: 'Tüm menüyü gör', en: 'See full menu', ar: 'عرض القائمة الكاملة' },
    'home.grillTitle': { tr: 'Ateşten', en: 'From the fire', ar: 'من الشواية' },
    'home.grillSub':   { tr: 'Izgaradan, Antakya usulü.', en: 'Off the grill, Antakya style.', ar: 'مشاوٍ على الطريقة الأنطاكية.' },
    'home.drinksTitle':{ tr: 'İçecekler ve tatlılar', en: 'Drinks & desserts', ar: 'مشروبات وحلويات' },
    'home.drinksSub':  { tr: 'Kebabın yanına şalgam ya da ayran, sofranın sonuna sıcak künefe.', en: 'Şalgam or ayran with your kebab, hot künefe to finish.', ar: 'شلغم أو عيران مع الكباب، وكنافة ساخنة في الختام.' },
    'home.seeDrinks':  { tr: 'Tüm içecekleri gör', en: 'See all drinks', ar: 'عرض كل المشروبات' },
    'home.visitTitle': { tr: 'Bizi ziyaret edin', en: 'Visit us', ar: 'زورونا' },
    'home.updated':    { tr: 'Menü güncellenmiştir.', en: 'Menu is up to date.', ar: 'القائمة محدّثة.' },
    'home.items':      { tr: '{n} çeşit', en: { one: '{n} item', other: '{n} items' }, ar: { zero: 'لا أصناف', one: 'صنف واحد', two: 'صنفان', few: '{n} أصناف', many: '{n} صنفاً', other: '{n} صنف' } },

    'hero.title':  { tr: 'Antakya\'nın meze ve kebap sofrası', en: 'Antakya starters and kebabs off the grill', ar: 'مائدة أنطاكية: مقبلات وكباب على النار' },
    'hero.sub':    { tr: '23 çeşit meze, ızgaradan kebaplar ve Hatay\'ın sıcak sofra geleneği.', en: '23 starters, kebabs off the grill and the warm table tradition of Hatay.', ar: '23 صنفاً من المقبلات، وكباب طازج من الشواية، ودفء المائدة الأنطاكية.' },

    'beyti.title': { tr: 'TRB Beyti', en: 'TRB Beyti', ar: 'TRB بيتي' },
    'beyti.sub':   { tr: '50\'den 200 santimetreye kadar, masanız kadar uzun.', en: 'From 50 to 200 cm — as long as your table.', ar: 'من 50 إلى 200 سم — بطول طاولتك.' },
    'beyti.book':  { tr: 'Bu beyti ile rezervasyon yap', en: 'Book with this beyti', ar: 'احجز مع هذا البيتي' },

    'story.title': { tr: 'Antakya sofrası', en: 'The Antakya table', ar: 'المائدة الأنطاكية' },
    'story.p1':    { tr: 'Antakya\'da sofra, yemek yemenin ötesindedir. Meze tabakları ortaya dizilir, herkes aynı tabaktan yer. Bir lokma humus, bir yaprak yeşillik, sıcak bir lavaş — sofra böyle kurulur.', en: 'In Antakya, the table goes beyond eating. Plates of starters are laid down the middle and everyone shares from the same dish. A bite of hummus, a leaf of greens, warm lavash — that is how a table is set.', ar: 'المائدة في أنطاكية أكثر من مجرد طعام. تُصفّ أطباق المقبلات في الوسط، ويأكل الجميع من الطبق نفسه: لقمة حمص، وورقة خضراء، ورغيف لافاش دافئ. هكذا تكتمل المائدة.' },
    'story.p2':    { tr: 'Bu şehrin mutfağı binlerce yılın birikimidir. Arap, Türk ve Akdeniz lezzetleri aynı tabakta buluşur. Zeytinyağı, nar ekşisi, ceviz ve baharatlar her mezede kendini gösterir.', en: 'This city\'s kitchen is thousands of years in the making. Arab, Turkish and Mediterranean flavours meet on the same plate. Olive oil, pomegranate molasses, walnuts and spices show up in every dish.', ar: 'مطبخ هذه المدينة حصيلة آلاف السنين، تلتقي فيه النكهات العربية والتركية والمتوسطية في طبق واحد. زيت الزيتون ودبس الرمان والجوز والبهارات حاضرة في كل طبق.' },
    'story.p3':    { tr: 'Tarbuş, bu sofra geleneğini yaşatır. Mezeler ortaya, kebaplar ızgaradan gelir. İmza yemeğimiz TRB Beyti, masanız kadar uzun gelebilir. Buyurun, yerinizi alın.', en: 'Tarbuş keeps this table tradition alive. The starters go down the middle and the kebabs come off the grill. Our signature TRB Beyti can come as long as your table. Take your seat.', ar: 'يحافظ مطعم طربوش على هذا التقليد: المقبلات في وسط المائدة، والكباب من الشواية مباشرة، وطبقنا المميز «بيتي TRB» قد يصل بطول طاولتك. أهلاً وسهلاً بكم.' },

    'visit.address': { tr: 'Adres', en: 'Address', ar: 'العنوان' },
    'visit.branches': { tr: 'Şubelerimiz', en: 'Our branches', ar: 'فروعنا' },
    'visit.hours':   { tr: 'Çalışma saatleri', en: 'Opening hours', ar: 'ساعات العمل' },
    'visit.contact': { tr: 'İletişim', en: 'Contact', ar: 'تواصل' },

    'cat.meze':     { tr: 'Meze', en: 'Starters', ar: 'مقبلات' },
    'cat.grill':    { tr: 'Izgara', en: 'Grill', ar: 'مشاوي' },
    'cat.special':  { tr: 'Özel', en: 'Specials', ar: 'أطباق مميزة' },
    'cat.salata':   { tr: 'Salata', en: 'Salads', ar: 'سلطات' },
    'cat.tatli':    { tr: 'Tatlı', en: 'Desserts', ar: 'حلويات' },
    'cat.drinks':   { tr: 'İçecekler', en: 'Drinks', ar: 'مشروبات' },
  });

  const info = window.TARBUS.info;
  const esc = window.UI ? UI.esc : s => String(s ?? '');

  /* ---- HEADER: solid on scroll ---- */
  const header = document.getElementById('site-header');
  let headerSolid = false;
  function checkHeader() {
    const y = window.scrollY > 40;
    if (y !== headerSolid) {
      headerSolid = y;
      header.classList.toggle('is-solid', y);
    }
  }
  window.addEventListener('scroll', checkHeader, { passive: true });
  checkHeader();

  /* ---- HEADER: language switches ---- */
  const headerLang = document.getElementById('header-lang');
  const drawerLang = document.getElementById('drawer-lang');
  const footerLang = document.getElementById('footer-lang');
  if (headerLang) I18n.mountSwitcher(headerLang);
  if (drawerLang) I18n.mountSwitcher(drawerLang);
  if (footerLang) I18n.mountSwitcher(footerLang);

  /* ---- MOBILE DRAWER ---- */
  const burger = document.getElementById('burger-btn');
  const drawer = document.getElementById('mobile-drawer');
  const drawerScrim = document.getElementById('drawer-scrim');
  const drawerClose = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.hidden = false;
    requestAnimationFrame(() => {
      drawer.classList.add('is-open');
      drawerScrim.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawerScrim.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 500);
  }
  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerScrim.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---- WhatsApp links: carry the guest's dish list from the menu ---- */
  Order.bindWhatsApp(document.getElementById('visit-phone'));
  Order.bindWhatsApp(document.getElementById('hero-whatsapp'));

  /* ---- HERO STATUS ---- */
  function renderStatus() {
    const el = document.getElementById('hero-status');
    const st = I18n.openStatus(info.hours);
    el.innerHTML = `<span class="status-dot ${st.open ? 'is-open' : 'is-closed'}"></span>` +
      `<span>${st.open ? I18n.t('hours.open') : I18n.t('hours.closed')}</span>` +
      `<span style="color:var(--ink-3);margin-inline-start:4px">${st.text}</span>`;
  }
  renderStatus();

  /* ---- HERO SOFRA: plate photos with parallax ---- */
  const sofraEl = document.getElementById('hero-sofra');
  const sofraDishes = [
    { photo: 'assets/dishes/humus-tereyagli.webp',  w: 130, x: 5,   y: 10,  depth: 0.03 },
    { photo: 'assets/dishes/babagannuc.webp',        w: 120, x: 42,  y: 0,   depth: 0.05 },
    { photo: 'assets/dishes/cevizli-biber.webp',     w: 110, x: 75,  y: 8,   depth: 0.02 },
    { photo: 'assets/dishes/karisik-izgara.webp',    w: 150, x: 20,  y: 42,  depth: 0.04 },
    { photo: 'assets/dishes/adana-kebap.webp',       w: 130, x: 60,  y: 38,  depth: 0.06 },
    { photo: 'assets/dishes/pirzola.webp',           w: 115, x: 0,   y: 68,  depth: 0.03 },
    { photo: 'assets/dishes/trb-beyti.webp',         w: 140, x: 35,  y: 72,  depth: 0.05 },
    { photo: 'assets/dishes/ali-nazik.webp',         w: 110, x: 72,  y: 65,  depth: 0.02 },
  ];

  const plateEls = [];
  sofraDishes.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'hero__plate';
    div.style.left = d.x + '%';
    div.style.top = d.y + '%';
    div.style.width = (d.w / 5.2) + '%';
    const img = document.createElement('img');
    img.src = d.photo;
    img.alt = '';
    img.loading = i < 4 ? 'eager' : 'lazy';
    img.width = d.w;
    img.height = d.w;
    div.appendChild(img);
    sofraEl.appendChild(div);
    plateEls.push({ el: div, depth: d.depth });
  });

  // Staggered entrance
  requestAnimationFrame(() => {
    setTimeout(() => {
      plateEls.forEach(p => p.el.classList.add('is-in'));
    }, 100);
  });

  // Parallax on mouse move (desktop only, respect reduced-motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReduced.matches) {
    let rafId = null;
    sofraEl.addEventListener('mousemove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = sofraEl.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        plateEls.forEach(p => {
          const tx = cx * p.depth * 800;
          const ty = cy * p.depth * 800;
          p.el.style.transform = `translate(${tx}px, ${ty}px)`;
        });
        rafId = null;
      });
    });
    sofraEl.addEventListener('mouseleave', () => {
      plateEls.forEach(p => { p.el.style.transform = ''; });
    });
  }

  /* ---- CATEGORY DOORS ---- */
  const catDoors = [
    { id: 'meze',        key: 'cat.meze',    cats: ['meze'],                                          photo: 'assets/dishes/humus-tereyagli.webp' },
    { id: 'ana-yemekler', key: 'cat.grill',   cats: ['ana-yemekler'],                                  photo: 'assets/dishes/karisik-izgara.webp' },
    { id: 'special',     key: 'cat.special',  cats: ['special'],                                       photo: 'assets/dishes/trb-beyti.webp' },
    { id: 'salata',      key: 'cat.salata',   cats: ['salata'],                                        photo: 'assets/dishes/coban-salata.webp' },
    { id: 'tatli',       key: 'cat.tatli',    cats: ['tatli'],                                         photo: null, names: ['Peynirli Künefe', 'Fıstıklı Künefe', 'Peynirli İrmik', 'Kabak Tatlısı'] },
    { id: 'drinks',      key: 'cat.drinks',   cats: ['mesrubatlar'], photo: 'assets/drinks/ayran.webp', names: [] },
  ];

  function renderCatDoors() {
    const grid = document.getElementById('cat-grid');
    const items = Store.items();
    grid.innerHTML = catDoors.map(d => {
      const count = items.filter(i => d.cats.includes(i.cat) && !i.hidden).length;
      const href = d.id === 'drinks' ? 'menu.html#mesrubatlar' : `menu.html#${d.id}`;
      const hasPhoto = !!d.photo;
      return `<a href="${href}" class="cat-door${hasPhoto ? '' : ' cat-door--plain'}">
        ${hasPhoto ? `<img class="cat-door__img" src="${d.photo}" alt="" loading="lazy">`
                   : `<ul class="cat-door__names">${items.filter(i => d.cats.includes(i.cat) && !i.hidden).slice(0, 4).map(i => `<li lang="${I18n.titleLang(i)}">${esc(I18n.title(i))}</li>`).join('')}</ul>`}
        <div class="cat-door__overlay"></div>
        <div class="cat-door__body">
          <div class="cat-door__name">${I18n.t(d.key)}</div>
          <div class="cat-door__count">${I18n.t('home.items', { n: count })}</div>
        </div>
      </a>`;
    }).join('');
  }
  renderCatDoors();

  /* ---- TRB BEYTI RULER ---- */
  const beytiItem = window.TARBUS.items.find(i => i.id === 'trb-beyti');
  const cmUnit = () => (I18n.lang === 'ar' ? ' سم' : ' cm');
  const beytiSizes = beytiItem.sizes; // [{cm,price,serves}]
  const beytiSnaps = beytiSizes.map(s => s.cm); // [50,100,150,200]
  let beytiIndex = 1; // start at 100 cm
  const beytiTrack = document.getElementById('beyti-track');
  const beytiThumb = document.getElementById('beyti-thumb');
  const beytiPortions = document.getElementById('beyti-portions');
  const beytiPeople = document.getElementById('beyti-people');
  const beytiTicksEl = document.getElementById('beyti-ticks');

  // Build ticks every 10 cm from 50 to 200
  const tickPositions = [];
  for (let cm = 50; cm <= 200; cm += 10) {
    const pct = ((cm - 50) / 150) * 100;
    tickPositions.push({ cm, pct });
  }

  function renderBeytiTicks() {
    beytiTicksEl.innerHTML = tickPositions.map(t => {
      const isSnap = beytiSnaps.includes(t.cm);
      const isActive = t.cm === beytiSnaps[beytiIndex];
      return `<div class="beyti__tick${isActive ? ' is-active' : ''}" style="left:${t.pct}%" data-cm="${t.cm}">
        <div class="beyti__tick-line" style="height:${isSnap ? 22 : 12}px"></div>
        ${isSnap ? `<span class="beyti__tick-label">${t.cm}</span>` : ''}
      </div>`;
    }).join('');
  }

  function updateBeyti() {
    const s = beytiSizes[beytiIndex];
    const pct = ((s.cm - 50) / 150) * 100;
    beytiThumb.style.left = pct + '%';
    beytiTrack.style.setProperty('--fill', pct + '%');
    beytiTrack.setAttribute('aria-valuenow', s.cm);
    beytiTrack.setAttribute('aria-valuetext', s.cm + cmUnit());

    // One true-scale photo per 50 cm, side by side: 100 cm is two, 200 cm is four. Never stretched.
    const portions = s.cm / 50;
    const have = beytiPortions.children.length;
    for (let i = have; i < portions; i++) {
      const fig = document.createElement('figure');
      fig.className = 'beyti__portion';
      fig.innerHTML = `<img src="assets/dishes/trb-beyti.webp" alt="" draggable="false" class="plate"><figcaption>${(i + 1) * 50}${cmUnit()}</figcaption>`;
      beytiPortions.appendChild(fig);
    }
    for (let i = have; i > portions; i--) beytiPortions.lastElementChild.remove();

    beytiPeople.innerHTML = Array.from({ length: s.serves }, () => '<i data-lucide="user-round"></i>').join('');
    if (window.UI) UI.icons(beytiPeople);

    document.getElementById('beyti-length').textContent = s.cm + cmUnit();
    document.getElementById('beyti-price').textContent = I18n.price(s.price);
    document.getElementById('beyti-serves').textContent = I18n.t('serves', { n: s.serves });

    renderBeytiTicks();

    // Update book link
    const bookBtn = document.getElementById('beyti-book');
    bookBtn.dataset.beytiCm = s.cm;
  }
  updateBeyti();

  // Snap to nearest on click/touch
  function beytiSnapFromX(clientX) {
    const rect = beytiTrack.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const cm = 50 + ratio * 150;
    // Find closest snap
    let closest = 0;
    let minDist = Infinity;
    beytiSnaps.forEach((s, i) => {
      const d = Math.abs(s - cm);
      if (d < minDist) { minDist = d; closest = i; }
    });
    if (closest !== beytiIndex) {
      beytiIndex = closest;
      updateBeyti();
    }
  }

  beytiTrack.addEventListener('pointerdown', e => {
    e.preventDefault();
    beytiTrack.focus({ preventScroll: true });
    beytiTrack.setPointerCapture(e.pointerId);
    beytiSnapFromX(e.clientX);
  });
  beytiTrack.addEventListener('click', e => {
    beytiTrack.focus({ preventScroll: true });
    if (e.detail && e.clientX) beytiSnapFromX(e.clientX);
  });
  beytiTrack.addEventListener('pointermove', e => {
    if (beytiTrack.hasPointerCapture(e.pointerId)) {
      beytiSnapFromX(e.clientX);
    }
  });

  // Keyboard
  beytiTrack.addEventListener('keydown', e => {
    let next = beytiIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = beytiIndex + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = beytiIndex - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = beytiSnaps.length - 1;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(beytiSnaps.length - 1, next));
    if (next !== beytiIndex) { beytiIndex = next; updateBeyti(); }
  });

  // Beyti book button: pre-fill booking note
  document.getElementById('beyti-book').addEventListener('click', e => {
    const cm = e.currentTarget.dataset.beytiCm || '100';
    const note = document.getElementById('book-note');
    if (note) {
      const text = I18n.lang === 'ar' ? `TRB بيتي ${cm} سم` :
                   I18n.lang === 'en' ? `TRB Beyti ${cm} cm` :
                   `TRB Beyti ${cm} cm`;
      note.value = text;
    }
  });

  /* ---- MEZE SPREAD ---- */
  function renderMeze() {
    const grid = document.getElementById('meze-grid');
    const all = Store.visible('meze');
    // Only the dishes with their own photo go in the spread; the rest are one tap away in the menu.
    const items = all.filter(it => it.photo);
    const rest = all.length - items.length;
    grid.innerHTML = items.map(it => {
      const name = I18n.title(it);
      const sub = I18n.alt(it);
      const priceText = it.soldOut ? I18n.t('item.soldOut') :
                        (it.price != null ? I18n.price(it.price) : I18n.t('price.ask'));
      const priceClass = it.soldOut ? 'tag tag-soldout' :
                         (it.price != null ? 'price' : 'price is-ask');
      const tags = it.tags || [];
      return `<div class="meze-card${it.soldOut ? ' is-soldout' : ''}">
        ${it.photo
          ? `<img class="meze-card__img" src="${esc(it.photo)}" alt="${esc(name)}" loading="lazy" width="200" height="200">`
          : `<div class="meze-card__img--empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12s1.5 2 4 2 4-2 4-2"/></svg></div>`}
        <div class="meze-card__body">
          <div class="meze-card__name" lang="${I18n.titleLang(it)}">${esc(name)}</div>
          ${sub ? `<div class="meze-card__sub latin" lang="tr">${esc(sub)}</div>` : ''}
          <div class="meze-card__foot">
            <span class="${priceClass}">${priceText}</span>
            <span class="meze-card__tags">
              ${tags.includes('veg') ? `<span class="tag tag-veg" style="padding:0 5px;height:20px" title="${esc(I18n.t('tag.veg'))}" aria-label="${esc(I18n.t('tag.veg'))}"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span>` : ''}
              ${tags.includes('spicy') ? '<span class="tag tag-spicy" style="padding:0 6px;height:20px;font-size:0.65rem"><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8 1c-.5 0-1 .3-1.3.8C6 3 5.5 4.5 6 6c-1.5-.5-3-1-3.5-.5-.6.6.2 2 1 3 .8 1 2 2.2 3.2 3 1.2.7 2.5 1 3.3.5.8-.5 1-1.5.8-2.5-.2-1-.7-2.2-1.5-3.3C8.5 5 8 4 8 3V1z"/></svg></span>' : ''}
            </span>
          </div>
        </div>
      </div>`;
    }).join('') + (rest > 0 ? `<a class="meze-card meze-card--more" href="menu.html#meze">
        <span class="meze-card__more-n">+${rest}</span>
        <span class="meze-card__more-t">${esc(I18n.t('home.moreMeze'))}</span>
        <span class="meze-card__more-a">${esc(I18n.t('home.seeMenu'))} <span aria-hidden="true">${I18n.isRTL() ? '←' : '→'}</span></span>
      </a>` : '');
  }
  renderMeze();

  /* ---- GRILL HIGHLIGHTS ---- */
  const grillIds = ['karisik-izgara', 'kaz-basi', 'pirzola', 'adana-kebap', 'kusbasi', 'kanat'];
  function renderGrill() {
    const grid = document.getElementById('grill-grid');
    const items = Store.items().filter(i => grillIds.includes(i.id));
    grid.innerHTML = items.map(it => {
      const name = I18n.title(it);
      const sub = I18n.alt(it);
      const priceText = it.soldOut ? I18n.t('item.soldOut') :
                        (it.price != null ? I18n.price(it.price) : I18n.t('price.ask'));
      const priceClass = it.soldOut ? 'tag tag-soldout' :
                         (it.price != null ? 'price' : 'price is-ask');
      return `<div class="grill-card">
        ${it.photo
          ? `<img class="grill-card__img" src="${esc(it.photo)}" alt="${esc(name)}" loading="lazy">`
          : `<div class="grill-card__img" style="background:var(--ground-3)"></div>`}
        <div class="grill-card__body">
          <div class="grill-card__name" lang="${I18n.titleLang(it)}">${esc(name)}</div>
          ${sub ? `<div class="grill-card__sub latin" lang="tr">${esc(sub)}</div>` : ''}
          <div class="grill-card__price ${priceClass}">${priceText}</div>
        </div>
      </div>`;
    }).join('');
  }
  renderGrill();

  /* ---- DRINKS ---- */
  const drinkGroups = [
    { id: 'mesrubatlar', key: 'Meşrubatlar', max: 11 },
    { id: 'tatli', key: 'Tatlı', max: 6 },
  ];

  function renderDrinks() {
    const el = document.getElementById('drinks-lists');
    const items = Store.items();
    el.innerHTML = drinkGroups.map(g => {
      const catInfo = window.TARBUS.categories.find(c => c.id === g.id);
      const title = catInfo ? I18n.name(catInfo) : g.key;
      const groupItems = items.filter(i => i.cat === g.id && !i.hidden).slice(0, g.max);
      return `<div class="drinks-group">
        <h3 class="drinks-group__title">${esc(title)}</h3>
        <div class="drinks-group__list">
          ${groupItems.map(it => {
            const priceText = it.soldOut ? I18n.t('item.soldOut') :
                              (it.price != null ? I18n.price(it.price) : I18n.t('price.ask'));
            const priceClass = it.soldOut ? 'tag tag-soldout' :
                               (it.price != null ? 'price' : 'price is-ask');
            return `<div class="drink-row">
              <span class="drink-row__name" lang="${I18n.titleLang(it)}">${esc(I18n.title(it))}${it.size ? `<span class="drink-row__size">${esc(it.size)}</span>` : ''}${I18n.alt(it) ? `<span class="drink-row__size latin" lang="tr">${esc(I18n.alt(it))}</span>` : ''}</span>
              <span class="drink-row__price ${priceClass}">${priceText}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }
  renderDrinks();

  /* ---- VISIT ---- */
  function renderVisit() {
    document.getElementById('visit-branches').innerHTML = info.branches.map(b => `
      <li class="branch">
        ${I18n.lang === 'ar' ? `<strong>${esc(b.nameAr)}</strong>` : `<strong class="latin" lang="tr">${esc(b.name)}</strong>`}
        <span class="latin" lang="tr">${esc(b.area)}</span>
        <a class="btn btn-ghost btn-sm" href="${esc(b.mapsUrl)}" target="_blank" rel="noopener">${esc(I18n.t('cta.directions'))}</a>
      </li>`).join('');

    document.getElementById('visit-phone-text').textContent = info.phoneDisplay;

    // Hours table
    const tbody = document.querySelector('#hours-table tbody');
    const today = new Date().getDay();
    const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
    tbody.innerHTML = dayOrder.map(d => {
      const h = info.hours.find(h => h.day === d);
      const isToday = d === today;
      return `<tr${isToday ? ' class="is-today"' : ''}>
        <td>${I18n.t('day.' + d)}${isToday ? ' (' + I18n.t('today') + ')' : ''}</td>
        <td>${h ? h.open + ' – ' + h.close : '—'}</td>
      </tr>`;
    }).join('');
  }
  renderVisit();

  /* ---- LIVE UPDATES ---- */
  function refresh() {
    renderCatDoors();
    renderMeze();
    renderGrill();
    renderDrinks();
  }
  window.addEventListener('menuchange', refresh);
  window.addEventListener('langchange', () => {
    renderStatus();
    renderCatDoors();
    updateBeyti();
    renderMeze();
    renderGrill();
    renderDrinks();
    renderVisit();
  });

  /* ---- ICONS ---- */
  if (window.UI) UI.icons();
})();
