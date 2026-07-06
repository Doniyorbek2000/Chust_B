import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { Button, Empty } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n, LOCALES } from '../i18n';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useApp();
  const { t, locale } = useI18n();

  const localeLabel = LOCALES.find((l) => l.code === locale)?.label || '';

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Text style={s.title}>{t('profileTitle')}</Text>
        <Empty icon="👤" title={t('loginRequired')} text={t('profileLoginText')}
          action={
            <View style={{ gap: 10, marginTop: 12, width: 220 }}>
              <Button title={t('login')} onPress={() => navigation.navigate('Login')} />
              <Button title={t('register')} variant="ghost"
                onPress={() => navigation.navigate('Register')} />
            </View>
          } />
        {/* Til tanlash mehmonlar uchun ham ochiq */}
        <TouchableOpacity style={[s.menu, s.row, { marginBottom: 24, borderBottomWidth: 1 }]}
          onPress={() => navigation.navigate('Language')}>
          <Text style={{ fontSize: 18 }}>🌐</Text>
          <Text style={{ flex: 1, fontSize: 15, color: colors.ink }}>{t('language')}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{localeLabel} ›</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rows = [
    ['📦', t('myOrders'), () => navigation.navigate('Orders')],
    ['📍', t('myAddresses'), () => navigation.navigate('Addresses')],
    ['🔔', t('notificationsTitle'), () => navigation.navigate('Notifications')],
    ['✏️', t('editProfile'), () => navigation.navigate('EditProfile')],
    ['🌐', t('language'), () => navigation.navigate('Language'), localeLabel],
  ];

  const confirmLogout = () => {
    Alert.alert(t('logout'), t('logoutQ'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logoutBtn'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView>
        <Text style={s.title}>{t('profileTitle')}</Text>

        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 26, color: '#fff', fontWeight: '800' }}>{user.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{user.name}</Text>
            <Text style={{ color: colors.ink2, fontSize: 13 }}>{user.email}</Text>
            {user.phone ? <Text style={{ color: colors.muted, fontSize: 13 }}>{user.phone}</Text> : null}
          </View>
        </View>

        <View style={s.menu}>
          {rows.map(([icon, label, onPress, extra], i) => (
            <TouchableOpacity key={label} style={[s.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}
              onPress={onPress}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={{ flex: 1, fontSize: 15, color: colors.ink }}>{label}</Text>
              {extra ? <Text style={{ color: colors.muted, fontSize: 13 }}>{extra}</Text> : null}
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          <Button title={t('logout')} variant="danger" onPress={confirmLogout} />
          <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 16 }}>
            ADM Bozor v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 16, paddingBottom: 10 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, marginHorizontal: 16, padding: 16,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line,
  },
  avatar: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  menu: {
    backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 14,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
});
