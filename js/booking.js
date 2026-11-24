/*
 * Tarbuş — Booking form & WhatsApp URL builder
 * Custom calendar, time slot chips, validation and WhatsApp deep link.
 */
(function () {
  'use strict';

  const info = window.TARBUS.info;

  /* ---- i18n strings ---- */
  I18n.add({
    'cal.prev': { tr: 'Önceki ay', en: 'Previous month', ar: 'الشهر السابق' },
    'cal.next': { tr: 'Sonraki ay', en: 'Next month', ar: 'الشهر التالي' },
    'booking.pickDateFirst': { tr: 'Saatleri görmek için önce bir tarih seçin.', en: 'Pick a date first to see the times.', ar: 'اختر تاريخاً أولاً لعرض الأوقات.' },
    'booking.title':      { tr: 'Masa ayırtın', en: 'Book a table', ar: 'احجز طاولة' },
    'booking.sub':        { tr: 'WhatsApp üzerinden hızlıca rezervasyon yapın.', en: 'Quick booking via WhatsApp.', ar: 'حجز سريع عبر واتساب.' },
    'booking.name':       { tr: 'Adınız', en: 'Your name', ar: 'اسمك' },
    'booking.namePh':     { tr: 'Ad Soyad', en: 'Full name', ar: 'الاسم الكامل' },
    'booking.guests':     { tr: 'Kişi sayısı', en: 'Guests', ar: 'عدد الأشخاص' },
    'booking.date':       { tr: 'Tarih', en: 'Date', ar: 'التاريخ' },
    'booking.time':       { tr: 'Saat', en: 'Time', ar: 'الوقت' },
    'booking.note':       { tr: 'Not', en: 'Note', ar: 'ملاحظة' },
    'booking.notePh':     { tr: 'Özel istek, beyti uzunluğu...', en: 'Special requests, beyti length...', ar: 'طلبات خاصة، طول البيتي...' },
    'booking.send':       { tr: 'WhatsApp ile gönder', en: 'Send via WhatsApp', ar: 'أرسل عبر واتساب' },
    'booking.successTitle': { tr: 'Mesajınız hazır!', en: 'Your message is ready!', ar: 'رسالتك جاهزة!' },
    'booking.successSub': { tr: 'WhatsApp açıldı. Mesajı gönderin, biz de en kısa sürede dönelim.', en: 'WhatsApp opened. Send the message and we\'ll get back to you.', ar: 'تم فتح واتساب. أرسل الرسالة وسنعود إليك.' },
    'booking.another':    { tr: 'Yeni rezervasyon', en: 'New booking', ar: 'حجز جديد' },
    'err.nameReq':        { tr: 'Lütfen adınızı girin.', en: 'Please enter your name.', ar: 'يرجى إدخال اسمك.' },
    'err.dateReq':        { tr: 'Lütfen bir tarih seçin.', en: 'Please pick a date.', ar: 'يرجى اختيار تاريخ.' },
    'err.timeReq':        { tr: 'Lütfen bir saat seçin.', en: 'Please pick a time.', ar: 'يرجى اختيار وقت.' },
  });

  /* ---- Calendar state ---- */
  const calEl = document.getElementById('book-calendar');
  const now = new Date();
  let calYear = now.getFullYear();
  let calMonth = now.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  const WDAYS_TR = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  const WDAYS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const WDAYS_AR = ['اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'];

  function monthName(m) {
    if (I18n.lang === 'en') return MONTHS_EN[m];
    if (I18n.lang === 'ar') return MONTHS_AR[m];
    return MONTHS_TR[m];
  }
  function weekdayNames() {
    if (I18n.lang === 'en') return WDAYS_EN;
    if (I18n.lang === 'ar') return WDAYS_AR;
    return WDAYS_TR;
  }

  function renderCalendar() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    // Monday=0 in our grid. JS getDay: 0=Sun
    let startCol = firstDay.getDay() - 1;
    if (startCol < 0) startCol = 6;

    const canPrev = !(calYear === today.getFullYear() && calMonth === today.getMonth());

    const wdays = weekdayNames();

    let html = `<div class="cal-header">
      <button type="button" class="cal-nav" id="cal-prev" ${canPrev ? '' : 'disabled'} aria-label="${I18n.t('cal.prev')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="cal-header__title">${monthName(calMonth)} ${calYear}</span>
      <button type="button" class="cal-nav" id="cal-next" aria-label="${I18n.t('cal.next')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
    </div>`;

    html += `<div class="cal-weekdays">${wdays.map(d => `<span>${d}</span>`).join('')}</div>`;
    html += '<div class="cal-days">';

    // Empty cells before first day
    for (let e = 0; e < startCol; e++) {
      html += '<button type="button" class="cal-day cal-day--empty" disabled tabindex="-1"></button>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      date.setHours(0,0,0,0);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isSel = selectedDate && date.getTime() === selectedDate.getTime();
      const cls = ['cal-day'];
      if (isToday) cls.push('is-today');
      if (isSel) cls.push('is-selected');
      html += `<button type="button" class="${cls.join(' ')}" data-day="${d}" ${isPast ? 'disabled' : ''} aria-label="${d} ${monthName(calMonth)}">${d}</button>`;
    }

    html += '</div>';
    calEl.innerHTML = html;

    // Events
    calEl.querySelector('#cal-prev').addEventListener('click', () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    });
    calEl.querySelector('#cal-next').addEventListener('click', () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });
    calEl.querySelectorAll('.cal-day:not(:disabled):not(.cal-day--empty)').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = parseInt(btn.dataset.day);
        selectedDate = new Date(calYear, calMonth, d);
        selectedDate.setHours(0,0,0,0);
        renderCalendar();
        renderTimeSlots();
        clearError('date');
      });
    });
  }
  renderCalendar();

  /* ---- Time slots ---- */
  function getOpenHours(date) {
    const h = info.hours.find(h => h.day === date.getDay());
    if (!h) return null;
    return h;
  }

  function renderTimeSlots() {
    const el = document.getElementById('time-chips');
    if (!selectedDate) {
      el.innerHTML = `<span style="color:var(--ink-3);font-size:var(--step--1)">${I18n.t('booking.pickDateFirst')}</span>`;
      return;
    }
    const h = getOpenHours(selectedDate);
    if (!h) {
      el.innerHTML = `<span style="color:var(--ink-3);font-size:var(--step--1)">${I18n.t('hours.closed')}</span>`;
      return;
    }

    const [oh, om] = h.open.split(':').map(Number);
    const [ch, cm] = h.close.split(':').map(Number);
    let closeMin = ch * 60 + cm;
    const openMin = oh * 60 + om;
    if (closeMin <= openMin) closeMin += 24 * 60; // past midnight

    const slots = [];
    // Last booking slot: 1 hour before close
    const lastSlot = closeMin - 60;
    for (let m = openMin; m <= lastSlot; m += 30) {
      const hh = Math.floor(m / 60) % 24;
      const mm = m % 60;
      slots.push(String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0'));
    }

    el.innerHTML = slots.map(s =>
      `<button type="button" class="time-chip${selectedTime === s ? ' is-active' : ''}" data-time="${s}">${s}</button>`
    ).join('');

    el.querySelectorAll('.time-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedTime = btn.dataset.time;
        el.querySelectorAll('.time-chip').forEach(b => b.classList.toggle('is-active', b.dataset.time === selectedTime));
        clearError('time');
      });
    });
  }
  renderTimeSlots();

  /* ---- Stepper ---- */
  const guestInput = document.getElementById('book-guests');
  const stepper = document.getElementById('guest-stepper');
  const stepMinus = stepper.querySelector('.stepper-minus');
  const stepPlus = stepper.querySelector('.stepper-plus');

  function updateStepper() {
    const v = parseInt(guestInput.value) || 1;
    stepMinus.disabled = v <= 1;
    stepPlus.disabled = v >= 20;
  }
  stepMinus.addEventListener('click', () => {
    guestInput.value = Math.max(1, (parseInt(guestInput.value) || 2) - 1);
    updateStepper();
  });
  stepPlus.addEventListener('click', () => {
    guestInput.value = Math.min(20, (parseInt(guestInput.value) || 2) + 1);
    updateStepper();
  });
  guestInput.addEventListener('change', () => {
    let v = parseInt(guestInput.value);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 20) v = 20;
    guestInput.value = v;
    updateStepper();
  });
  updateStepper();

  /* ---- Validation ---- */
  function showError(field, key) {
    const el = document.getElementById('err-' + field);
    const wrap = document.getElementById('field-' + field);
    if (el) el.textContent = I18n.t(key);
    if (wrap) wrap.classList.add('has-error');
  }
  function clearError(field) {
    const el = document.getElementById('err-' + field);
    const wrap = document.getElementById('field-' + field);
    if (el) el.textContent = '';
    if (wrap) wrap.classList.remove('has-error');
  }

  /* ---- WhatsApp message ----
     The staff read it in English, Turkish or Arabic, so every booking carries all three, under one header
     with a short number they can answer with ("R4821 confirmed"). The guest's note is their own words and
     appears once, untranslated. */
  const BOOK = {
    en: { title: 'ENGLISH', ask: 'Table booking request', name: 'Name', guests: 'Guests', people: n => n === 1 ? '1 person' : `${n} people`, date: 'Date', time: 'Time', locale: 'en-GB' },
    tr: { title: 'TÜRKÇE', ask: 'Masa rezervasyonu talebi', name: 'Ad', guests: 'Kişi', people: n => `${n} kişi`, date: 'Tarih', time: 'Saat', locale: 'tr-TR' },
    ar: { title: 'العربية', ask: 'طلب حجز طاولة', name: 'الاسم', guests: 'عدد الأشخاص', people: n => n === 1 ? 'شخص واحد' : n === 2 ? 'شخصان' : n <= 10 ? `${n} أشخاص` : `${n} شخصاً`, date: 'التاريخ', time: 'الوقت', locale: 'ar' }
  };

  function bookingMessage(data) {
    const ref = 'R' + String(1000 + Math.floor(Math.random() * 9000));
    const head = [`*TARBUŞ · Booking / Rezervasyon / حجز · ${ref}*`];
    head.push(`${data.date.toLocaleDateString('tr-TR')} · ${data.time} · ${data.people} kişi / people / أشخاص`);
    if (data.note) head.push(`Note / Not / ملاحظة: _${data.note}_`);

    const section = lang => {
      const b = BOOK[lang];
      const day = data.date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : b.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn' });
      return [
        `*${b.title}*`,
        b.ask,
        `${b.name}: ${data.name}`,
        `${b.guests}: ${b.people(data.people)}`,
        `${b.date}: ${day}`,
        `${b.time}: ${data.time}`
      ].join('\n');
    };
    return [head.join('\n'), section('en'), section('tr'), section('ar')].join('\n\n');
  }

  function buildWhatsAppUrl(data) {
    const phone = info.phone.replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(bookingMessage(data))}`;
  }

  /* ---- Form submit ---- */
  const form = document.getElementById('booking-form');
  const successEl = document.getElementById('booking-success');

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('book-name').value.trim();
    if (!name) { showError('name', 'err.nameReq'); valid = false; } else clearError('name');

    if (!selectedDate) { showError('date', 'err.dateReq'); valid = false; } else clearError('date');
    if (!selectedTime) { showError('time', 'err.timeReq'); valid = false; } else clearError('time');

    if (!valid) return;

    const people = parseInt(guestInput.value) || 2;
    const note = document.getElementById('book-note').value.trim();

    const url = buildWhatsAppUrl({ name, people, date: selectedDate, time: selectedTime, note });
    window.open(url, '_blank');

    form.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ block: 'center' });
  });

  // Reset
  document.getElementById('booking-again').addEventListener('click', () => {
    form.hidden = false;
    successEl.hidden = true;
    form.reset();
    selectedDate = null;
    selectedTime = null;
    guestInput.value = 2;
    updateStepper();
    renderCalendar();
    renderTimeSlots();
  });

  // Clear validation on input
  document.getElementById('book-name').addEventListener('input', () => clearError('name'));

  /* ---- Re-render on lang change ---- */
  window.addEventListener('langchange', () => {
    renderCalendar();
    renderTimeSlots();
  });

  /* Expose for the Beyti book button in home.js */
  window.Booking = { whatsappUrl: buildWhatsAppUrl };
})();
