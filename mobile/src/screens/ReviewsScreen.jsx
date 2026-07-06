import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { api } from '../api/client';
import { colors, radius } from '../theme';
import { Loading, Empty } from '../components/ui';
import { useI18n } from '../i18n';

/** Mahsulotning barcha sharhlari — baho taqsimoti bilan */
export default function ReviewsScreen({ route }) {
  const { productId } = route.params;
  const { t, fmtDate } = useI18n();
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/products/${productId}/reviews?limit=50`).then(setData).catch(() => setData({ reviews: [], distribution: [] }));
  }, [productId]);

  if (!data) return <Loading />;

  const dist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    n: data.distribution.find((d) => d.rating === r)?.n || 0,
  }));
  const maxN = Math.max(1, ...dist.map((d) => d.n));

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={data.reviews}
      keyExtractor={(r) => String(r.id)}
      ListHeaderComponent={
        <View style={s.distCard}>
          {dist.map((d) => (
            <View key={d.rating} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ width: 34, color: colors.ink2, fontSize: 13 }}>{d.rating} ★</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: colors.line, borderRadius: 4 }}>
                <View style={{ width: `${(d.n / maxN) * 100}%`, height: '100%', backgroundColor: colors.star, borderRadius: 4 }} />
              </View>
              <Text style={{ width: 28, textAlign: 'right', color: colors.muted, fontSize: 12 }}>{d.n}</Text>
            </View>
          ))}
        </View>
      }
      ListEmptyComponent={<Empty icon="💬" title={t('noReviews')} text={t('noReviewsText')} />}
      renderItem={({ item }) => (
        <View style={s.review}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>{item.user_name}</Text>
            <Text style={{ color: colors.star }}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
          </View>
          {item.comment ? <Text style={{ color: colors.ink2, marginTop: 5, lineHeight: 20 }}>{item.comment}</Text> : null}
          <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>{fmtDate(item.created_at)}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  distCard: { backgroundColor: colors.surface, margin: 16, marginBottom: 8, padding: 16, borderRadius: radius.lg },
  review: {
    backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: radius.md,
  },
});
