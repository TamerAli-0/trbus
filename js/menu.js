/*
 * Tarbuş QR Menu — phone-first restaurant menu with desktop sidebar.
 * Reads items from Store (menu-data.js + owner overrides), renders categories,
 * handles search, filters, detail sheets, scrollspy and deep links.
 */
(function () {
  'use strict';

  /* -------- i18n strings for this page -------- */
  I18n.add({
    'menu.skip':              { tr: 'Menüye geç', en: 'Skip to menu', ar: 'انتقل للقائمة' },
    'menu.title':             { tr: 'Menü', en: 'Menu', ar: 'القائمة' },
    'menu.search':            { tr: 'Ara', en: 'Search', ar: 'بحث' },
    'menu.searchPlaceholder': { tr: 'Yemek veya içecek ara…', en: 'Search food or drinks…', ar: 'ابحث عن طعام أو مشروب…' },
    'menu.noResults':         { tr: 'Bir şey bulunamadı', en: 'Nothing found', ar: 'لم يتم العثور على شيء' },
    'menu.items':             { tr: '{n} çeşit', en: { one: '{n} item', other: '{n} items' }, ar: { zero: 'لا أصناف', one: 'صنف واحد', two: 'صنفان', few: '{n} أصناف', many: '{n} صنفاً', other: '{n} صنف' } },
    'menu.close':             { tr: 'Kapat', en: 'Close', ar: 'إغلاق' },
    'filter.veg':             { tr: 'Vejetaryen', en: 'Vegetarian', ar: 'نباتي' },
    'filter.signature':       { tr: 'İmza', en: 'Signature', ar: 'مميز' },
    'menu.sizeLabel':         { tr: '{cm} cm', en: '{cm} cm', ar: '{cm} سم' },
  });

  /* -------- DOM refs -------- */
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const barEl         = $('#menu-bar');
  const searchToggle  = $('#search-toggle');
  const searchBar     = $('#search-bar');
  const searchInput   = $('#search-input');
  const searchClear   = $('#search-clear');
  const chipScroll    = $('#chip-scroll');
  const sidebarNav    = $('#sidebar-nav');
  const mainEl        = $('#menu-main');
  const emptyEl       = $('#empty-state');
  const scrimEl       = $('#detail-scrim');
  const sheetEl       = $('#detail-sheet');
  const sheetBody     = $('#detail-body');
  const footerPhoneEl = $('#footer-phone');
  const footerAddrEl  = $('#footer-address');
  const footerHoursEl = $('#footer-hours');

  /* -------- State -------- */
  let activeFilters = new Set();  // 'veg', 'signature'
  let searchQuery = '';
  let activeCat = null;           // id of the visible category (scrollspy)
  let sheetOpen = false;
  let focusBefore = null;         // where focus was before sheet opened

  /* -------- Helpers -------- */
  const cats = () => window.TARBUS.categories;

  function itemsForCat(catId) {
    return Store.visible(catId);
  }

  function matchesSearch(item) {
    if (!searchQuery) return true;
    const q = UI.fold(searchQuery);
    const fields = [item.tr, item.en, item.ar, item.group,
      item.desc && item.desc.tr, item.desc && item.desc.en, item.desc && item.desc.ar,
      item.variant && item.variant.tr, item.variant && item.variant.en, item.variant && item.variant.ar
    ];
    return fields.some(f => f && UI.fold(f).includes(q));
  }

  function matchesFilters(item) {
    if (activeFilters.size === 0) return true;
    for (const f of activeFilters) {
      if (!item.tags.includes(f)) return false;
    }
    return true;
  }

  function visibleItems(catId) {
    return itemsForCat(catId).filter(i => matchesSearch(i) && matchesFilters(i));
  }

  /* -------- Render: category chips (phone) -------- */
  function renderChips() {
    // Remove old cat chips
    chipScroll.querySelectorAll('.cat-chip').forEach(c => c.remove());
    cats().forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip cat-chip';
      btn.dataset.cat = cat.id;
      btn.textContent = I18n.name(cat);
      btn.setAttribute('aria-pressed', 'false');
      chipScroll.appendChild(btn);
    });
  }

  /* -------- Render: sidebar (desktop) -------- */
  function renderSidebar() {
    sidebarNav.innerHTML = '';

    // Filter buttons at top
    const filterWrap = document.createElement('div');
    filterWrap.className = 'sidebar-filters';
    filterWrap.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;';
    ['veg', 'signature'].forEach(f => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip filter-chip';
      btn.dataset.filter = f;
      btn.setAttribute('aria-pressed', String(activeFilters.has(f)));
      btn.innerHTML = `<i data-lucide="${f === 'veg' ? 'leaf' : 'crown'}"></i><span data-i18n="filter.${f}">${I18n.t('filter.' + f)}</span>`;
      filterWrap.appendChild(btn);
    });
    sidebarNav.appendChild(filterWrap);

    cats().forEach(cat => {
      const items = visibleItems(cat.id);
      const a = document.createElement('a');
      a.href = '#' + cat.id;
      a.className = 'sidebar-link';
      if (cat.id === activeCat) a.classList.add('is-active');
      a.innerHTML = `<span>${UI.esc(I18n.name(cat))}</span><span class="sidebar-link__count">${items.length}</span>`;
      a.addEventListener('click', e => {
        e.preventDefault();
        const sec = document.getElementById('section-' + cat.id);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      });
      sidebarNav.appendChild(a);
    });
    UI.icons(sidebarNav);
  }

  /* -------- Dishes without their own photo: the Tarbuş logo stands in -------- */
  function noPhotoHTML(cls) {
    return `<div class="${cls} nophoto" role="img" aria-label="${UI.esc(I18n.t('photo.none'))}">
      <img class="nophoto__logo" src="assets/brand/tarbus-logo.png" alt="" loading="lazy">
      <span class="nophoto__text">${UI.esc(I18n.t('photo.none'))}</span>
    </div>`;
  }

  /* -------- Add-to-list button (cards and drink rows) -------- */
  function addBtnHTML(item) {
    if (!Order.canAdd(item)) return '';
    const n = Order.qtyOf(item.id);
    const label = I18n.t('order.addNamed', { name: item.tr + (item.size ? ' ' + item.size : '') });
    return `<button type="button" class="add-btn${n ? ' has-qty' : ''}" data-add="${UI.esc(item.id)}" aria-label="${UI.esc(label)}">
      <i data-lucide="plus"></i><span class="add-btn__qty" aria-hidden="true">${n || ''}</span>
    </button>`;
  }

  /* -------- Render: food card -------- */
  function foodCardHTML(item) {
    const sub = I18n.alt(item);
    const variant = item.variant ? I18n.name(item.variant) : '';
    const priceStr = item.price != null ? I18n.price(item.price) : I18n.t('price.ask');
    const priceClass = item.price != null ? 'price' : 'price is-ask';
    const soldOut = item.soldOut;

    // Dishes without their own photo are text cards: their description takes the photo's place.
    const photoHTML = item.photo
      ? `<div class="food-card__photo"><img src="${UI.esc(item.photo)}" alt="${UI.esc(item.tr)}" loading="lazy" decoding="async"></div>`
      : noPhotoHTML('food-card__photo');
    const desc = '';

    let tagsHTML = '';
    if (item.tags.length || soldOut) {
      tagsHTML = '<div class="food-card__tags">';
      if (soldOut) tagsHTML += `<span class="tag tag-soldout">${UI.esc(I18n.t('item.soldOut'))}</span>`;
      item.tags.forEach(t => {
        if (t === 'veg') tagsHTML += `<span class="tag tag-veg"><i data-lucide="leaf"></i>${UI.esc(I18n.t('tag.veg'))}</span>`;
        else if (t === 'signature') tagsHTML += `<span class="tag tag-signature"><i data-lucide="crown"></i>${UI.esc(I18n.t('tag.signature'))}</span>`;
        else if (t === 'spicy') tagsHTML += `<span class="tag tag-spicy"><i data-lucide="flame"></i>${UI.esc(I18n.t('tag.spicy'))}</span>`;
      });
      tagsHTML += '</div>';
    }

    return `
      <article class="food-card${soldOut ? ' is-sold-out' : ''}" data-item="${UI.esc(item.id)}" tabindex="0" role="button" aria-label="${UI.esc(I18n.title(item))}">
        ${photoHTML}
        <div class="food-card__body">
          <div class="food-card__name" lang="${I18n.titleLang(item)}">${UI.esc(I18n.title(item))}</div>
          ${sub ? `<div class="food-card__sub latin" lang="tr">${UI.esc(sub)}</div>` : ''}
          ${variant ? `<div class="food-card__variant">${UI.esc(variant)}</div>` : ''}
          ${desc ? `<p class="food-card__desc">${UI.esc(desc)}</p>` : ''}
          <div class="food-card__bottom">
            <span class="${priceClass}">${priceStr}</span>
            ${tagsHTML}
          </div>
        </div>
        ${addBtnHTML(item)}
      </article>
    `;
  }

  /* -------- Render: drink rows -------- */
  function drinkRowsHTML(items) {
    // Group by brand (the 'group' field, which is the drink name without size)
    const groups = new Map();
    items.forEach(item => {
      const key = item.group || item.tr;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    let html = '';
    for (const [brand, rows] of groups) {
      // If only one item with no size, it's a standalone line
      if (rows.length === 1 && !rows[0].size) {
        const it = rows[0];
        const priceStr = it.price != null ? I18n.price(it.price) : I18n.t('price.ask');
        const priceClass = it.price != null ? 'price' : 'price is-ask';
        html += `<div class="drink-row${it.soldOut ? ' is-sold-out' : ''}" data-item="${UI.esc(it.id)}" tabindex="0" role="button" aria-label="${UI.esc(I18n.title(it))}">
          <span class="drink-row__name" lang="${I18n.titleLang(it)}">${UI.esc(I18n.title(it))}${I18n.alt(it) ? `<span class="drink-row__alt latin" lang="tr">${UI.esc(I18n.alt(it))}</span>` : ''}</span>
          ${it.soldOut ? `<span class="tag tag-soldout" style="font-size:0.68rem">${UI.esc(I18n.t('item.soldOut'))}</span>` : ''}
          <span class="${priceClass}">${priceStr}</span>
          ${addBtnHTML(it)}
        </div>`;
      } else {
        html += `<div class="drink-group"><div class="drink-group__brand">${UI.esc(brand)}</div><div class="drink-list">`;
        rows.forEach(it => {
          const priceStr = it.price != null ? I18n.price(it.price) : I18n.t('price.ask');
          const priceClass = it.price != null ? 'price' : 'price is-ask';
          html += `<div class="drink-row${it.soldOut ? ' is-sold-out' : ''}" data-item="${UI.esc(it.id)}" tabindex="0" role="button" aria-label="${UI.esc(it.tr)} ${UI.esc(it.size || '')}">
            <span class="drink-row__name">${UI.esc(it.size || it.tr)}</span>
            ${it.soldOut ? `<span class="tag tag-soldout" style="font-size:0.68rem">${UI.esc(I18n.t('item.soldOut'))}</span>` : ''}
            <span class="${priceClass}">${priceStr}</span>
            ${addBtnHTML(it)}
          </div>`;
        });
        html += '</div></div>';
      }
    }
    return html;
  }

  /* -------- Render: all sections -------- */
  function renderSections() {
    // Remove old sections
    mainEl.querySelectorAll('.menu-section').forEach(s => s.remove());

    let anyVisible = false;
    cats().forEach((cat, i) => {
      const items = visibleItems(cat.id);
      if (items.length === 0) return;
      anyVisible = true;

      const section = document.createElement('section');
      section.className = 'menu-section';
      section.id = 'section-' + cat.id;
      section.style.animationDelay = Math.min(i * 40, 280) + 'ms';

      const countLabel = I18n.t('menu.items', { n: items.length });
      const isFood = cat.kind === 'food';

      let bodyHTML;
      if (isFood || items.some(it => it.photo)) {
        bodyHTML = `<div class="food-grid">${items.map(foodCardHTML).join('')}</div>`;
      } else {
        bodyHTML = `<div class="drink-section">${drinkRowsHTML(items)}</div>`;
      }

      section.innerHTML = `
        <div class="menu-section__head">
          <h2 class="menu-section__title">${UI.esc(I18n.name(cat))}</h2>
          <span class="menu-section__count">${countLabel}</span>
        </div>
        ${bodyHTML}
      `;
      mainEl.insertBefore(section, emptyEl);
    });

    emptyEl.hidden = anyVisible;

    UI.icons(mainEl);
    updateScrollspy();
  }

  /* -------- Full render -------- */
  function render() {
    renderChips();
    renderSidebar();
    renderSections();
    I18n.apply();
  }

  /* -------- Search -------- */
  function openSearch() {
    searchBar.hidden = false;
    searchInput.focus();
    searchToggle.setAttribute('aria-expanded', 'true');
  }
  function closeSearch() {
    searchBar.hidden = true;
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    searchToggle.setAttribute('aria-expanded', 'false');
    renderSections();
    renderSidebar();
  }

  searchToggle.addEventListener('click', () => {
    if (searchBar.hidden) openSearch(); else closeSearch();
  });

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    searchClear.hidden = !searchQuery;
    renderSections();
    renderSidebar();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    searchInput.focus();
    renderSections();
    renderSidebar();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); e.preventDefault(); }
  });

  /* -------- Filters -------- */
  document.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    const f = chip.dataset.filter;
    if (activeFilters.has(f)) activeFilters.delete(f);
    else activeFilters.add(f);
    // Sync all filter chips (rail + sidebar)
    $$('.filter-chip').forEach(c => {
      if (c.dataset.filter === f) c.setAttribute('aria-pressed', String(activeFilters.has(f)));
    });
    renderSections();
    renderSidebar();
  });

  /* -------- Category chip tap (phone) -------- */
  chipScroll.addEventListener('click', e => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    const sec = document.getElementById('section-' + chip.dataset.cat);
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  });

  /* -------- Scrollspy: highlight active category -------- */
  function updateScrollspy() {
    const sections = $$('.menu-section');
    if (!sections.length) return;

    // Measured against the screen, not offsetTop: the sections sit inside a positioned layout, so their
    // offsetTop is relative to it and ran a section behind on desktop.
    const line = Math.max(barEl.getBoundingClientRect().bottom + 40, window.innerHeight * 0.35);
    let current = null;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= line) current = sec.id.replace('section-', '');
    }
    // At the very bottom the last short sections can never reach the line: pick the last one.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id.replace('section-', '');
    }
    if (!current && sections.length) current = sections[0].id.replace('section-', '');
    if (current === activeCat) return;
    activeCat = current;

    // Update chip rail
    chipScroll.querySelectorAll('.cat-chip').forEach(c => {
      const active = c.dataset.cat === activeCat;
      c.setAttribute('aria-pressed', String(active));
      c.classList.toggle('is-active', active);
      if (active) scrollChipIntoView(c);
    });

    // Update sidebar
    sidebarNav.querySelectorAll('.sidebar-link').forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + activeCat);
    });
  }

  function scrollChipIntoView(chip) {
    const container = chipScroll;
    const cl = container.getBoundingClientRect();
    const cr = chip.getBoundingClientRect();
    if (cr.left < cl.left + 20) {
      container.scrollLeft -= (cl.left + 20 - cr.left);
    } else if (cr.right > cl.right - 20) {
      container.scrollLeft += (cr.right - cl.right + 20);
    }
  }

  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => { updateScrollspy(); scrollTick = false; });
    }
  }, { passive: true });

  /* -------- Detail sheet -------- */
  function openSheet(itemId) {
    const item = Store.item(itemId);
    if (!item) return;

    focusBefore = document.activeElement;
    const sub = I18n.alt(item);
    const variant = item.variant ? I18n.name(item.variant) : '';
    const desc = I18n.desc(item);
    const priceStr = item.price != null ? I18n.price(item.price) : I18n.t('price.ask');
    const priceClass = item.price != null ? 'price detail-price' : 'price is-ask detail-price';

    let photoHTML = noPhotoHTML('detail-nophoto');
    if (item.photo) {
      photoHTML = `<img class="detail-photo" src="${UI.esc(item.photo)}" alt="${UI.esc(item.tr)}">`;
    }

    let tagsHTML = '';
    if (item.tags.length) {
      tagsHTML = '<div class="detail-tags">';
      item.tags.forEach(t => {
        if (t === 'veg') tagsHTML += `<span class="tag tag-veg"><i data-lucide="leaf"></i>${UI.esc(I18n.t('tag.veg'))}</span>`;
        else if (t === 'signature') tagsHTML += `<span class="tag tag-signature"><i data-lucide="crown"></i>${UI.esc(I18n.t('tag.signature'))}</span>`;
        else if (t === 'spicy') tagsHTML += `<span class="tag tag-spicy"><i data-lucide="flame"></i>${UI.esc(I18n.t('tag.spicy'))}</span>`;
      });
      tagsHTML += '</div>';
    }

    let soldOutHTML = '';
    if (item.soldOut) {
      soldOutHTML = `<div class="detail-soldout"><span class="tag tag-soldout">${UI.esc(I18n.t('item.soldOut'))}</span></div>`;
    }

    // TRB Beyti size chips
    let sizesHTML = '';
    if (item.sizes && item.sizes.length) {
      const defaultSize = item.sizes[0];
      sizesHTML = '<div class="size-chips" role="radiogroup" aria-label="' + UI.esc(I18n.t('menu.title')) + '">';
      item.sizes.forEach((s, i) => {
        const label = I18n.t('menu.sizeLabel', { cm: s.cm });
        const serves = I18n.t('serves', { n: s.serves });
        sizesHTML += `
          <button type="button" class="size-chip${i === 0 ? ' is-active' : ''}" data-idx="${i}" role="radio" aria-checked="${i === 0}">
            <span class="size-chip__cm">${label}</span>
            <span class="size-chip__serves">${serves}</span>
            <span class="size-chip__price price">${I18n.price(s.price)}</span>
          </button>`;
      });
      sizesHTML += '</div>';
    }

    sheetBody.innerHTML = `
      ${photoHTML}
      <h2 class="detail-name" id="detail-title" lang="${I18n.titleLang(item)}">${UI.esc(I18n.title(item))}${item.size ? ' · ' + UI.esc(item.size) : ''}</h2>
      ${sub ? `<p class="detail-sub latin" lang="tr">${UI.esc(sub)}</p>` : ''}
      ${variant ? `<p class="detail-variant">${UI.esc(variant)}</p>` : ''}
      ${soldOutHTML}
      ${desc ? `<p class="detail-desc">${UI.esc(desc)}</p>` : ''}
      ${sizesHTML || `<div class="detail-price-row"><span class="${priceClass}">${priceStr}</span></div>`}
      ${tagsHTML}
      ${Order.canAdd(item) ? `
      <div class="detail-add">
        <div class="stepper detail-add__stepper" role="group" aria-label="${UI.esc(I18n.t('order.amount'))}">
          <button type="button" data-step="-1" aria-label="${UI.esc(I18n.t('order.less'))}" disabled><i data-lucide="minus"></i></button>
          <output id="detail-qty" aria-live="polite">1</output>
          <button type="button" data-step="1" aria-label="${UI.esc(I18n.t('order.more'))}"><i data-lucide="plus"></i></button>
        </div>
        <button type="button" class="btn btn-gold btn-lg detail-add__btn" id="detail-add-btn">
          <i data-lucide="shopping-bag"></i><span>${UI.esc(I18n.t('order.add'))}</span>
        </button>
      </div>
      ${Order.qtyOf(item.id) ? `<p class="detail-inlist">${UI.esc(I18n.t('order.inList', { n: Order.qtyOf(item.id) }))}</p>` : ''}` : ''}
    `;

    UI.icons(sheetBody);

    // Size chip interaction
    if (item.sizes) {
      sheetBody.querySelectorAll('.size-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          sheetBody.querySelectorAll('.size-chip').forEach(b => {
            b.classList.remove('is-active');
            b.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-checked', 'true');
        });
      });
    }

    const qtyOut = sheetBody.querySelector('#detail-qty');
    if (qtyOut) {
      let qty = 1;
      const minus = sheetBody.querySelector('[data-step="-1"]');
      sheetBody.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
        qty = Math.max(1, Math.min(50, qty + Number(b.dataset.step)));
        qtyOut.textContent = qty;
        minus.disabled = qty <= 1;
      }));
      sheetBody.querySelector('#detail-add-btn').addEventListener('click', () => {
        let cm = null;
        if (item.sizes) {
          const active = sheetBody.querySelector('.size-chip.is-active');
          cm = item.sizes[active ? Number(active.dataset.idx) : 0].cm;
        }
        if (Order.add(item.id, { qty, cm })) {
          closeSheet();
          UI.toast(I18n.t('order.added'), 'shopping-bag');
        }
      });
    }

    scrimEl.classList.add('is-open');
    scrimEl.setAttribute('aria-hidden', 'false');
    sheetEl.classList.add('is-open');
    sheetOpen = true;
    document.body.style.overflow = 'hidden';
    sheetEl.focus();

    // Update URL hash
    history.replaceState(null, '', '#item-' + item.id);
  }

  function closeSheet() {
    if (!sheetOpen) return;
    scrimEl.classList.remove('is-open');
    scrimEl.setAttribute('aria-hidden', 'true');
    sheetEl.classList.remove('is-open');
    sheetOpen = false;
    document.body.style.overflow = '';

    // Restore hash to category or clean
    if (activeCat) history.replaceState(null, '', '#' + activeCat);
    else history.replaceState(null, '', location.pathname + location.search);

    if (focusBefore) { focusBefore.focus(); focusBefore = null; }
  }

  scrimEl.addEventListener('click', closeSheet);

  // Focus trap inside sheet
  sheetEl.addEventListener('keydown', e => {
    if (!sheetOpen) return;
    if (e.key === 'Escape' || e.key === 'Esc') { closeSheet(); e.preventDefault(); return; }
    if (e.key !== 'Tab') return;

    const focusable = sheetEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  });

  // Drag-down to close sheet (mobile)
  let dragStart = null;
  sheetEl.addEventListener('touchstart', e => {
    if (sheetEl.scrollTop > 5) return;
    dragStart = e.touches[0].clientY;
  }, { passive: true });

  sheetEl.addEventListener('touchmove', e => {
    if (dragStart === null) return;
    const dy = e.touches[0].clientY - dragStart;
    if (dy > 80) { closeSheet(); dragStart = null; }
  }, { passive: true });

  sheetEl.addEventListener('touchend', () => { dragStart = null; }, { passive: true });

  // Back button closes sheet
  window.addEventListener('popstate', () => {
    if (sheetOpen) closeSheet();
  });

  /* -------- Item click -> open sheet -------- */
  mainEl.addEventListener('click', e => {
    const add = e.target.closest('.add-btn');
    if (add) {
      const item = Store.item(add.dataset.add);
      // Dishes sold by length need a length first: the panel asks for it.
      if (item && item.sizes) { openSheet(item.id); return; }
      if (Order.add(add.dataset.add)) {
        add.classList.remove('is-pop'); void add.offsetWidth; add.classList.add('is-pop');
      }
      return;
    }
    const card = e.target.closest('.food-card, .drink-row');
    if (!card) return;
    openSheet(card.dataset.item);
  });
  mainEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('.add-btn')) return;
    const card = e.target.closest('.food-card, .drink-row');
    if (!card) return;
    e.preventDefault();
    openSheet(card.dataset.item);
  });

  /* -------- Footer -------- */
  function renderFooter() {
    const info = window.TARBUS.info;
    footerPhoneEl.textContent = info.phoneDisplay;
    footerAddrEl.textContent = I18n.lang === 'ar' ? info.addressAr : info.address;
    footerAddrEl.href = 'index.html#visit';

    const status = I18n.openStatus(info.hours);
    footerHoursEl.innerHTML = `<span style="color:var(${status.open ? '--leaf' : '--ember'})">${UI.esc(status.open ? I18n.t('hours.open') : I18n.t('hours.closed'))}</span> · ${UI.esc(status.text)}`;
  }

  /* -------- Deep links: #meze, ?lang=en -------- */
  function handleHash() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    if (hash.startsWith('item-')) {
      // Open item detail after a short delay for rendering
      requestAnimationFrame(() => openSheet(hash.replace('item-', '')));
      return;
    }
    // Scroll to category section
    const sec = document.getElementById('section-' + hash);
    if (sec) {
      requestAnimationFrame(() => sec.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  /* -------- Live updates from owner page -------- */
  window.addEventListener('menuchange', () => {
    renderSections();
    renderSidebar();
  });

  /* -------- Language change -------- */
  window.addEventListener('langchange', () => {
    render();
    renderFooter();
    // Update page title
    document.title = I18n.t('menu.title') + ' — Tarbuş Restaurant';
  });

  /* -------- Dish list: bar, panel, badges -------- */
  const orderBar = $('#order-bar');
  const orderScrim = $('#order-scrim');
  const orderSheet = $('#order-sheet');
  const orderBody = $('#order-body');
  let orderOpen = false;
  let orderFocusBefore = null;
  let confirmingClear = false;

  const countLabel = n => I18n.t(n === 1 ? 'order.count.1' : 'order.count.n', { n });
  const askLabel = n => I18n.t(n === 1 ? 'order.plusAsk.1' : 'order.plusAsk.n', { n });

  function renderOrderBar() {
    const n = Order.count();
    orderBar.hidden = n === 0;
    document.body.classList.toggle('has-order', n > 0);
    if (!n) return;
    const t = Order.total();
    $('#order-bar-count').textContent = n;
    $('#order-bar-total').textContent = countLabel(n) + ' · ' + (t.sum ? I18n.price(t.sum) : I18n.t('price.ask'));
  }

  function updateBadges() {
    mainEl.querySelectorAll('.add-btn').forEach(b => {
      const n = Order.qtyOf(b.dataset.add);
      b.classList.toggle('has-qty', n > 0);
      b.querySelector('.add-btn__qty').textContent = n || '';
    });
  }

  function renderOrderSheet() {
    const lines = Order.lines();
    if (!lines.length) {
      orderBody.innerHTML = `<div class="order-empty">
        <i data-lucide="shopping-bag"></i>
        <strong>${UI.esc(I18n.t('order.empty'))}</strong>
        <p>${UI.esc(I18n.t('order.emptySub'))}</p>
      </div>`;
      UI.icons(orderBody);
      return;
    }
    const meta = Order.meta();
    const t = Order.total();
    orderBody.innerHTML = `
      <ul class="order-lines">
        ${lines.map(l => {
          const sub = I18n.alt(l.item);
          const name = I18n.title(l.item) + (l.sizeTxt ? ' · ' + l.sizeTxt : '');
          const thumb = l.item.photo
            ? `<img src="${UI.esc(l.item.photo)}" alt="" loading="lazy">`
            : `<img class="nophoto__logo" src="assets/brand/tarbus-logo.png" alt="${UI.esc(I18n.t('photo.none'))}" title="${UI.esc(I18n.t('photo.none'))}">`;
          const priced = l.lineTotal != null;
          return `<li class="order-line" data-key="${UI.esc(l.key)}">
            <div class="order-line__thumb">${thumb}</div>
            <div class="order-line__info">
              <span class="order-line__name" lang="${I18n.titleLang(l.item)}">${UI.esc(name)}</span>
              ${sub ? `<span class="order-line__sub latin" lang="tr">${UI.esc(sub)}</span>` : ''}
              <span class="${priced ? 'price' : 'price is-ask'} order-line__price">${priced ? I18n.price(l.lineTotal) : UI.esc(I18n.t('price.ask'))}</span>
            </div>
            <div class="order-line__qty stepper" role="group" aria-label="${UI.esc(I18n.t('order.amount'))}">
              <button type="button" data-q="-1" aria-label="${UI.esc(l.qty === 1 ? I18n.t('order.remove', { name }) : I18n.t('order.less'))}"><i data-lucide="${l.qty === 1 ? 'trash-2' : 'minus'}"></i></button>
              <output>${l.qty}</output>
              <button type="button" data-q="1" aria-label="${UI.esc(I18n.t('order.more'))}" ${l.qty >= 50 ? 'disabled' : ''}><i data-lucide="plus"></i></button>
            </div>
          </li>`;
        }).join('')}
      </ul>
      <div class="order-fields">
        <div class="field order-field--table">
          <label for="order-table">${UI.esc(I18n.t('order.table'))}</label>
          <input class="input" id="order-table" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="${UI.esc(I18n.t('order.tablePh'))}" value="${UI.esc(meta.table)}">
        </div>
        <div class="field">
          <label for="order-note">${UI.esc(I18n.t('order.note'))}</label>
          <input class="input" id="order-note" maxlength="200" autocomplete="off" placeholder="${UI.esc(I18n.t('order.notePh'))}" value="${UI.esc(meta.note)}">
        </div>
      </div>
      <div class="order-total">
        <span>${UI.esc(I18n.t('order.total'))}</span>
        <span class="order-total__value">
          <span class="price">${I18n.price(t.sum)}</span>
          ${t.unpriced ? `<small>${UI.esc(askLabel(t.unpriced))}</small>` : ''}
        </span>
      </div>
      <button type="button" class="btn btn-gold btn-lg order-send" id="order-send">
        <i data-lucide="message-circle"></i><span>${UI.esc(I18n.t('order.send'))}</span>
      </button>
      <ol class="order-steps">
        ${(canShareFiles()
          ? ['order.step.share1', 'order.step.share2', 'order.step.share3']
          : ['order.step.paste1', 'order.step.paste2', 'order.step.paste3'])
          .map(k => `<li>${UI.esc(I18n.t(k))}</li>`).join('')}
      </ol>
      <figure class="order-card" id="order-card"${cardUrl ? '' : ' hidden'}>
        <figcaption>${UI.esc(I18n.t('order.cardLabel'))}</figcaption>
        <div class="order-card__frame"><img id="order-card-img" alt="${UI.esc(I18n.t('order.cardLabel'))}" src="${cardUrl || ''}"></div>
      </figure>
      <a class="order-textonly" id="order-textonly" href="${UI.esc(Order.whatsappUrl())}" target="_blank" rel="noopener">
        <i data-lucide="type"></i>${UI.esc(I18n.t('order.textOnly'))}
      </a>
      <div class="order-clear">
        ${confirmingClear
          ? `<span>${UI.esc(I18n.t('order.clearSure'))}</span>
             <button type="button" class="btn btn-ghost btn-sm" data-clear="no">${UI.esc(I18n.t('order.no'))}</button>
             <button type="button" class="btn btn-quiet btn-sm order-clear__yes" data-clear="yes">${UI.esc(I18n.t('order.yes'))}</button>`
          : `<button type="button" class="order-clear__link" data-clear="ask"><i data-lucide="trash-2"></i>${UI.esc(I18n.t('order.clear'))}</button>`}
      </div>`;
    UI.icons(orderBody);
  }

  /* The order card picture is drawn ahead of time, so the phone's Share menu can open the moment Send is
     tapped (phones only allow sharing straight after a tap). */
  let cardBlob = null, cardUrl = null, cardDirty = true, cardTimer = null, cardBuilding = null;

  function canShareFiles() {
    try {
      return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] }));
    } catch (e) { return false; }
  }

  function buildCard() {
    cardDirty = false;
    const run = OrderCard.build().then(blob => {
      if (run !== cardBuilding) return;
      if (cardUrl) URL.revokeObjectURL(cardUrl);
      cardBlob = blob;
      cardUrl = blob ? URL.createObjectURL(blob) : null;
      const fig = $('#order-card'), img = $('#order-card-img');
      if (fig && img) { fig.hidden = !cardUrl; if (cardUrl) img.src = cardUrl; }
    });
    cardBuilding = run;
    return run;
  }

  function scheduleCard() {
    cardDirty = true;
    clearTimeout(cardTimer);
    if (orderOpen && Order.count()) cardTimer = setTimeout(buildCard, 160);
  }

  /* Send: the picture travels with the message.
     Phones: the Share menu opens with the card and the message attached; the guest picks WhatsApp and the
     Tarbuş chat. A website cannot attach a picture to a WhatsApp chat link, so this is the shortest way.
     Computers: the card is copied, the chat opens with the message written, and the guest pastes it. */
  async function sendOrder() {
    const waUrl = Order.whatsappUrl();
    if (canShareFiles()) {
      if (cardDirty || !cardBlob) { clearTimeout(cardTimer); await buildCard(); }
      if (cardBlob) {
        const file = new File([cardBlob], OrderCard.fileName(), { type: 'image/png' });
        try {
          await navigator.share({ files: [file], text: Order.message() });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      window.open(waUrl, '_blank', 'noopener');
      return;
    }

    // The copy starts inside the tap (browsers require that), before the WhatsApp tab takes focus.
    let copying = null;
    if (navigator.clipboard && window.ClipboardItem) {
      const png = (cardDirty || !cardBlob)
        ? (clearTimeout(cardTimer), buildCard().then(() => cardBlob || Promise.reject(new Error('no card'))))
        : Promise.resolve(cardBlob);
      try { copying = navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); } catch (e) { copying = null; }
    }
    window.open(waUrl, '_blank', 'noopener');
    if (!copying) return;
    copying.then(
      () => UI.toast(I18n.t(/Mac|iPhone|iPad/.test(navigator.platform) ? 'order.copiedMac' : 'order.copied'), 'clipboard-check'),
      () => {}
    );
  }

  function openOrder() {
    if (sheetOpen) closeSheet();
    confirmingClear = false;
    renderOrderSheet();
    orderFocusBefore = document.activeElement;
    orderScrim.classList.add('is-open');
    orderScrim.setAttribute('aria-hidden', 'false');
    orderSheet.classList.add('is-open');
    orderBar.setAttribute('aria-expanded', 'true');
    orderOpen = true;
    document.body.style.overflow = 'hidden';
    orderSheet.focus();
    history.replaceState(null, '', '#order');
    scheduleCard();
  }

  function closeOrder() {
    if (!orderOpen) return;
    orderScrim.classList.remove('is-open');
    orderScrim.setAttribute('aria-hidden', 'true');
    orderSheet.classList.remove('is-open');
    orderBar.setAttribute('aria-expanded', 'false');
    orderOpen = false;
    document.body.style.overflow = '';
    history.replaceState(null, '', activeCat ? '#' + activeCat : location.pathname + location.search);
    if (orderFocusBefore && document.contains(orderFocusBefore) && orderFocusBefore !== document.body) orderFocusBefore.focus();
    else if (!orderBar.hidden) orderBar.focus();
  }

  orderBar.addEventListener('click', openOrder);
  orderScrim.addEventListener('click', closeOrder);
  $('#order-close').addEventListener('click', closeOrder);

  orderBody.addEventListener('click', e => {
    const q = e.target.closest('[data-q]');
    if (q) {
      const key = q.closest('.order-line').dataset.key;
      const line = Order.lines().find(l => l.key === key);
      if (line) Order.setQty(key, line.qty + Number(q.dataset.q));
      return;
    }
    if (e.target.closest('#order-send')) { sendOrder(); return; }
    const c = e.target.closest('[data-clear]');
    if (c) {
      if (c.dataset.clear === 'ask') confirmingClear = true;
      else if (c.dataset.clear === 'no') confirmingClear = false;
      else { confirmingClear = false; Order.clear(); return; }
      renderOrderSheet();
      const again = orderBody.querySelector('[data-clear]');
      if (again) again.focus();
    }
  });

  orderBody.addEventListener('input', e => {
    if (e.target.id === 'order-table') Order.setMeta({ table: e.target.value });
    if (e.target.id === 'order-note') Order.setMeta({ note: e.target.value });
    const textOnly = $('#order-textonly');
    if (textOnly) textOnly.href = Order.whatsappUrl();
    scheduleCard();
  });

  orderSheet.addEventListener('keydown', e => {
    if (!orderOpen) return;
    if (e.key === 'Escape') { closeOrder(); e.preventDefault(); return; }
    if (e.key !== 'Tab') return;
    const f = orderSheet.querySelectorAll('button:not([disabled]), [href], input');
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
  });

  let orderDrag = null;
  orderSheet.addEventListener('touchstart', e => { if (orderSheet.scrollTop <= 5) orderDrag = e.touches[0].clientY; }, { passive: true });
  orderSheet.addEventListener('touchmove', e => {
    if (orderDrag !== null && e.touches[0].clientY - orderDrag > 80) { closeOrder(); orderDrag = null; }
  }, { passive: true });
  orderSheet.addEventListener('touchend', () => { orderDrag = null; }, { passive: true });
  window.addEventListener('popstate', () => { if (orderOpen) closeOrder(); });

  window.addEventListener('orderchange', () => {
    renderOrderBar();
    updateBadges();
    if (!orderOpen) return;
    scheduleCard();
    const act = document.activeElement;
    const line = act && act.closest ? act.closest('.order-line') : null;
    const focusKey = line ? line.dataset.key : null;
    const focusQ = act && act.dataset ? act.dataset.q : null;
    renderOrderSheet();
    const el = focusKey && orderBody.querySelector(`.order-line[data-key="${CSS.escape(focusKey)}"] [data-q="${focusQ}"]`);
    if (el) el.focus(); else orderSheet.focus();
  });
  window.addEventListener('langchange', () => { renderOrderBar(); if (orderOpen) renderOrderSheet(); });
  window.addEventListener('menuchange', () => { renderOrderBar(); if (orderOpen) renderOrderSheet(); });


  /* -------- Init -------- */
  I18n.mountSwitcher($('#lang-mount'));
  render();
  renderFooter();
  Order.bindWhatsApp(footerPhoneEl);
  renderOrderBar();
  UI.icons(document);
  if (location.hash === '#order') requestAnimationFrame(openOrder);
  else handleHash();

  // Set the page title
  document.title = I18n.t('menu.title') + ' — Tarbuş Restaurant';
})();
