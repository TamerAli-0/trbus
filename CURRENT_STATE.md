# Tarbuş demo site — current state

A polished demo website for Tarbuş Restaurant (Antakya cuisine, Istanbul), made to show the owners what a proper site could look like next to their current QR menu (tarbus.qrmenu.com.tr). It is a pitch, not a live site yet.

## How to run and check it

Open `index.html` (home), `menu.html` (menu) or `admin.html` (owner page) in a browser; no build step. Add `?lang=tr`, `?lang=en` or `?lang=ar` to open a language directly. Owner page demo PIN: 1234.

## What works now

- **Three languages:** Turkish, English and Arabic. Arabic mirrors right-to-left on phones and wide screens.
- **Home page:** hero, category tiles, the TRB Beyti length ruler (50–200 cm with price and people count), the starters spread, the story, booking and branches.
- **Menu:** all categories with photos, search, and vegetarian and signature filters. Guests can pick dishes and send the list on WhatsApp.
- **Booking:** asks for the date before the time, then opens WhatsApp with the request in all three languages and a short booking number.
- **Owner page:** edit any dish (photo, names in three languages, category, price, portion, description, labels, sold out, hidden), add new dishes, and use a trash with Restore.

## Wording decisions

- The starters category is "Meze" in Turkish, "Starters" in English and "مقبلات" in Arabic. Never "meze" in English, and never "مازة" in Arabic. Hot starters are "Ara Sıcak" / "Hot starters" / "مقبلات ساخنة".
- English and Arabic dish names say what the dish is; the Turkish name always shows underneath so guests can order by it. No bare transliterations (for example "Prenses" is "Red cabbage in yoghurt" / "ملفوف أحمر باللبن", and "Zengin" is "Tomato & red pepper spread" / "متبّلة الطماطم والفلفل الأحمر").
- Arabic counts follow Arabic grammar (صنف واحد، صنفان، 6 أصناف، 23 صنفاً), handled by plural forms in the translation tables.
- Arabic text uses IBM Plex Sans Arabic (flat, modern) and Arabic headings use Noto Kufi Arabic. A calligraphic Naskh face was dropped because it looked uneven. Digits and Latin words use the same Latin fonts as the other languages, and phone numbers always read left to right.
- Antakya in Arabic is أنطاكية, never أنطاكيا.
- After changing a stylesheet or script, raise the `?v=` number on its link in all three pages, so browsers don't keep an old copy.
- No alcohol anywhere: no alcoholic drinks, and no rakı or meyhane.
- The cola on the menu is Cola Turka.

## The person's decisions

- Bookings, the dish list and the phone number all go through WhatsApp. For the demo, they go to the person's own number.
- On WhatsApp, sending only opens the chat. Phones get the share menu with the picture, and computers copy the picture so it can be pasted.
- Dish photos always show the whole plate, never cropped.
- No decorative extras: every feature must do something useful.

## Still sample or temporary (needs the restaurant)

- Opening hours, beyti prices for 50/150/200 cm, and the people counts are samples.
- 52 of the 95 dishes (for example the desserts) still show the logo instead of a real photo.
- Tarbuş's own menu doesn't describe "Prenses", "Zengin" or "Mentollü Künefe". The first two are described from their photos and the usual recipes. Mentollü Künefe has no description and is named "Mint künefe" for now. The restaurant should confirm all three.
- Drink photos come from brand and shop pages; they need permission or the brands' own photos before going live.
- Branches show only Fatih and Taksim / İstiklal as areas. Real addresses, hours and phone numbers wait until Tarbuş agrees to work together.
- The owner page saves only in the same browser, behind a demo PIN. A real version needs an online database, photo storage and a proper staff sign-in.
- The guest's dish list stays in their browser and goes out by WhatsApp. It does not reach the kitchen directly.
