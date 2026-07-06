import { useState } from 'react';
import { ScrollView, Alert, Text, View } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    try {
      const d = await api('/auth/me', { method: 'PATCH', body: { name, phone } });
      setUser(d.user);
      Alert.alert('Saqlandi', "Profil ma'lumotlari yangilandi");
      navigation.goBack();
    } catch (e) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } });
      setOldPassword('');
      setNewPassword('');
      Alert.alert('Tayyor', 'Parol almashtirildi');
    } catch (e) {
      Alert.alert('Xatolik', e.message);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled">
      <Input label="Ism" value={name} onChangeText={setName} />
      <Input label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Email" value={user?.email || ''} editable={false}
        style={{ backgroundColor: colors.bg, color: colors.muted }} />
      <Button title="Saqlash" loading={busy} onPress={saveProfile} />

      <View style={{ height: 28 }} />
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 12 }}>
        Parolni almashtirish
      </Text>
      <Input label="Joriy parol" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
      <Input label="Yangi parol (kamida 6 belgi)" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Button title="Parolni almashtirish" variant="ghost"
        disabled={!oldPassword || newPassword.length < 6} onPress={changePassword} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
