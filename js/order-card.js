/*
 * Draws the guest's dish list as a picture for WhatsApp: logo, each dish with its photo and its name in
 * English, Turkish and Arabic, amounts, prices, total, table and note.
 * OrderCard.build() resolves to a PNG Blob, or null when the browser cannot make one.
 */
(function () {
  const W = 1080;
  const PAD = 56;
  const ROW_H = 200;
  const ROW_GAP = 16;
  const C = {
    ground: '#15100d', ground2: '#1e1713', ground3: '#2a201a',
    ink: '#f3ebdd', ink2: '#c9bca7', ink3: '#9e9282',
    gold: '#d4a64a', goldHi: '#e8c271', onGold: '#1a120a', line: 'rgba(243,235,221,0.14)'
  };
  const F = {
    display: s => `${s}px Gloock, "Times New Roman", serif`,
    text: (w, s) => `${w} ${s}px Manrope, "IBM Plex Sans Arabic", system-ui, sans-serif`,
    ar: (w, s) => `${w} ${s}px "IBM Plex Sans Arabic", "Noto Kufi Arabic", sans-serif`
  };

  const images = new Map();
  function loadImg(src) {
    if (!images.has(src)) {
      images.set(src, new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      }));
    }
    return images.get(src);
  }

  let fontsReady = null;
  function fonts() {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load(F.display(44), 'Hummus'),
        document.fonts.load(F.text(700, 30), 'Aşğ'),
        document.fonts.load(F.text(800, 30), '0'),
        document.fonts.load(F.text(500, 28), 'Aşğ'),
        document.fonts.load(F.ar(600, 30), 'حمص')
      ]).catch(() => null);
    }
    return fontsReady;
  }

  function fit(ctx, text, max) {
    if (ctx.measureText(text).width <= max) return text;
    while (text.length > 1 && ctx.measureText(text + '…').width > max) text = text.slice(0, -1);
    return text + '…';
  }

  function wrap(ctx, text, max, maxLines) {
    const words = text.split(/\s+/);
    const out = [];
    let line = '';
    for (const w of words) {
      const next = line ? line + ' ' + w : w;
      if (ctx.measureText(next).width > max && line) { out.push(line); line = w; } else line = next;
    }
    if (line) out.push(line);
    if (out.length > maxLines) {
      out.length = maxLines;
      out[maxLines - 1] = fit(ctx, out[maxLines - 1] + '…', max);
    }
    return out;
  }

  function box(ctx, x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  const price = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₺';

  async function draw(withImages) {
    await fonts();
    const lines = Order.lines();
    const meta = Order.meta();
    const total = Order.total();
    const note = meta.note.trim();

    const measure = document.createElement('canvas').getContext('2d');
    measure.font = F.text(500, 30);
    const noteLines = note ? wrap(measure, note, W - PAD * 2 - 64, 4) : [];

    const headH = 300;
    const rowsH = lines.length * (ROW_H + ROW_GAP);
    const noteH = note ? 96 + noteLines.length * 42 : 0;
    const totalH = total.unpriced ? 170 : 140;
    const footH = 110;
    const H = headH + rowsH + 24 + noteH + totalH + footH;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = C.ground;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 40, 10, W / 2, 40, 620);
    glow.addColorStop(0, 'rgba(212,166,74,0.16)');
    glow.addColorStop(1, 'rgba(212,166,74,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 640);

    // Header: logo, order number, time, table
    const logo = withImages ? await loadImg('assets/brand/tarbus-logo.png') : null;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (logo) {
      const lh = 132, lw = logo.width * (lh / logo.height);
      ctx.drawImage(logo, (W - lw) / 2, 40, lw, lh);
    } else {
      ctx.fillStyle = C.gold;
      ctx.font = F.display(84);
      ctx.fillText('TARBUŞ', W / 2, 140);
    }
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const facts = ['#' + Order.ref(), time];
    if (meta.table.trim()) facts.push(`Table · Masa · الطاولة  ${meta.table.trim()}`);
    ctx.font = F.text(700, 32);
    ctx.fillStyle = C.goldHi;
    ctx.fillText(facts.join('   ·   '), W / 2, 232);
    ctx.fillStyle = C.line;
    ctx.fillRect(PAD, 270, W - PAD * 2, 2);

    // Dishes
    let y = headH;
    for (const l of lines) {
      box(ctx, PAD, y, W - PAD * 2, ROW_H, 28, C.ground2);
      const tx = PAD + 24, ty = y + 26, ts = 148;
      box(ctx, tx, ty, ts, ts, 22, C.ground3);
      const photo = withImages && l.item.photo ? await loadImg(l.item.photo) : null;
      const stand = !photo && withImages ? await loadImg('assets/brand/tarbus-logo.png') : null;
      if (stand) {
        const k = (ts * 0.6) / stand.width;
        const sw = stand.width * k, sh = stand.height * k;
        ctx.globalAlpha = 0.4;
        ctx.drawImage(stand, tx + (ts - sw) / 2, ty + (ts - sh) / 2 - 10, sw, sh);
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.ink3;
        ctx.font = F.text(600, 16);
        ctx.textAlign = 'center';
        ctx.fillText('No photo · Fotoğraf yok', tx + ts / 2, ty + ts - 16);
      } else if (photo) {
        const k = Math.min((ts - 12) / photo.width, (ts - 12) / photo.height);
        const pw = photo.width * k, ph = photo.height * k;
        ctx.drawImage(photo, tx + (ts - pw) / 2, ty + (ts - ph) / 2, pw, ph);
      } else {
        ctx.fillStyle = C.ink3;
        ctx.font = F.display(70);
        ctx.textAlign = 'center';
        ctx.fillText((l.item.en || l.item.tr).replace(/^\d+\s*/, '').charAt(0), tx + ts / 2, ty + ts / 2 + 24);
      }
      // Amount badge over the photo corner
      ctx.beginPath();
      ctx.arc(tx + 10, ty + 10, 34, 0, Math.PI * 2);
      ctx.fillStyle = C.gold;
      ctx.fill();
      ctx.fillStyle = C.onGold;
      ctx.font = F.text(800, 30);
      ctx.textAlign = 'center';
      ctx.fillText(l.qty + '×', tx + 10, ty + 21);

      // Price on the right
      const right = W - PAD - 28;
      ctx.textAlign = 'right';
      let priceW;
      if (l.lineTotal != null) {
        ctx.font = F.text(800, 36);
        ctx.fillStyle = C.gold;
        ctx.fillText(price(l.lineTotal), right, y + 74);
        priceW = ctx.measureText(price(l.lineTotal)).width;
      } else {
        ctx.font = F.text(600, 24);
        ctx.fillStyle = C.ink3;
        ctx.fillText('price to confirm', right, y + 72);
        priceW = ctx.measureText('price to confirm').width;
      }

      // Names: English, Turkish, Arabic
      const nx = tx + ts + 30;
      const size = l.sizeTxt ? '  ·  ' + l.sizeTxt : '';
      ctx.textAlign = 'left';
      ctx.fillStyle = C.ink;
      ctx.font = F.display(42);
      ctx.fillText(fit(ctx, (l.item.en || l.item.tr) + size, right - priceW - 24 - nx), nx, y + 76);
      ctx.fillStyle = C.ink2;
      ctx.font = F.text(600, 30);
      ctx.fillText(fit(ctx, l.item.tr + size, right - nx), nx, y + 124);
      if (l.item.ar) {
        ctx.save();
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.fillStyle = C.ink2;
        ctx.font = F.ar(600, 33);
        ctx.fillText(fit(ctx, l.item.ar, right - nx), right, y + 170);
        ctx.restore();
      }
      y += ROW_H + ROW_GAP;
    }
    y += 8;

    // Guest's note, in their own words
    if (note) {
      box(ctx, PAD, y, W - PAD * 2, noteH - 16, 28, 'rgba(212,166,74,0.10)');
      ctx.textAlign = 'left';
      ctx.fillStyle = C.goldHi;
      ctx.font = F.text(700, 26);
      ctx.fillText('Note · Not · ملاحظة', PAD + 32, y + 50);
      ctx.fillStyle = C.ink;
      ctx.font = F.text(500, 30);
      noteLines.forEach((t, i) => ctx.fillText(t, PAD + 32, y + 96 + i * 42));
      y += noteH;
    }

    // Total
    ctx.fillStyle = C.line;
    ctx.fillRect(PAD, y + 10, W - PAD * 2, 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = C.ink2;
    ctx.font = F.text(700, 28);
    ctx.fillText('Total · Toplam · المجموع', PAD, y + 82);
    ctx.textAlign = 'right';
    ctx.fillStyle = C.gold;
    ctx.font = F.text(800, 60);
    ctx.fillText(price(total.sum), W - PAD, y + 92);
    if (total.unpriced) {
      ctx.fillStyle = C.ink3;
      ctx.font = F.text(600, 24);
      ctx.fillText(`+ ${total.unpriced} priced by the waiter · fiyatı sorulacak`, W - PAD, y + 134);
    }
    y += totalH;

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ink3;
    ctx.font = F.text(500, 22);
    const info = window.TARBUS.info;
    ctx.fillText(`${info.name} · ${info.phoneDisplay}`, W / 2, y + 56);

    return canvas;
  }

  // On pages opened straight from a file, browsers refuse to export a canvas holding local pictures;
  // the card is then drawn again with letters in place of photos.
  function toBlob(canvas) {
    return new Promise(res => {
      try { canvas.toBlob(b => res(b), 'image/png'); } catch (e) { res(null); }
    });
  }

  async function build() {
    if (!Order.lines().length || !document.createElement('canvas').getContext) return null;
    let blob = await toBlob(await draw(true));
    if (!blob) blob = await toBlob(await draw(false));
    return blob;
  }

  window.OrderCard = {
    build,
    fileName: () => `tarbus-order-${Order.ref()}.png`
  };
})();
