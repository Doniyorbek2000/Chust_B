/**
 * ADM Bozor tarjima lug'ati.
 * Har bir kalit: [o'zbek lotin, ўзбек кирилл, русский]
 * Parametrlar {n}, {name} ko'rinishida.
 */
export const LOCALES = [
  { code: 'uz', label: "O'zbekcha (lotin)", flag: '🇺🇿' },
  { code: 'cy', label: 'Ўзбекча (кирилл)', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export const dict = {
  /* --- umumiy --- */
  appName: ['ADM Bozor', 'АДМ Бозор', 'ADM Bozor'],
  loading: ['Yuklanmoqda…', 'Юкланмоқда…', 'Загрузка…'],
  cancel: ['Bekor qilish', 'Бекор қилиш', 'Отмена'],
  save: ['Saqlash', 'Сақлаш', 'Сохранить'],
  delete: ["O'chirish", 'Ўчириш', 'Удалить'],
  edit: ['Tahrirlash', 'Таҳрирлаш', 'Изменить'],
  apply: ["Qo'llash", 'Қўллаш', 'Применить'],
  clear: ['Tozalash', 'Тозалаш', 'Очистить'],
  viewAll: ['Barchasi →', 'Барчаси →', 'Все →'],
  error: ['Xatolik', 'Хатолик', 'Ошибка'],
  free: ['Bepul', 'Бепул', 'Бесплатно'],
  sum: ["so'm", 'сўм', 'сум'],
  count: ['{n} ta', '{n} та', '{n} шт.'],
  netError: [
    'Server bilan aloqa yo‘q. Internetni tekshiring.',
    'Сервер билан алоқа йўқ. Интернетни текширинг.',
    'Нет связи с сервером. Проверьте интернет.',
  ],

  /* --- pastki menyu --- */
  tabHome: ['Asosiy', 'Асосий', 'Главная'],
  tabCatalog: ['Katalog', 'Каталог', 'Каталог'],
  tabCart: ['Savat', 'Сават', 'Корзина'],
  tabFavorites: ['Sevimlilar', 'Севимлилар', 'Избранное'],
  tabProfile: ['Profil', 'Профиль', 'Профиль'],

  /* --- bosh sahifa --- */
  searchPlaceholder: ['Mahsulot qidirish…', 'Маҳсулот қидириш…', 'Поиск товаров…'],
  categories: ['Kategoriyalar', 'Категориялар', 'Категории'],
  discounts: ['🔥 Chegirmalar', '🔥 Чегирмалар', '🔥 Скидки'],
  popularProducts: ['⭐ Ommabop mahsulotlar', '⭐ Оммабоп маҳсулотлар', '⭐ Популярные товары'],
  newProducts: ['🆕 Yangi kelganlar', '🆕 Янги келганлар', '🆕 Новинки'],
  recentlyViewed: ["👀 Oxirgi ko'rilganlar", '👀 Охирги кўрилганлар', '👀 Недавно просмотренные'],

  /* --- katalog --- */
  catalogTitle: ['Katalog', 'Каталог', 'Каталог'],
  allProducts: ['Barcha mahsulotlar', 'Барча маҳсулотлар', 'Все товары'],

  /* --- ro'yxat / saralash / filtr --- */
  sortTitle: ['Saralash', 'Саралаш', 'Сортировка'],
  sortPopular: ['Ommabop', 'Оммабоп', 'Популярные'],
  sortNew: ['Yangi', 'Янги', 'Новые'],
  sortPriceAsc: ['Arzon → qimmat', 'Арзон → қиммат', 'Дешевле → дороже'],
  sortPriceDesc: ['Qimmat → arzon', 'Қиммат → арзон', 'Дороже → дешевле'],
  sortRating: ['Reyting', 'Рейтинг', 'По рейтингу'],
  sortDiscount: ['Chegirma', 'Чегирма', 'По скидке'],
  filter: ['Filtr', 'Филтр', 'Фильтр'],
  priceFilter: ["Narx bo'yicha filtr", 'Нарх бўйича филтр', 'Фильтр по цене'],
  priceFrom: ["Dan (so'm)", 'Дан (сўм)', 'От (сум)'],
  priceTo: ["Gacha (so'm)", 'Гача (сўм)', 'До (сум)'],
  notFound: ['Hech narsa topilmadi', 'Ҳеч нарса топилмади', 'Ничего не найдено'],
  notFoundText: [
    "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring",
    'Қидирув сўзини ёки филтрларни ўзгартириб кўринг',
    'Попробуйте изменить запрос или фильтры',
  ],
  productsTitle: ['Mahsulotlar', 'Маҳсулотлар', 'Товары'],

  /* --- qidiruv --- */
  searchHistory: ['Qidiruv tarixi', 'Қидирув тарихи', 'История поиска'],
  seeAllResults: ["Barcha natijalarni ko'rish →", 'Барча натижаларни кўриш →', 'Показать все результаты →'],

  /* --- mahsulot --- */
  inStock: ['✓ Omborda mavjud', '✓ Омборда мавжуд', '✓ В наличии'],
  lowStock: [
    '⚠️ Omborda atigi {n} dona qoldi',
    '⚠️ Омборда атиги {n} дона қолди',
    '⚠️ Осталось всего {n} шт.',
  ],
  outOfStock: ['Omborda qolmagan', 'Омборда қолмаган', 'Нет в наличии'],
  soldCount: ['{n} marta sotilgan', '{n} марта сотилган', 'Продано: {n}'],
  specs: ['Xususiyatlar', 'Хусусиятлар', 'Характеристики'],
  description: ['Tavsif', 'Тавсиф', 'Описание'],
  reviews: ['Sharhlar', 'Шарҳлар', 'Отзывы'],
  reviewsCount: ['Sharhlar ({n})', 'Шарҳлар ({n})', 'Отзывы ({n})'],
  noReviews: ["Hozircha sharh yo'q", 'Ҳозирча шарҳ йўқ', 'Пока нет отзывов'],
  noReviewsText: [
    'Bu mahsulotga hali sharh yozilmagan',
    'Бу маҳсулотга ҳали шарҳ ёзилмаган',
    'На этот товар ещё нет отзывов',
  ],
  similar: ["O'xshash mahsulotlar", 'Ўхшаш маҳсулотлар', 'Похожие товары'],
  addToCart: ['🛒 Savatga qo‘shish', '🛒 Саватга қўшиш', '🛒 В корзину'],
  goToCart: ["Savatda ({n}) — o'tish", 'Саватда ({n}) — ўтиш', 'В корзине ({n}) — перейти'],
  price: ['Narx', 'Нарх', 'Цена'],
  productNotFound: ['Mahsulot topilmadi', 'Маҳсулот топилмади', 'Товар не найден'],
  cantAddCart: ['Savatga qo‘shib bo‘lmadi', 'Саватга қўшиб бўлмади', 'Не удалось добавить в корзину'],

  /* --- savat --- */
  cartTitle: ['Savat', 'Сават', 'Корзина'],
  cartEmpty: ["Savat bo'sh", 'Сават бўш', 'Корзина пуста'],
  cartEmptyText: [
    "Mahsulotlarni qo'shib xarid qilishni boshlang",
    'Маҳсулотларни қўшиб харид қилишни бошланг',
    'Добавьте товары и начните покупки',
  ],
  startShopping: ['Xaridni boshlash', 'Харидни бошлаш', 'Начать покупки'],
  productsN: ['Mahsulotlar ({n})', 'Маҳсулотлар ({n})', 'Товары ({n})'],
  shipping: ['Yetkazib berish', 'Етказиб бериш', 'Доставка'],
  total: ['Jami', 'Жами', 'Итого'],
  checkoutBtn: ['Buyurtma berish →', 'Буюртма бериш →', 'Оформить заказ →'],
  removeFromCartQ: [
    '"{name}" savatdan olinsinmi?',
    '«{name}» саватдан олинсинми?',
    'Удалить «{name}» из корзины?',
  ],
  freeShipLeft: [
    'Bepul yetkazishgacha {n} qoldi',
    'Бепул етказишгача {n} қолди',
    'До бесплатной доставки: {n}',
  ],
  freeShipDone: [
    '🎉 Yetkazib berish bepul!',
    '🎉 Етказиб бериш бепул!',
    '🎉 Доставка бесплатная!',
  ],
  loginRequired: ['Hisobingizga kiring', 'Ҳисобингизга киринг', 'Войдите в аккаунт'],
  cartLoginText: [
    'Savatdan foydalanish uchun tizimga kirishingiz kerak',
    'Саватдан фойдаланиш учун тизимга киришингиз керак',
    'Чтобы пользоваться корзиной, войдите в систему',
  ],

  /* --- buyurtma berish --- */
  checkoutTitle: ['Buyurtma berish', 'Буюртма бериш', 'Оформление заказа'],
  deliveryAddress: ['📍 Yetkazib berish manzili', '📍 Етказиб бериш манзили', '📍 Адрес доставки'],
  addNewAddress: ["+ Yangi manzil qo'shish", '+ Янги манзил қўшиш', '+ Добавить новый адрес'],
  paymentMethod: ["💳 To'lov usuli", '💳 Тўлов усули', '💳 Способ оплаты'],
  cash: ['💵 Naqd pul', '💵 Нақд пул', '💵 Наличные'],
  cashHint: ['Yetkazib berilganda to‘laysiz', 'Етказиб берилганда тўлайсиз', 'Оплата при получении'],
  card: ['💳 Karta orqali', '💳 Карта орқали', '💳 Картой онлайн'],
  cardHint: ['Hozir onlayn to‘lov (demo)', 'Ҳозир онлайн тўлов (демо)', 'Онлайн-оплата (демо)'],
  promo: ['🎟️ Promokod', '🎟️ Промокод', '🎟️ Промокод'],
  promoApplied: [
    '✓ "{code}" qo\'llandi — {n} chegirma',
    '✓ «{code}» қўлланди — {n} чегирма',
    '✓ Промокод «{code}» применён — скидка {n}',
  ],
  orderSummary: ['🧾 Buyurtma xulosasi', '🧾 Буюртма хулосаси', '🧾 Ваш заказ'],
  discount: ['Chegirma', 'Чегирма', 'Скидка'],
  totalPay: ["Jami to'lov", 'Жами тўлов', 'Итого к оплате'],
  confirmOrder: ['Buyurtmani tasdiqlash', 'Буюртмани тасдиқлаш', 'Подтвердить заказ'],
  needAddress: ['Manzil kerak', 'Манзил керак', 'Нужен адрес'],
  needAddressText: [
    'Avval yetkazib berish manzilini qo‘shing',
    'Аввал етказиб бериш манзилини қўшинг',
    'Сначала добавьте адрес доставки',
  ],

  /* --- muvaffaqiyat --- */
  orderAccepted: ['Buyurtma qabul qilindi!', 'Буюртма қабул қилинди!', 'Заказ принят!'],
  orderMulti: [
    "{n} ta do'kondan {n} ta buyurtma yaratildi.",
    '{n} та дўкондан {n} та буюртма яратилди.',
    'Создано {n} заказ(а) из {n} магазинов.',
  ],
  orderNo: ['Buyurtma raqami: #{id}', 'Буюртма рақами: #{id}', 'Номер заказа: #{id}'],
  totalN: ['Jami: {n}', 'Жами: {n}', 'Итого: {n}'],
  orderHint: [
    'Sotuvchi tasdiqlagach sizga bildirishnoma keladi',
    'Сотувчи тасдиқлагач сизга билдиришнома келади',
    'Вы получите уведомление после подтверждения продавцом',
  ],
  viewMyOrders: ["Buyurtmalarimni ko'rish", 'Буюртмаларимни кўриш', 'Мои заказы'],
  continueShopping: ['Xaridni davom ettirish', 'Харидни давом эттириш', 'Продолжить покупки'],

  /* --- buyurtmalar --- */
  myOrders: ['Buyurtmalarim', 'Буюртмаларим', 'Мои заказы'],
  ordersEmpty: ["Buyurtmalar yo'q", 'Буюртмалар йўқ', 'Заказов нет'],
  ordersEmptyText: ['Siz hali buyurtma bermagansiz', 'Сиз ҳали буюртма бермагансиз', 'Вы ещё не делали заказов'],
  shopNow: ['Xarid qilish', 'Харид қилиш', 'За покупками'],
  itemsN: ['{n} ta mahsulot', '{n} та маҳсулот', 'Товаров: {n}'],
  orderTitle: ['Buyurtma #{id}', 'Буюртма #{id}', 'Заказ #{id}'],

  /* --- holatlar --- */
  stPending: ['Kutilmoqda', 'Кутилмоқда', 'Ожидает'],
  stConfirmed: ['Tasdiqlandi', 'Тасдиқланди', 'Подтверждён'],
  stShipped: ["Yo'lda", 'Йўлда', 'В пути'],
  stDelivered: ['Yetkazildi', 'Етказилди', 'Доставлен'],
  stCancelled: ['Bekor qilindi', 'Бекор қилинди', 'Отменён'],

  /* --- buyurtma tafsiloti --- */
  productsBlock: ['Mahsulotlar', 'Маҳсулотлар', 'Товары'],
  paymentBlock: ["To'lov", 'Тўлов', 'Оплата'],
  method: ['Usul', 'Усул', 'Способ'],
  payPaid: ["to'langan", 'тўланган', 'оплачено'],
  payPending: ['kutilmoqda', 'кутилмоқда', 'ожидает'],
  payRefunded: ['qaytarilgan', 'қайтарилган', 'возвращено'],
  addressBlock: ['Yetkazib berish manzili', 'Етказиб бериш манзили', 'Адрес доставки'],
  cancelOrder: ['Buyurtmani bekor qilish', 'Буюртмани бекор қилиш', 'Отменить заказ'],
  cancelOrderQ: ['Buyurtmani bekor qilmoqchimisiz?', 'Буюртмани бекор қилмоқчимисиз?', 'Отменить заказ?'],
  yesCancel: ['Ha, bekor qilish', 'Ҳа, бекор қилиш', 'Да, отменить'],
  no: ["Yo'q", 'Йўқ', 'Нет'],
  rate: ['⭐ Baholash', '⭐ Баҳолаш', '⭐ Оценить'],
  reviewPlaceholder: [
    'Fikringizni yozing (ixtiyoriy)…',
    'Фикрингизни ёзинг (ихтиёрий)…',
    'Напишите отзыв (необязательно)…',
  ],
  send: ['Yuborish', 'Юбориш', 'Отправить'],
  thanks: ['Rahmat!', 'Раҳмат!', 'Спасибо!'],
  reviewSaved: ['Sharhingiz saqlandi', 'Шарҳингиз сақланди', 'Ваш отзыв сохранён'],
  cardShort: ['💳 Karta', '💳 Карта', '💳 Карта'],
  cashShort: ['💵 Naqd', '💵 Нақд', '💵 Наличные'],

  /* --- sevimlilar --- */
  favTitle: ['Sevimlilar', 'Севимлилар', 'Избранное'],
  favEmpty: ["Sevimlilar bo'sh", 'Севимлилар бўш', 'В избранном пусто'],
  favEmptyText: [
    "Mahsulot kartasidagi yurak belgisini bosib qo'shing",
    'Маҳсулот картасидаги юрак белгисини босиб қўшинг',
    'Нажмите на сердечко на карточке товара',
  ],
  favLoginText: [
    "Sevimlilar ro'yxati uchun tizimga kiring",
    'Севимлилар рўйхати учун тизимга киринг',
    'Войдите, чтобы сохранять избранное',
  ],

  /* --- profil --- */
  profileTitle: ['Profil', 'Профиль', 'Профиль'],
  profileLoginText: [
    'Buyurtmalar, manzillar va sozlamalar uchun tizimga kiring',
    'Буюртмалар, манзиллар ва созламалар учун тизимга киринг',
    'Войдите для заказов, адресов и настроек',
  ],
  login: ['Kirish', 'Кириш', 'Войти'],
  register: ["Ro'yxatdan o'tish", 'Рўйхатдан ўтиш', 'Регистрация'],
  myAddresses: ['Manzillarim', 'Манзилларим', 'Мои адреса'],
  notificationsTitle: ['Bildirishnomalar', 'Билдиришномалар', 'Уведомления'],
  editProfile: ['Profilni tahrirlash', 'Профилни таҳрирлаш', 'Редактировать профиль'],
  language: ['Til / Язык', 'Тил / Язык', 'Язык / Til'],
  logout: ['Hisobdan chiqish', 'Ҳисобдан чиқиш', 'Выйти из аккаунта'],
  logoutQ: ['Hisobdan chiqmoqchimisiz?', 'Ҳисобдан чиқмоқчимисиз?', 'Выйти из аккаунта?'],
  logoutBtn: ['Chiqish', 'Чиқиш', 'Выйти'],

  /* --- manzillar --- */
  addressesEmpty: ["Manzil yo'q", 'Манзил йўқ', 'Адресов нет'],
  addressesEmptyText: [
    "Yetkazib berish manzilini qo'shing",
    'Етказиб бериш манзилини қўшинг',
    'Добавьте адрес доставки',
  ],
  addAddress: ['+ Yangi manzil', '+ Янги манзил', '+ Новый адрес'],
  defaultAddr: ['Asosiy', 'Асосий', 'Основной'],
  makeDefault: ['Asosiy qilish', 'Асосий қилиш', 'Сделать основным'],
  removeAddressQ: [
    '"{label}" manzili o\'chirilsinmi?',
    '«{label}» манзили ўчирилсинми?',
    'Удалить адрес «{label}»?',
  ],
  newAddress: ['Yangi manzil', 'Янги манзил', 'Новый адрес'],
  editAddress: ['Manzilni tahrirlash', 'Манзилни таҳрирлаш', 'Изменить адрес'],
  addrLabel: ['Nomi (Uy, Ish…)', 'Номи (Уй, Иш…)', 'Название (Дом, Работа…)'],
  addrLabelDefault: ['Uy', 'Уй', 'Дом'],
  region: ['Viloyat', 'Вилоят', 'Область'],
  city: ['Shahar / tuman', 'Шаҳар / туман', 'Город / район'],
  street: ["Ko'cha, uy, xonadon", 'Кўча, уй, хонадон', 'Улица, дом, квартира'],
  phone: ['Telefon', 'Телефон', 'Телефон'],
  makeDefaultSwitch: ['Asosiy manzil qilish', 'Асосий манзил қилиш', 'Сделать основным адресом'],
  fillAll: ["To'ldiring", 'Тўлдиринг', 'Заполните'],
  fillAllText: ['Barcha maydonlarni kiriting', 'Барча майдонларни киритинг', 'Заполните все поля'],

  /* --- bildirishnomalar --- */
  notifEmpty: ["Bildirishnoma yo'q", 'Билдиришнома йўқ', 'Уведомлений нет'],

  /* --- profil tahriri --- */
  name: ['Ism', 'Исм', 'Имя'],
  saved: ['Saqlandi', 'Сақланди', 'Сохранено'],
  profileSaved: [
    "Profil ma'lumotlari yangilandi",
    'Профил маълумотлари янгиланди',
    'Данные профиля обновлены',
  ],
  changePassword: ['Parolni almashtirish', 'Паролни алмаштириш', 'Сменить пароль'],
  currentPassword: ['Joriy parol', 'Жорий парол', 'Текущий пароль'],
  newPassword: [
    'Yangi parol (kamida 6 belgi)',
    'Янги парол (камида 6 белги)',
    'Новый пароль (мин. 6 символов)',
  ],
  passwordChanged: ['Parol almashtirildi', 'Парол алмаштирилди', 'Пароль изменён'],
  done: ['Tayyor', 'Тайёр', 'Готово'],

  /* --- kirish / ro'yxat --- */
  welcome: ["ADM Bozor'ga xush kelibsiz", 'АДМ Бозорга хуш келибсиз', 'Добро пожаловать в ADM Bozor'],
  loginSub: ['Hisobingizga kiring', 'Ҳисобингизга киринг', 'Войдите в аккаунт'],
  email: ['Email', 'Email', 'Email'],
  password: ['Parol', 'Парол', 'Пароль'],
  noAccount: ["Hisobingiz yo'qmi?", 'Ҳисобингиз йўқми?', 'Нет аккаунта?'],
  registerLink: ["Ro'yxatdan o'ting", 'Рўйхатдан ўтинг', 'Зарегистрируйтесь'],
  createAccount: ['Hisob yaratish', 'Ҳисоб яратиш', 'Создать аккаунт'],
  registerSub: ["Bir daqiqada ro'yxatdan o'ting", 'Бир дақиқада рўйхатдан ўтинг', 'Регистрация за минуту'],
  namePh: ['Ismingiz', 'Исмингиз', 'Ваше имя'],
  passwordPh: ['Kamida 6 ta belgi', 'Камида 6 та белги', 'Минимум 6 символов'],
  haveAccount: ['Hisobingiz bormi?', 'Ҳисобингиз борми?', 'Уже есть аккаунт?'],
  nameErr: ['Ismingizni kiriting', 'Исмингизни киритинг', 'Введите имя'],
  passErr: [
    'Parol kamida 6 ta belgi bo‘lishi kerak',
    'Парол камида 6 та белги бўлиши керак',
    'Пароль должен быть не менее 6 символов',
  ],
  authNeeded: ['Kirish kerak', 'Кириш керак', 'Требуется вход'],
  authNeededText: [
    'Bu amal uchun hisobingizga kiring',
    'Бу амал учун ҳисобингизга киринг',
    'Войдите, чтобы продолжить',
  ],

  /* --- til tanlash --- */
  chooseLanguage: ['Tilni tanlang', 'Тилни танланг', 'Выберите язык'],
  continueBtn: ['Davom etish', 'Давом этиш', 'Продолжить'],
};

/**
 * Server xatolari tarjimasi (server o'zbek lotinda javob beradi).
 * Kirill uchun topilmasa transliteratsiya ishlaydi (index.jsx da).
 */
export const serverErrors = {
  'Bu ilova haridorlar uchun. Sotuvchi/admin panellari web orqali.': [
    null,
    'Бу илова харидорлар учун. Сотувчи/админ панеллари веб орқали.',
    'Это приложение для покупателей. Панели продавца/админа — через веб.',
  ],
  'Email yoki parol noto‘g‘ri': [null, 'Email ёки парол нотўғри', 'Неверный email или пароль'],
  'Hisobingiz bloklangan': [null, 'Ҳисобингиз блокланган', 'Ваш аккаунт заблокирован'],
  'Bu email allaqachon ro‘yxatdan o‘tgan': [null, 'Бу email аллақачон рўйхатдан ўтган', 'Этот email уже зарегистрирован'],
  'Email noto‘g‘ri formatda': [null, 'Email нотўғри форматда', 'Неверный формат email'],
  'Parol kamida 6 ta belgi bo‘lishi kerak': [null, 'Парол камида 6 та белги бўлиши керак', 'Пароль должен быть не менее 6 символов'],
  'Ism kamida 2 ta belgi bo‘lishi kerak': [null, 'Исм камида 2 та белги бўлиши керак', 'Имя должно быть не короче 2 символов'],
  'Joriy parol noto‘g‘ri': [null, 'Жорий парол нотўғри', 'Неверный текущий пароль'],
  'Mahsulot topilmadi': [null, 'Маҳсулот топилмади', 'Товар не найден'],
  'Mahsulot omborda qolmagan': [null, 'Маҳсулот омборда қолмаган', 'Товара нет в наличии'],
  'Savat bo‘sh': [null, 'Сават бўш', 'Корзина пуста'],
  'Yetkazish manzilini tanlang': [null, 'Етказиш манзилини танланг', 'Выберите адрес доставки'],
  'Promokod topilmadi': [null, 'Промокод топилмади', 'Промокод не найден'],
  'Promokod muddati tugagan': [null, 'Промокод муддати тугаган', 'Срок действия промокода истёк'],
  'Avtorizatsiya talab qilinadi': [null, 'Авторизация талаб қилинади', 'Требуется авторизация'],
  'Buyurtma topilmadi': [null, 'Буюртма топилмади', 'Заказ не найден'],
  'Bu bosqichda buyurtmani bekor qilib bo‘lmaydi': [null, 'Бу босқичда буюртмани бекор қилиб бўлмайди', 'На этом этапе заказ нельзя отменить'],
  'Faqat yetkazilgan buyurtma mahsulotini baholash mumkin': [null, 'Фақат етказилган буюртма маҳсулотини баҳолаш мумкин', 'Оценить можно только доставленный товар'],
};
