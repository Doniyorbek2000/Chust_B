import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { Button, Empty } from '../components/ui';
import { useApp } from '../store/AppContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useApp();

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Text style={s.title}>Profil</Text>
        <Empty icon="👤" title="Hisobingizga kiring"
          text="Buyurtmalar, manzillar va sozlamalar uchun tizimga kiring"
          action={
            <View style={{ gap: 10, marginTop: 12, width: 220 }}>
              <Button title="Kirish" onPress={() => navigation.navigate('Login')} />
              <Button title="Ro'yxatdan o'tish" variant="ghost"
                onPress={() => navigation.navigate('Register')} />
            </View>
          } />
      </SafeAreaView>
    );
  }

  const rows = [
    ['📦', 'Buyurtmalarim', () => navigation.navigate('Orders')],
    ['📍', 'Manzillarim', () => navigation.navigate('Addresses')],
    ['🔔', 'Bildirishnomalar', () => navigation.navigate('Notifications')],
    ['✏️', 'Profilni tahrirlash', () => navigation.navigate('EditProfile')],
  ];

  const confirmLogout = () => {
    Alert.alert('Chiqish', 'Hisobdan chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView>
        <Text style={s.title}>Profil</Text>

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
          {rows.map(([icon, label, onPress], i) => (
            <TouchableOpacity key={label} style={[s.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}
              onPress={onPress}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={{ flex: 1, fontSize: 15, color: colors.ink }}>{label}</Text>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          <Button title="Hisobdan chiqish" variant="danger" onPress={confirmLogout} />
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
