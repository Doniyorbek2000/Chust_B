import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, imgUrl } from '../api/client';
import { colors, radius } from '../theme';
import { useI18n } from '../i18n';

const HISTORY_KEY = 'adm_search_history';

/** Qidiruv — jonli natijalar va qidiruv tarixi bilan */
export default function SearchScreen({ navigation }) {
  const { t, lname, fmtSum } = useI18n();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((v) => v && setHistory(JSON.parse(v)));
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  // jonli qidiruv (debounce 350ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      api(`/products?q=${encodeURIComponent(q.trim())}&limit=10`)
        .then((d) => setResults(d.products))
        .catch(() => {});
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  const saveHistory = async (term) => {
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 10);
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const submit = (term) => {
    const value = (term ?? q).trim();
    if (!value) return;
    saveHistory(value);
    navigation.replace('ProductList', { q: value, title: `"${value}"` });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <View style={s.bar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={s.input}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.muted}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => submit()}
          returnKeyType="search"
        />
        {q ? (
          <TouchableOpacity onPress={() => setQ('')} style={{ padding: 6 }}>
            <Text style={{ color: colors.muted }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {q.trim().length < 2 ? (
        <View style={{ padding: 16 }}>
          {history.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontWeight: '700', color: colors.ink }}>{t('searchHistory')}</Text>
                <TouchableOpacity onPress={() => { setHistory([]); AsyncStorage.removeItem(HISTORY_KEY); }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{t('clear')}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {history.map((h) => (
                  <TouchableOpacity key={h} style={s.chip} onPress={() => submit(h)}>
                    <Text style={{ color: colors.ink2, fontSize: 13 }}>🕐 {h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => String(p.id)}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            results.length > 0 ? (
              <TouchableOpacity style={s.allRow} onPress={() => submit()}>
                <Text style={{ color: colors.brand, fontWeight: '700' }}>{t('seeAllResults')}</Text>
              </TouchableOpacity>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultRow}
              onPress={() => {
                saveHistory(q.trim());
                navigation.replace('ProductDetail', { id: item.id });
              }}>
              <Image source={{ uri: imgUrl(item.image) }} style={s.resultImg} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 14 }}>{lname(item)}</Text>
                <Text style={{ color: colors.ink2, fontWeight: '700', fontSize: 13 }}>{fmtSum(item.price)}</Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  input: {
    flex: 1, height: 42, backgroundColor: colors.bg, borderRadius: radius.md,
    paddingHorizontal: 12, fontSize: 15, color: colors.ink,
  },
  chip: {
    backgroundColor: colors.bg, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  allRow: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  resultImg: { width: 46, height: 46, borderRadius: 8, backgroundColor: colors.bg },
});
