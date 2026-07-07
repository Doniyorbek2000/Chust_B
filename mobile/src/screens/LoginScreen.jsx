import { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const { t, terr } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
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
      <Text style={s.title}>{t('welcome')}</Text>
      <Text style={s.sub}>{t('loginSub')}</Text>

      {error ? <Text style={s.error}>{error}</Text> : null}

      <Input label={t('email')} value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" placeholder="siz@email.uz" />
      <Input label={t('password')} value={password} onChangeText={setPassword}
        secureTextEntry placeholder="••••••" />

      <Button title={t('login')} loading={busy} onPress={submit} disabled={!email || !password} />

      <TouchableOpacity style={{ marginTop: 18 }}
        onPress={() => navigation.replace('Register')}>
        <Text style={{ textAlign: 'center', color: colors.ink2 }}>
          {t('noAccount')} <Text style={{ color: colors.brand, fontWeight: '700' }}>{t('registerLink')}</Text>
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
