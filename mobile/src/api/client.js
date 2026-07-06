import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * API manzili — app.json dagi expo.extra.apiUrl dan olinadi.
 * Haqiqiy qurilmada test qilishda kompyuteringizning lokal IP sini yozing
 * (masalan http://192.168.1.10:4000). Android emulyatorda: http://10.0.2.2:4000
 */
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:4000';

const TOKEN_KEY = 'chust_token';
let cachedToken = null;

export async function loadToken() {
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export async function saveToken(token) {
  cachedToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (cachedToken) headers.Authorization = `Bearer ${cachedToken}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Server bilan aloqa yo‘q. Internetni tekshiring.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || 'Xatolik yuz berdi');
  return data;
}

/** Nisbiy /uploads yo'llarini to'liq URL ga aylantiradi */
export const imgUrl = (src) => (src && src.startsWith('/') ? API_URL + src : src);
