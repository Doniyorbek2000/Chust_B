import { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

export default function RegisterScreen({ navigation }) {
  const { register } = useApp();
  const { t, terr } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '+998', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setError('');
    if (form.name.trim().length < 2) return setError(t('nameErr'));
    if (form.password.length < 6) return setError(t('passErr'));
    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim() });
      navigation.goBack();
    } catch (e) {
      setError(terr(e.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={s.wrap}
      keyboardShouldPersistTaps="handled">
      <Text style={s.logo}>🛒</Text>
      <Text style={s.title}>{t('createAccount')}</Text>
      <Text style={s.sub}>{t('registerSub')}</Text>

      {error ? <Text style={s.error}>{error}</Text> : null}

      <Input label={t('name')} value={form.name} onChangeText={set('name')} placeholder={t('namePh')} />
      <Input label={t('email')} value={form.email} onChangeText={set('email')}
        keyboardType="email-address" autoCapitalize="none" placeholder="siz@email.uz" />
      <Input label={t('phone')} value={form.phone} onChangeText={set('phone')}
        keyboardType="phone-pad" />
      <Input label={t('password')} value={form.password} onChangeText={set('password')}
        secureTextEntry placeholder={t('passwordPh')} />

      <Button title={t('register')} loading={busy} onPress={submit} />

      <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.replace('Login')}>
        <Text style={{ textAlign: 'center', color: colors.ink2 }}>
          {t('haveAccount')} <Text style={{ color: colors.brand, fontWeight: '700' }}>{t('login')}</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 34 },
  logo: { fontSize: 52, textAlign: 'center' },
  title: { fontSize: 21, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 8 },
  sub: { color: colors.ink2, textAlign: 'center', marginTop: 4, marginBottom: 22 },
  error: {
    backgroundColor: '#fbe5e4', color: '#a12622', padding: 11, borderRadius: 10,
    marginBottom: 14, overflow: 'hidden',
  },
});
