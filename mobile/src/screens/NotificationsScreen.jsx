import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, radius, fmtDate } from '../theme';
import { Loading, Empty } from '../components/ui';

const TYPE_ICON = { order: '📦', shop: '🏪', product: '🛍️', info: 'ℹ️' };

export default function NotificationsScreen() {
  const [items, setItems] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api('/me/notifications')
        .then(async (d) => {
          setItems(d.notifications);
          if (d.unread > 0) await api('/me/notifications/read', { method: 'POST' });
        })
        .catch(() => setItems([]));
    }, [])
  );

  if (!items) return <Loading />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={items}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      ListEmptyComponent={<Empty icon="🔔" title="Bildirishnoma yo'q" />}
      renderItem={({ item }) => (
        <View style={[s.card, !item.read && { borderColor: colors.brand, backgroundColor: colors.brandSoft }]}>
          <Text style={{ fontSize: 20 }}>{TYPE_ICON[item.type] || 'ℹ️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>{item.title}</Text>
            {item.body ? <Text style={{ color: colors.ink2, fontSize: 13, marginTop: 2 }}>{item.body}</Text> : null}
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{fmtDate(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line,
  },
});
