/*
 * The menu as the restaurant runs it: the dishes in js/menu-data.js plus the owner's changes.
 *   overrides  { id: { price, soldOut, hidden, deleted, purged, tr, en, ar, desc, cat, photo, tags, variant } }
 *   custom     [ dishes the owner added, same shape as menu-data items ]
 * Demo storage: this browser's localStorage only. A real version keeps these on a server so every guest sees them.
 */
(function () {
  const KEY = 'tarbus.overrides';
  const CUSTOM = 'tarbus.custom';
  const STAMP = 'tarbus.updatedAt';
  const CONTENT = ['tr', 'en', 'ar', 'desc', 'cat', 'photo', 'tags', 'variant', 'price'];
  const TAGS = ['veg', 'spicy', 'signature'];

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
  }
  const readOverrides = () => load(KEY, {}) || {};
  const readCustom = () => (Array.isArray(load(CUSTOM, [])) ? load(CUSTOM, []) : []);

  /* Saves both stores; false when the browser is out of room (large photos). */
  function write(overrides, custom) {
    try {
      if (overrides) localStorage.setItem(KEY, JSON.stringify(overrides));
      if (custom) localStorage.setItem(CUSTOM, JSON.stringify(custom));
      localStorage.setItem(STAMP, new Date().toISOString());
    } catch (e) {
      return false;
    }
    fire();
    return true;
  }

  function fire() { window.dispatchEvent(new CustomEvent('menuchange')); }

  const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const baseById = () => Object.fromEntries(window.TARBUS.items.map(i => [i.id, i]));
  const catKind = cat => (window.TARBUS.categories.find(c => c.id === cat) || {}).kind || 'food';

  /* Keeps only fields a dish may have, in the shapes the pages expect. */
  function clean(patch) {
    const out = {};
    const str = (v, max) => String(v ?? '').trim().slice(0, max);
    const tri = (v, max) => (v && typeof v === 'object')
      ? { tr: str(v.tr, max), en: str(v.en, max), ar: str(v.ar, max) } : null;
    for (const k of ['tr', 'en', 'ar']) if (k in patch) out[k] = str(patch[k], 80) || null;
    if ('desc' in patch) { const d = tri(patch.desc, 240); out.desc = d && (d.tr || d.en || d.ar) ? d : null; }
    if ('variant' in patch) { const v = tri(patch.variant, 60); out.variant = v && (v.tr || v.en || v.ar) ? v : null; }
    if ('cat' in patch && window.TARBUS.categories.some(c => c.id === patch.cat)) out.cat = patch.cat;
    if ('photo' in patch) {
      const p = patch.photo;
      out.photo = typeof p === 'string' && (p.startsWith('assets/') || p.startsWith('data:image/')) ? p : null;
    }
    if ('tags' in patch && Array.isArray(patch.tags)) out.tags = TAGS.filter(t => patch.tags.includes(t));
    if ('price' in patch) {
      const n = patch.price;
      out.price = n === null || n === '' ? null : (Number.isFinite(Number(n)) && Number(n) >= 0 ? Math.round(Number(n)) : null);
    }
    for (const k of ['soldOut', 'hidden', 'purged']) if (k in patch) out[k] = !!patch[k];
    if ('deleted' in patch) out.deleted = patch.deleted ? String(patch.deleted) : null;
    return out;
  }

  /* Drops changes that match the original dish, so the overrides stay small and "changed" means changed. */
  function tidy(next, base) {
    for (const k of CONTENT) if (k in next && base && same(next[k], base[k])) delete next[k];
    if (!next.soldOut) delete next.soldOut;
    if (!next.hidden) delete next.hidden;
    if (!next.deleted) delete next.deleted;
    if (!next.purged) delete next.purged;
    return next;
  }

  function merged(opts = {}) {
    const o = readOverrides();
    const all = [...window.TARBUS.items, ...readCustom().map(c => ({ ...c, custom: true }))];
    const out = [];
    for (const it of all) {
      const ch = o[it.id] || {};
      if (ch.purged) continue;
      const deleted = ch.deleted || null;
      if (deleted && !opts.trash) continue;
      if (!deleted && opts.trash) continue;
      const m = { ...it, original: it.price };
      for (const k of CONTENT) if (k in ch) m[k] = ch[k];
      m.kind = catKind(m.cat);
      m.tags = m.tags || [];
      m.soldOut = !!ch.soldOut;
      m.hidden = !!ch.hidden;
      m.deletedAt = deleted;
      m.edited = CONTENT.some(k => k in ch);
      out.push(m);
    }
    return out;
  }

  const Store = {
    overrides: readOverrides,

    /* Every dish on the menu (not in the trash), with the owner's changes applied. */
    items() { return merged(); },

    item(id) { return merged().find(i => i.id === id); },

    /* Dishes in the trash, most recently deleted first. */
    trash() { return merged({ trash: true }).sort((a, b) => String(b.deletedAt).localeCompare(String(a.deletedAt))); },

    /* Dishes guests should see in a category, sold-out ones last. */
    visible(cat) {
      return merged()
        .filter(i => !i.hidden && (!cat || i.cat === cat))
        .sort((a, b) => Number(a.soldOut) - Number(b.soldOut));
    },

    set(id, patch) { return Store.setMany({ [id]: patch }); },

    /* Quick changes from the list (price, sold out, hidden), several dishes at once. */
    setMany(patches) {
      const o = readOverrides();
      const base = baseById();
      const custom = readCustom();
      for (const [id, patch] of Object.entries(patches)) {
        const c = custom.find(x => x.id === id);
        const p = clean(patch);
        if (c && 'price' in p) { c.price = p.price; delete p.price; }
        const next = tidy({ ...(o[id] || {}), ...p }, base[id]);
        if (Object.keys(next).length) o[id] = next; else delete o[id];
      }
      return write(o, custom);
    },

    /* Saves the editor: every field of one dish. */
    update(id, patch) {
      const p = clean(patch);
      const custom = readCustom();
      const c = custom.find(x => x.id === id);
      if (c) {
        for (const k of CONTENT) if (k in p) { c[k] = p[k]; delete p[k]; }
        c.kind = catKind(c.cat);
      }
      const o = readOverrides();
      const next = tidy({ ...(o[id] || {}), ...p }, baseById()[id]);
      if (Object.keys(next).length) o[id] = next; else delete o[id];
      return write(o, custom);
    },

    /* Adds a new dish; returns its id, or null when it could not be saved. */
    add(data) {
      const p = clean(data);
      if (!p.tr || !p.cat) return null;
      const slug = p.tr.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'dish';
      const id = 'c-' + slug + '-' + Math.random().toString(36).slice(2, 6);
      const custom = readCustom();
      custom.push({
        id, cat: p.cat, kind: catKind(p.cat), tr: p.tr, en: p.en || null, ar: p.ar || null,
        desc: p.desc || null, variant: p.variant || null, price: 'price' in p ? p.price : null,
        photo: p.photo || null, tags: p.tags || [], createdAt: new Date().toISOString()
      });
      const o = readOverrides();
      const status = tidy({ soldOut: p.soldOut, hidden: p.hidden }, null);
      if (Object.keys(status).length) o[id] = status;
      return write(o, custom) ? id : null;
    },

    /* To the trash: gone from the menu and guests' lists, until restored. */
    remove(id) { return Store.update(id, { deleted: new Date().toISOString() }); },

    restore(id) { return Store.update(id, { deleted: null }); },

    /* Out of the trash for good. Added dishes are erased; original menu dishes stay recorded as removed. */
    purge(id) {
      const o = readOverrides();
      const custom = readCustom();
      const i = custom.findIndex(x => x.id === id);
      if (i >= 0) { custom.splice(i, 1); delete o[id]; } else o[id] = { purged: true };
      return write(o, custom);
    },

    reset() {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem(CUSTOM);
        localStorage.setItem(STAMP, new Date().toISOString());
      } catch (e) { /* ignore */ }
      fire();
    },

    updatedAt() {
      try { return localStorage.getItem(STAMP); } catch (e) { return null; }
    },

    export() {
      return JSON.stringify({
        app: 'tarbus-menu', version: 2, exportedAt: new Date().toISOString(),
        overrides: readOverrides(), custom: readCustom()
      }, null, 2);
    },

    /* Accepts a file made by export() (version 1 or 2); throws on anything else. Returns the number of dishes changed. */
    import(json) {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data || data.app !== 'tarbus-menu' || typeof data.overrides !== 'object') throw new Error('not a Tarbuş menu file');
      const custom = [];
      for (const c of Array.isArray(data.custom) ? data.custom : []) {
        if (!c || typeof c.id !== 'string' || !c.id.startsWith('c-')) continue;
        const p = clean(c);
        if (!p.tr || !p.cat) continue;
        custom.push({ id: c.id, kind: catKind(p.cat), tags: [], desc: null, variant: null, photo: null, price: null, en: null, ar: null, ...p, createdAt: c.createdAt || null });
      }
      const known = new Set([...window.TARBUS.items.map(i => i.id), ...custom.map(c => c.id)]);
      const base = baseById();
      const overrides = {};
      for (const [id, ch] of Object.entries(data.overrides)) {
        if (!known.has(id) || !ch || typeof ch !== 'object') continue;
        const next = tidy(clean(ch), base[id]);
        if (Object.keys(next).length) overrides[id] = next;
      }
      if (!write(overrides, custom)) throw new Error('storage full');
      return Object.keys(overrides).length + custom.length;
    }
  };

  // The owner page saved changes in another tab.
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === CUSTOM || e.key === null) fire(); });

  window.Store = Store;
})();
