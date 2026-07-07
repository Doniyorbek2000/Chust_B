import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dict, serverErrors, LOCALES } from './translations';
import { toCyrillic } from './translit';

const LOCALE_KEY = 'adm_locale';
const IDX = { uz: 0, cy: 1, ru: 2 };

const I18nCtx = createContext(null);
export const useI18n = () => useContext(I18nCtx);
export { LOCALES };

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(null); // null = hali tanlanmagan
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY)
      .then((v) => v && IDX[v] !== undefined && setLocaleState(v))
      .finally(() => setReady(true));
  }, []);

  const setLocale = useCallback(async (code) => {
    setLocaleState(code);
    await AsyncStorage.setItem(LOCALE_KEY, code);
  }, []);

  const value = useMemo(() => {
    const i = IDX[locale] ?? 0;

    /** UI matni: t('cartTitle') yoki t('count', {n: 5}) */
    const t = (key, params) => {
      let s = dict[key]?.[i] ?? dict[key]?.[0] ?? key;
      if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };

    /** Dinamik kontent (mahsulot/kategoriya nomi): tilga mos maydonni tanlaydi */
    const lname = (obj, field = 'name') => {
      if (!obj) return '';
      const uz = obj[field] || '';
      if (locale === 'ru') return obj[`${field}_ru`] || uz;
      if (locale === 'cy') return toCyrillic(uz);
      return uz;
    };

    /** Server xatosini joriy tilga o'giradi */
    const terr = (message) => {
      if (!message) return t('error');
      if (locale === 'ru') return serverErrors[message]?.[2] || message;
      if (locale === 'cy') return serverErrors[message]?.[1] || toCyrillic(message);
      return message;
    };

    const fmtSum = (n) => `${Number(n || 0).toLocaleString('ru-RU')} ${t('sum')}`;

    const fmtDate = (s) => {
      if (!s) return '—';
      const d = new Date(s.includes('T') ? s : s + 'Z');
      return d.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    };

    return { locale, setLocale, t, lname, terr, fmtSum, fmtDate };
  }, [locale, setLocale]);

  if (!ready) return null;

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

/** Buyurtma holati: rang/fon theme'dan, matn lug'atdan */
export const ORDER_STATUS_KEYS = {
  pending: 'stPending',
  confirmed: 'stConfirmed',
  shipped: 'stShipped',
  delivered: 'stDelivered',
  cancelled: 'stCancelled',
};
