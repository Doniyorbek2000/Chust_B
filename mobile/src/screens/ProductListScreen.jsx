import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, ActivityIndicator,
} from 'react-native';
import { api } from '../api/client';
import { colors, radius } from '../theme';
import { ProductCard, Empty, Button, Input, Loading } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

const SORT_KEYS = [
  ['popular', 'sortPopular'],
  ['new', 'sortNew'],
  ['price_asc', 'sortPriceAsc'],
  ['price_desc', 'sortPriceDesc'],
  ['rating', 'sortRating'],
  ['discount', 'sortDiscount'],
];

/** Mahsulotlar ro'yxati — kategoriya, qidiruv, saralash va narx filtri bilan */
export default function ProductListScreen({ route, navigation }) {
  const { category, q, shop, sort: initialSort = 'popular' } = route.params || {};
  const { favIds, toggleFavorite, user } = useApp();
  const { t } = useI18n();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(initialSort);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (p, replace) => {
      const params = new URLSearchParams({ page: String(p), sort, limit: '20' });
      if (category) params.set('category', category);
      if (q) params.set('q', q);
      if (shop) params.set('shop', shop);
      if (priceRange.min) params.set('min_price', priceRange.min);
      if (priceRange.max) params.set('max_price', priceRange.max);
      const d = await api(`/products?${params}`);
      setProducts((prev) => (replace ? d.products : [...prev, ...d.products]));
      setPages(d.pages);
      setTotal(d.total);
      setPage(p);
    },
    [category, q, shop, sort, priceRange]
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(1, true).finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    if (loadingMore || page >= pages) return;
    setLoadingMore(true);
    await fetchPage(page + 1, false).catch(() => {});
    setLoadingMore(false);
  };

  const hasFilter = priceRange.min || priceRange.max;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Saralash / filtr paneli */}
      <View style={s.toolbar}>
        <TouchableOpacity style={s.toolBtn} onPress={() => setShowSort(true)}>
          <Text style={s.toolText}>↕️ {t(SORT_KEYS.find(([k]) => k === sort)?.[1])}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.toolBtn, hasFilter && { borderColor: colors.brand }]}
          onPress={() => setShowFilter(true)}>
          <Text style={[s.toolText, hasFilter && { color: colors.brand }]}>⚙️ {t('filter')}{hasFilter ? ' •' : ''}</Text>
        </TouchableOpacity>
        <Text style={{ marginLeft: 'auto', color: colors.muted, fontSize: 12 }}>{t('count', { n: total })}</Text>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.brand} style={{ margin: 16 }} /> : null}
          ListEmptyComponent={
            <Empty icon="🔍" title={t('notFound')} text={t('notFoundText')} />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              onToggleFav={user ? () => toggleFavorite(item.id) : undefined}
              isFav={favIds.has(item.id)}
            />
          )}
        />
      )}

      {/* Saralash modali */}
      <Modal visible={showSort} transparent animationType="slide" onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{t('sortTitle')}</Text>
            {SORT_KEYS.map(([key, labelKey]) => (
              <TouchableOpacity key={key} style={s.sheetRow}
                onPress={() => { setSort(key); setShowSort(false); }}>
                <Text style={{ fontSize: 15, color: sort === key ? colors.brand : colors.ink, fontWeight: sort === key ? '700' : '400' }}>
                  {t(labelKey)}
                </Text>
                {sort === key && <Text style={{ color: colors.brand, fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filtr modali */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{t('priceFilter')}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label={t('priceFrom')} keyboardType="numeric" value={priceRange.min}
                  onChangeText={(v) => setPriceRange({ ...priceRange, min: v.replace(/\D/g, '') })}
                  placeholder="0" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label={t('priceTo')} keyboardType="numeric" value={priceRange.max}
                  onChangeText={(v) => setPriceRange({ ...priceRange, max: v.replace(/\D/g, '') })}
                  placeholder="∞" />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title={t('clear')} variant="ghost" style={{ flex: 1 }}
                onPress={() => { setPriceRange({ min: '', max: '' }); setShowFilter(false); }} />
              <Button title={t('apply')} style={{ flex: 1 }} onPress={() => setShowFilter(false)} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  toolBtn: {
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  toolText: { fontSize: 13, color: colors.ink2, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 34,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  sheetRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
});
