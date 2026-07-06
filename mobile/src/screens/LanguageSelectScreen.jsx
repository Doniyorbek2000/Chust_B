import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { useI18n, LOCALES } from '../i18n';
import { Button } from '../components/ui';

/**
 * Til tanlash — birinchi ochilishda (firstLaunch) yoki Profil → Til orqali.
 */
export default function LanguageSelectScreen({ firstLaunch, navigation }) {
  const { locale, setLocale } = useI18n();
  const [selected, setSelected] = useState(locale || 'uz');

  const TITLES = { uz: 'Tilni tanlang', cy: 'Тилни танланг', ru: 'Выберите язык' };
  const CONTINUE = { uz: 'Davom etish', cy: 'Давом этиш', ru: 'Продолжить' };

  const confirm = async () => {
    await setLocale(selected);
    if (!firstLaunch) navigation.goBack();
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {firstLaunch && (
          <>
            <Text style={s.logo}>🛒</Text>
            <Text style={s.brand}>ADM Bozor</Text>
          </>
        )}
        <Text style={s.title}>{TITLES[selected]}</Text>

        {LOCALES.map((l) => (
          <TouchableOpacity key={l.code} style={[s.option, selected === l.code && s.optionOn]}
            onPress={() => setSelected(l.code)} activeOpacity={0.8}>
            <Text style={{ fontSize: 22 }}>{l.flag}</Text>
            <Text style={[s.optionText, selected === l.code && { color: colors.brand, fontWeight: '800' }]}>
              {l.label}
            </Text>
            <View style={[s.radio, selected === l.code && s.radioOn]} />
          </TouchableOpacity>
        ))}

        <Button title={CONTINUE[selected]} onPress={confirm} style={{ marginTop: 22 }} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surface },
  logo: { fontSize: 56, textAlign: 'center' },
  brand: { fontSize: 26, fontWeight: '900', color: colors.brand, textAlign: 'center', marginBottom: 30 },
  title: { fontSize: 19, fontWeight: '800', color: colors.ink, marginBottom: 16, textAlign: 'center' },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg,
    padding: 16, marginBottom: 10, backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  optionText: { flex: 1, fontSize: 16, color: colors.ink, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.line },
  radioOn: { borderColor: colors.brand, borderWidth: 6 },
});
