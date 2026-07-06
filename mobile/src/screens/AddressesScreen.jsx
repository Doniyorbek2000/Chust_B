import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, radius } from '../theme';
import { Loading, Empty, Button } from '../components/ui';

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState(null);

  const load = useCallback(
    () => api('/me/addresses').then((d) => setAddresses(d.addresses)),
    []
  );

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setAddresses([]));
    }, [load])
  );

  const remove = (a) => {
    Alert.alert("O'chirish", `"${a.label}" manzili o'chirilsinmi?`, [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: "O'chirish", style: 'destructive',
        onPress: async () => { await api(`/me/addresses/${a.id}`, { method: 'DELETE' }); load(); },
      },
    ]);
  };

  const makeDefault = async (a) => {
    await api(`/me/addresses/${a.id}`, { method: 'PATCH', body: { is_default: true } });
    load();
  };

  if (!addresses) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={addresses}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
        ListEmptyComponent={<Empty icon="📍" title="Manzil yo'q" text="Yetkazib berish manzilini qo'shing" />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 15 }}>{item.label}</Text>
              {!!item.is_default && (
                <View style={s.defaultBadge}>
                  <Text style={{ color: colors.brandDark, fontSize: 11, fontWeight: '700' }}>Asosiy</Text>
                </View>
              )}
            </View>
            <Text style={{ color: colors.ink2, marginTop: 4 }}>
              {item.region}, {item.city}, {item.street}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{item.phone}</Text>
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
              <TouchableOpacity onPress={() => navigation.navigate('AddressForm', { address: item })}>
                <Text style={s.link}>Tahrirlash</Text>
              </TouchableOpacity>
              {!item.is_default && (
                <TouchableOpacity onPress={() => makeDefault(item)}>
                  <Text style={s.link}>Asosiy qilish</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => remove(item)}>
                <Text style={[s.link, { color: colors.danger }]}>O'chirish</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={s.bottom}>
        <Button title="+ Yangi manzil" onPress={() => navigation.navigate('AddressForm', {})} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14,
    borderWidth: 1, borderColor: colors.line,
  },
  defaultBadge: {
    backgroundColor: colors.brandSoft, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  link: { color: colors.brand, fontWeight: '600', fontSize: 13 },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 24, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
});
