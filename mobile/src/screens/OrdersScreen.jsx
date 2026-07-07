import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, imgUrl } from '../api/client';
import { colors, radius, ORDER_STATUS_STYLE } from '../theme';
import { Loading, Empty, Button } from '../components/ui';
import { useI18n, ORDER_STATUS_KEYS } from '../i18n';

export default function OrdersScreen({ navigation }) {
  const { t, fmtSum, fmtDate } = useI18n();
  const [orders, setOrders] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => api('/orders').then((d) => setOrders(d.orders)), []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setOrders([]));
    }, [load])
  );

  if (!orders) return <Loading />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={orders}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      refreshControl={
        <RefreshControl refreshing={refreshing}
          onRefresh={async () => { setRefreshing(true); await load().catch(() => {}); setRefreshing(false); }} />
      }
      ListEmptyComponent={
        <Empty icon="📦" title={t('ordersEmpty')} text={t('ordersEmptyText')}
          action={<Button title={t('shopNow')} style={{ marginTop: 10, paddingHorizontal: 34 }}
            onPress={() => navigation.navigate('Main')} />} />
      }
      renderItem={({ item }) => {
        const st = ORDER_STATUS_STYLE[item.status];
        return (
          <TouchableOpacity style={s.card} activeOpacity={0.8}
            onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: colors.ink }}>#{item.id} — {item.shop?.name}</Text>
              <View style={[s.status, { backgroundColor: st.bg }]}>
                <Text style={{ color: st.color, fontSize: 12, fontWeight: '700' }}>
                  {st.icon} {t(ORDER_STATUS_KEYS[item.status])}
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{fmtDate(item.created_at)}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {item.items.slice(0, 4).map((it) => (
                <Image key={it.id} source={{ uri: imgUrl(it.image) }} style={s.thumb} />
              ))}
              {item.items.length > 4 && (
                <View style={[s.thumb, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: colors.ink2, fontWeight: '700' }}>+{item.items.length - 4}</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: colors.ink2 }}>{t('itemsN', { n: item.items.length })}</Text>
              <Text style={{ fontWeight: '800', color: colors.ink }}>{fmtSum(item.total)}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14,
    borderWidth: 1, borderColor: colors.line,
  },
  status: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.bg },
});
