/*
 * Tarbuş menu, taken from their current QR menu (tarbus.qrmenu.com.tr, November 2026).
 * Alcoholic drinks are left out of this menu.
 * price: null where the old menu showed "0 TL" — shown as "ask your waiter" until the owner sets it.
 * English/Arabic names and descriptions are merged in from js/menu-text.js.
 */
(function () {
  const D = 'assets/dishes/';

  const info = {
    name: 'Tarbuş Restaurant',
    city: 'İstanbul',
    // Two branches; street addresses, hours and numbers per branch still to be confirmed with the restaurant.
    address: 'Fatih · Taksim / İstiklal, İstanbul',
    addressAr: 'الفاتح · تقسيم / الاستقلال، إسطنبول',
    branches: [
      { id: 'fatih', name: 'Fatih', nameAr: 'الفاتح', area: 'Fatih, İstanbul',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tarbu%C5%9F+Fatih+%C4%B0stanbul' },
      { id: 'taksim', name: 'Taksim / İstiklal', nameAr: 'تقسيم / شارع الاستقلال', area: 'İstiklal Caddesi, Beyoğlu, İstanbul',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tarbu%C5%9F+%C4%B0stiklal+Taksim+%C4%B0stanbul' }
    ],
    // Demo: WhatsApp messages and calls go to the site maker's number until the restaurant's own is set.
    phone: '+905340417751',
    phoneDisplay: '+90 534 041 77 51',
    // Sample hours until the restaurant confirms. day: 0 = Sunday … 6 = Saturday; close past midnight allowed.
    hours: [
      { day: 1, open: '12:00', close: '01:00' },
      { day: 2, open: '12:00', close: '01:00' },
      { day: 3, open: '12:00', close: '01:00' },
      { day: 4, open: '12:00', close: '01:00' },
      { day: 5, open: '12:00', close: '02:00' },
      { day: 6, open: '12:00', close: '02:00' },
      { day: 0, open: '12:00', close: '01:00' }
    ],
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tarbu%C5%9F+Restaurant+%C4%B0stanbul'
  };

  const categories = [
    { id: 'meze', kind: 'food', tr: 'Meze', en: 'Starters', ar: 'مقبلات', photo: D + 'humus-tereyagli.webp' },
    { id: 'sogus', kind: 'food', tr: 'Söğüş', en: 'Cheese plates', ar: 'أطباق الأجبان', photo: D + 'koy-peyniri.webp' },
    { id: 'salata', kind: 'food', tr: 'Salata', en: 'Salads', ar: 'سلطات', photo: D + 'coban-salata.webp' },
    { id: 'ara-sicak', kind: 'food', tr: 'Ara Sıcak', en: 'Hot starters', ar: 'مقبلات ساخنة', photo: D + 'ali-nazik.webp' },
    { id: 'ana-yemekler', kind: 'food', tr: 'Ana Yemekler', en: 'Grill & mains', ar: 'المشاوي والأطباق الرئيسية', photo: D + 'karisik-izgara.webp' },
    { id: 'special', kind: 'food', tr: 'Special', en: 'House specials', ar: 'أطباق مميزة', photo: D + 'trb-beyti.webp' },
    { id: 'tatli', kind: 'food', tr: 'Tatlı', en: 'Desserts', ar: 'حلويات', photo: null },
    { id: 'mesrubatlar', kind: 'drink', tr: 'Meşrubatlar', en: 'Soft drinks', ar: 'مشروبات باردة', photo: 'assets/drinks/ayran.webp' }
  ];

  // [id, Turkish name, price, photo file or '', tags, variant key]
  const food = {
    meze: [
      ['humus-tereyagli', 'Humus Tereyağlı', 300, 'humus-tereyagli', 'veg'],
      ['humus-zeytinyagli', 'Humus Zeytinyağlı', 230, 'humus-zeytinyagli', 'veg'],
      ['suzme-yogurt', 'Süzme Yoğurt', 210, 'suzme-yogurt', 'veg'],
      ['cevizli-biber', 'Cevizli Biber', 275, 'cevizli-biber', 'veg'],
      ['tarator', 'Tarator', 230, 'tarator', 'veg'],
      ['babagannuc', 'Babagannuç', 230, 'babagannuc', 'veg'],
      ['prenses', 'Prenses', 230, 'prenses', 'veg'],
      ['zengin', 'Zengin', 230, 'zengin', 'veg'],
      ['biber-yogurtlama', 'Biber Yoğurtlama', 230, 'biber-yogurtlama', 'veg'],
      ['havuc-yogurtlama', 'Havuç Yoğurtlama', 230, 'havuc-yogurtlama', 'veg'],
      ['zeytin-salatasi', 'Zeytin Salatası', 230, 'zeytin-salatasi', 'veg'],
      ['barbunya', 'Barbunya', 260, 'barbunya', 'veg'],
      ['soslu-patlican', 'Soslu Patlıcan', 240, 'soslu-patlican', 'veg'],
      ['saksuka', 'Şakşuka', 230, 'saksuka', 'veg'],
      ['rus-salatasi', 'Rus Salatası', 230, 'rus-salatasi', 'veg'],
      ['taze-cokelek-salatasi', 'Taze Çökelek Salatası', 230, 'taze-cokelek-salatasi', 'veg'],
      ['kuru-cokelek-salatasi', 'Kuru Çökelek Salatası', 230, 'kuru-cokelek-salatasi', 'veg'],
      ['surk', 'Sürk', 230, 'surk', 'veg'],
      ['atom', 'Atom', 250, '', 'veg spicy'],
      ['patlican-yogurtlama', 'Patlıcan Yoğurtlama', 230, '', 'veg'],
      ['cacik', 'Cacık', 230, '', 'veg'],
      ['tebbule', 'Tebbule', 230, '', 'veg'],
      ['kekik-salatasi', 'Kekik Salatası', 250, '', 'veg']
    ],
    sogus: [
      ['lavas-peynir', 'Lavaş Peynir', 400, '', 'veg'],
      ['haslanmis-peynir', 'Haşlanmış Peynir', 400, '', 'veg'],
      ['koy-peyniri', 'Köy Peyniri', 400, 'koy-peyniri', 'veg'],
      ['ezine', 'Ezine', 450, '', 'veg'],
      ['kasar-peyniri', 'Kaşar Peyniri', 425, '', 'veg']
    ],
    salata: [
      ['fettus-salata', 'Fettuş Salata', 275, '', 'veg', 'single'],
      ['kasik-salata', 'Kaşık Salata', 250, '', 'veg spicy', 'single'],
      ['mevsim-salata', 'Mevsim Salata', 240, 'mevsim-salata', 'veg', 'single'],
      ['coban-salata', 'Çoban Salata', 240, 'coban-salata', 'veg', 'single'],
      ['gavurdagi-salata', 'Gavurdağı Salata', 275, '', 'veg', 'single'],
      ['roka-salatasi', 'Roka Salatası', 250, '', 'veg', 'single']
    ],
    'ara-sicak': [
      ['cips', 'Cips', 250, '', 'veg', 'single'],
      ['firinda-peynir', 'Fırında Peynir Tereyağlı Sarımsaklı', 260, '', 'veg', 'single'],
      ['kepse-pilavi', 'Kepse Pilavı', 200, '', ''],
      ['kremali-mantarli-patates', 'Kremalı Mantarlı Patates', 425, '', 'veg'],
      ['ali-nazik', 'Ali Nazik', 400, 'ali-nazik', ''],
      ['arnavut-cigeri', 'Arnavut Ciğeri', 350, '', ''],
      ['sac-oruk', 'Sac Oruk', 350, '', '', 'single'],
      ['cig-kofte', 'Çiğ Köfte', 300, '', 'veg spicy', 'single']
    ],
    'ana-yemekler': [
      ['kiymali-pide', 'Kıymalı Pide', 290, '', ''],
      ['kasarli-pide', 'Kaşarlı Pide', 270, '', 'veg'],
      ['yarim-izgara-tavuk', 'Yarım Izgara Tavuk', 400, '', ''],
      ['tum-kemikli-tavuk', 'Tüm Kemikli Tavuk', 750, '', ''],
      ['karisik-izgara', 'Karışık Izgara', 750, 'karisik-izgara', ''],
      ['kaz-basi', 'Kaz Başı', 850, 'kaz-basi', ''],
      ['kusbasi', 'Kuşbaşı', 450, 'kusbasi', '', 'lambOrBeef'],
      ['adana-kebap', 'Adana Kebap', 400, 'adana-kebap', 'spicy'],
      ['pirzola', 'Pirzola', 690, 'pirzola', '', 'lambOrBeef'],
      ['kanat', 'Kanat', 350, 'kanat', ''],
      ['tum-tavuk-kemiksiz', 'Tüm Tavuk (Kemiksiz)', 750, 'tum-tavuk-kemiksiz', ''],
      ['sis-tavuk', 'Şiş Tavuk', 300, 'sis-tavuk', ''],
      ['lokum-dana', 'Lokum (Dana)', 850, '', ''],
      ['steak', 'Steak', 750, '', ''],
      ['kagit-kebabi', 'Kağıt Kebabı', 400, '', ''],
      ['tepsi-kebabi', 'Tepsi Kebabı', 400, '', ''],
      ['sarma-beyti', 'Sarma Beyti', 600, '', ''],
      ['kiremitte-zerzevat-alti-kebap', 'Kiremitte Zerzevat Altı Kebap', 475, '', ''],
      ['et-sote', 'Et Sote', 480, '', ''],
      ['sac-kavurma', 'Sac Kavurma', 480, '', ''],
      ['ciger-izgara', 'Ciğer Izgara', 325, '', ''],
      ['soslu-ciger', 'Soslu Ciğer', 350, '', ''],
      ['beyti-kebabi', 'Beyti Kebabı', 470, '', ''],
      ['lahmacun', 'Lahmacun', 230, '', ''],
      ['mantarli-kasarli-tavuk', 'Mantarlı Kaşarlı Tavuk', 350, '', '', 'quarter']
    ],
    special: [
      ['trb-beyti', 'TRB Beyti', null, 'trb-beyti', 'signature'],
      ['1-metrelik-beyti', '1 Metrelik Beyti', 2000, 'trb-beyti', 'signature'],
      ['dana-incik', 'Dana İncik', 750, '', 'signature'],
      ['kuzu-incik', 'Kuzu İncik', 800, '', 'signature'],
      ['tuzda-tavuk', 'Tuzda Tavuk', 1300, '', 'signature'],
      ['cheddarli-kebap', 'Cheddarlı Kebap', 550, '', 'signature'],
      ['tavuk-incik', 'Tavuk İncik', 330, '', 'signature'],
      ['tavuk-sarma-beyti', 'Tavuk Sarma Beyti', 400, '', 'signature'],
      ['yuvarlama-special', 'Yuvarlama Special', 700, '', 'signature', 'single'],
      ['yogurtlama-special', 'Yoğurtlama Special', 700, '', 'signature', 'single'],
      ['trb-fettus-kebabi', 'TRB Fettuş Kebabı', 650, '', 'signature']
    ],
    tatli: [
      ['cevizli-kunefe', 'Cevizli Künefe', 250, '', 'veg'],
      ['peynirli-kunefe', 'Peynirli Künefe', 240, '', 'veg'],
      ['fistikli-kunefe', 'Fıstıklı Künefe', 300, '', 'veg'],
      ['mentollu-kunefe', 'Mentollü Künefe', 330, '', 'veg'],
      ['peynirli-irmik', 'Peynirli İrmik', 280, '', 'veg'],
      ['kabak-tatlisi', 'Kabak Tatlısı', 230, '', 'veg']
    ]
  };

  // Drinks: [id, brand or name, size or '', price]. Empty size = served by the glass / single serving.
  const drinks = {
    mesrubatlar: [
      ['su', 'Su', '', 60], ['redbull', 'Red Bull', '', 120], ['coca-cola-1lt', 'Cola Turka 1 L', '', 100],
      ['kutu-kola', 'Cola Turka Kutu', '', 70], ['sprite', 'Sprite', '', 70], ['fanta', 'Fanta', '', 70],
      ['salgam', 'Şalgam', '', 60], ['ayran', 'Ayran', '', 60], ['fuse-tea', 'Fuse Tea', '', 70],
      ['meyve-suyu', 'Meyve Suyu', '', 70], ['soda', 'Soda', '', 50]
    ]
  };

  function sizes(id, name, cls) {
    return cls.map(cl => [id + '-' + cl, name, cl + ' cl', null]);
  }

  // Variant labels shown under the name (the old menu's "TEK", "Koyun / Dana", "ÇEYREK").
  const variants = {
    single: { tr: 'Tek porsiyon', en: 'Single portion', ar: 'حصة واحدة' },
    lambOrBeef: { tr: 'Koyun / Dana', en: 'Lamb or beef', ar: 'لحم غنم أو بقر' },
    quarter: { tr: 'Çeyrek', en: 'Quarter', ar: 'ربع' }
  };

  const items = [];
  for (const [cat, rows] of Object.entries(food)) {
    for (const [id, tr, price, photo, tags, variant] of rows) {
      items.push({
        id, cat, kind: 'food', tr, en: null, ar: null, desc: null,
        variant: variant ? variants[variant] : null,
        price, photo: photo ? D + photo + '.webp' : null,
        tags: tags ? tags.split(' ') : []
      });
    }
  }
  for (const [cat, rows] of Object.entries(drinks)) {
    for (const [id, tr, size, price] of rows) {
      items.push({
        id, cat, kind: 'drink', tr, en: null, ar: null, desc: null,
        group: tr, size: size || null, variant: null,
        price, photo: null, tags: []
      });
    }
  }

  // Their signature skewer, sold by length. Sample prices scaled from the 1-metre beyti (2.000 ₺); servings are an estimate.
  const trb = items.find(i => i.id === 'trb-beyti');
  trb.sizes = [
    { cm: 50, price: 1000, serves: 2 },
    { cm: 100, price: 2000, serves: 4 },
    { cm: 150, price: 3000, serves: 6 },
    { cm: 200, price: 4000, serves: 8 }
  ];

  // Soft drinks: product photo and how each is served (pack and size), shown under the name.
  const pack = (tr, en, ar) => ({ tr, en, ar });
  const softDrinks = {
    'su': ['su', pack('Pet şişe · 500 ml', 'Bottle · 500 ml', 'زجاجة · 500 مل')],
    'redbull': ['red-bull', pack('Kutu · 250 ml', 'Can · 250 ml', 'علبة · 250 مل')],
    'coca-cola-1lt': ['cola-turka-1l', pack('Pet şişe · 1 L', 'Bottle · 1 L', 'زجاجة · 1 ل')],
    'kutu-kola': ['cola-turka-can', pack('Kutu · 330 ml', 'Can · 330 ml', 'علبة · 330 مل')],
    'sprite': ['sprite', pack('Kutu · 330 ml', 'Can · 330 ml', 'علبة · 330 مل')],
    'fanta': ['fanta', pack('Kutu · 330 ml', 'Can · 330 ml', 'علبة · 330 مل')],
    'salgam': ['salgam', pack('Pet şişe · 300 ml', 'Bottle · 300 ml', 'زجاجة · 300 مل')],
    'ayran': ['ayran', pack('Bardak · 300 ml', 'Cup · 300 ml', 'كوب · 300 مل')],
    'fuse-tea': ['fuse-tea', pack('Kutu · 330 ml', 'Can · 330 ml', 'علبة · 330 مل')],
    'meyve-suyu': ['meyve-suyu', pack('Karton kutu · 200 ml', 'Carton · 200 ml', 'علبة كرتون · 200 مل')],
    'soda': ['soda', pack('Cam şişe · 200 ml', 'Glass bottle · 200 ml', 'زجاجة زجاجية · 200 مل')]
  };
  for (const it of items) {
    const d = softDrinks[it.id];
    if (!d) continue;
    it.photo = 'assets/drinks/' + d[0] + '.webp';
    it.variant = d[1];
  }

  window.TARBUS = { info, categories, items, variants };
})();
