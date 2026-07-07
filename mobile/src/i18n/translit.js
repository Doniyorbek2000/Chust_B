/**
 * O'zbek lotin → kirill transliteratsiyasi.
 * Sotuvchilar kiritgan dinamik matnlar (mahsulot nomi, tavsif) uchun ishlatiladi —
 * interfeys matnlari esa lug'atda qo'lda yozilgan (translations.js).
 */

const APOS = "['’‘ʼ`]"; // tutuq belgisi variantlari

// Tartib muhim: avval uzun birikmalar
const RULES = [
  [new RegExp(`O${APOS}`, 'g'), 'Ў'], [new RegExp(`o${APOS}`, 'g'), 'ў'],
  [new RegExp(`G${APOS}`, 'g'), 'Ғ'], [new RegExp(`g${APOS}`, 'g'), 'ғ'],
  [/SH/g, 'Ш'], [/Sh/g, 'Ш'], [/sh/g, 'ш'],
  [/CH/g, 'Ч'], [/Ch/g, 'Ч'], [/ch/g, 'ч'],
  [/YO/g, 'Ё'], [/Yo/g, 'Ё'], [/yo/g, 'ё'],
  [/YU/g, 'Ю'], [/Yu/g, 'Ю'], [/yu/g, 'ю'],
  [/YA/g, 'Я'], [/Ya/g, 'Я'], [/ya/g, 'я'],
  [/YE/g, 'Е'], [/Ye/g, 'Е'], [/ye/g, 'е'],
];

const SINGLE = {
  a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж',
  k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с',
  t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'с',
  A: 'А', B: 'Б', D: 'Д', E: 'Е', F: 'Ф', G: 'Г', H: 'Ҳ', I: 'И', J: 'Ж',
  K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О', P: 'П', Q: 'Қ', R: 'Р', S: 'С',
  T: 'Т', U: 'У', V: 'В', X: 'Х', Y: 'Й', Z: 'З', C: 'С',
};

export function toCyrillic(text) {
  if (!text) return text;
  let s = String(text);

  // so'z boshidagi "e" → "э" (Elektronika → Электроника)
  s = s.replace(/(^|[\s(«"'-])E/g, '$1Э').replace(/(^|[\s(«"'-])e/g, '$1э');

  for (const [re, to] of RULES) s = s.replace(re, to);

  // qolgan yakka tutuq belgisi → ъ (ma'lumot → маълумот)
  s = s.replace(new RegExp(APOS, 'g'), 'ъ');

  return s.replace(/[A-Za-z]/g, (ch) => SINGLE[ch] || ch);
}
