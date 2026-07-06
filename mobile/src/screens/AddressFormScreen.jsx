import { useState } from 'react';
import { ScrollView, Alert, Switch, View, Text } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona",
  'Jizzax', 'Namangan viloyati', 'Navoiy', 'Qashqadaryo', "Qoraqalpog'iston",
  'Samarqand', 'Sirdaryo', 'Surxondaryo', 'Xorazm',
];

export default function AddressFormScreen({ route, navigation }) {
  const editing = route.params?.address;
  const [form, setForm] = useState({
    label: editing?.label || 'Uy',
    region: editing?.region || '',
    city: editing?.city || '',
    street: editing?.street || '',
    phone: editing?.phone || '+998',
    is_default: !!editing?.is_default,
  });
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => setForm({ ...form, [k]: v });

  const save = async () => {
    if (!form.region || !form.city || !form.street || form.phone.length < 9) {
      Alert.alert("To'ldiring", 'Barcha maydonlarni kiriting');
      return;
    }
    setBusy(true);
    try {
      if (editing) await api(`/me/addresses/${editing.id}`, { method: 'PATCH', body: form });
      else await api('/me/addresses', { method: 'POST', body: form });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled">
      <Input label="Nomi (Uy, Ish…)" value={form.label} onChangeText={set('label')} />
      <Input label="Viloyat" value={form.region} onChangeText={set('region')}
        placeholder={REGIONS.slice(0, 3).join(', ') + '…'} />
      <Input label="Shahar / tuman" value={form.city} onChangeText={set('city')} placeholder="Chust" />
      <Input label="Ko'cha, uy, xonadon" value={form.street} onChangeText={set('street')}
        placeholder="Istiqlol ko'chasi 12-uy" />
      <Input label="Telefon" value={form.phone} onChangeText={set('phone')}
        keyboardType="phone-pad" placeholder="+998 90 123 45 67" />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{ fontSize: 15, color: colors.ink, fontWeight: '600' }}>Asosiy manzil qilish</Text>
        <Switch value={form.is_default} onValueChange={set('is_default')}
          trackColor={{ true: colors.brand }} />
      </View>

      <Button title="Saqlash" loading={busy} onPress={save} />
    </ScrollView>
  );
}
