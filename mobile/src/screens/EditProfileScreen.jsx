import { useState } from 'react';
import { ScrollView, Alert, Text, View } from 'react-native';
import { api } from '../api/client';
import { colors } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useApp();
  const { t, terr } = useI18n();
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
      Alert.alert(t('saved'), t('profileSaved'));
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('error'), terr(e.message));
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async () => {
    try {
      await api('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } });
      setOldPassword('');
      setNewPassword('');
      Alert.alert(t('done'), t('passwordChanged'));
    } catch (e) {
      Alert.alert(t('error'), terr(e.message));
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled">
      <Input label={t('name')} value={name} onChangeText={setName} />
      <Input label={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label={t('email')} value={user?.email || ''} editable={false}
        style={{ backgroundColor: colors.bg, color: colors.muted }} />
      <Button title={t('save')} loading={busy} onPress={saveProfile} />

      <View style={{ height: 28 }} />
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 12 }}>
        {t('changePassword')}
      </Text>
      <Input label={t('currentPassword')} value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
      <Input label={t('newPassword')} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Button title={t('changePassword')} variant="ghost"
        disabled={!oldPassword || newPassword.length < 6} onPress={changePassword} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
