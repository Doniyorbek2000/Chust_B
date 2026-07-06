import { useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '+998', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = async () => {
    setError('');
    if (form.name.trim().length < 2) return setError('Ismingizni kiriting');
    if (form.password.length < 6) return setError('Parol kamida 6 ta belgi bo‘lishi kerak');
    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim() });
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.surface }} contentContainerStyle={s.wrap}
      keyboardShouldPersistTaps="handled">
      <Text style={s.logo}>🛒</Text>
      <Text style={s.title}>Hisob yaratish</Text>
      <Text style={s.sub}>Bir daqiqada ro'yxatdan o'ting</Text>

      {error ? <Text style={s.error}>{error}</Text> : null}

      <Input label="Ism" value={form.name} onChangeText={set('name')} placeholder="Ismingiz" />
      <Input label="Email" value={form.email} onChangeText={set('email')}
        keyboardType="email-address" autoCapitalize="none" placeholder="siz@email.uz" />
      <Input label="Telefon" value={form.phone} onChangeText={set('phone')}
        keyboardType="phone-pad" />
      <Input label="Parol" value={form.password} onChangeText={set('password')}
        secureTextEntry placeholder="Kamida 6 ta belgi" />

      <Button title="Ro'yxatdan o'tish" loading={busy} onPress={submit} />

      <TouchableOpacity style={{ marginTop: 18 }} onPress={() => navigation.replace('Login')}>
        <Text style={{ textAlign: 'center', color: colors.ink2 }}>
          Hisobingiz bormi? <Text style={{ color: colors.brand, fontWeight: '700' }}>Kirish</Text>
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
