import { useState } from 'react';
import { ScrollView, Alert, Switch, View, Text } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useI18n } from '../i18n';

export default function AddressFormScreen({ route, navigation }) {
  const { t, terr } = useI18n();
  const editing = route.params?.address;
  const [form, setForm] = useState({
    label: editing?.label || t('addrLabelDefault'),
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
      Alert.alert(t('fillAll'), t('fillAllText'));
      return;
    }
    setBusy(true);
    try {
      if (editing) await api(`/me/addresses/${editing.id}`, { method: 'PATCH', body: form });
      else await api('/me/addresses', { method: 'POST', body: form });
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('error'), terr(e.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled">
      <Input label={t('addrLabel')} value={form.label} onChangeText={set('label')} />
      <Input label={t('region')} value={form.region} onChangeText={set('region')}
        placeholder="Namangan" />
      <Input label={t('city')} value={form.city} onChangeText={set('city')} placeholder="Chust" />
      <Input label={t('street')} value={form.street} onChangeText={set('street')} />
      <Input label={t('phone')} value={form.phone} onChangeText={set('phone')}
        keyboardType="phone-pad" placeholder="+998 90 123 45 67" />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{ fontSize: 15, color: colors.ink, fontWeight: '600' }}>{t('makeDefaultSwitch')}</Text>
        <Switch value={form.is_default} onValueChange={set('is_default')}
          trackColor={{ true: colors.brand }} />
      </View>

      <Button title={t('save')} loading={busy} onPress={save} />
    </ScrollView>
  );
}
