import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, FlatList,
  Dimensions, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, imgUrl } from '../api/client';
import { colors, radius } from '../theme';
import { Button, Rating, Price, ProductCard, Loading, Empty } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

const { width: SCREEN_W } = Dimensions.get('window');
const RECENT_KEY = 'adm_recent_products';

/** Ko'rilgan mahsulotni "oxirgi ko'rilganlar" ro'yxatiga yozadi (20 tagacha) */
async function trackRecent(id) {
  try {
    const ids = JSON.parse((await AsyncStorage.getItem(RECENT_KEY)) || '[]');
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 20);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* jim */
  }
}

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user, favIds, toggleFavorite, addToCart, cart } = useApp();
  const { t, lname, terr, fmtSum, fmtDate } = useI18n();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await api(`/products/${id}`);
      setProduct(d.product);
      setSimilar(d.similar);
      trackRecent(d.product.id);
      const r = await api(`/products/${id}/reviews?limit=2`);
      setReviews(r.reviews);
      setReviewTotal(r.total);
    } catch (e) {
      setError(terr(e.message));
    }
  }, [id]); // eslint-disable-line

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <Empty icon="😕" title={t('productNotFound')} text={error} />;
  if (!product) return <Loading />;

  const inCartQty = cart.items.find((i) => i.product.id === product.id)?.qty || 0;
  const isFav = favIds.has(product.id);
  const description = lname(product, 'description');

  const requireAuth = (fn) => () => {
    if (!user) {
      Alert.alert(t('authNeeded'), t('authNeededText'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('login'), onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    fn();
  };

  const handleAdd = requireAuth(async () => {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (e) {
      Alert.alert(t('error'), terr(e.message) || t('cantAddCart'));
    } finally {
      setAdding(false);
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rasm galereyasi */}
        <View style={{ backgroundColor: colors.surface }}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={product.images.length ? product.images : [null]}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) =>
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
            renderItem={({ item }) => (
              <Image source={{ uri: imgUrl(item) }} style={{ width: SCREEN_W, height: SCREEN_W * 0.9 }}
                resizeMode="cover" />
            )}
          />
          {product.images.length > 1 && (
            <View style={s.dots}>
              {product.images.map((_, i) => (
                <View key={i} style={[s.dot, i === imgIndex && s.dotOn]} />
              ))}
            </View>
          )}
          <TouchableOpacity style={s.favFloat} onPress={requireAuth(() => toggleFavorite(product.id))}>
            <Text style={{ fontSize: 20 }}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          {product.discount_percent > 0 && (
            <View style={s.salePill}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                −{product.discount_percent}%
              </Text>
            </View>
          )}
        </View>

        {/* Asosiy ma'lumot */}
        <View style={s.block}>
          <Text style={s.name}>{lname(product)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <Rating value={product.rating} count={product.rating_count} size={14} />
            <Text style={{ color: colors.muted, fontSize: 13 }}>{t('soldCount', { n: product.sold_count })}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Price price={product.price} oldPrice={product.old_price} size={24} />
          </View>
          <Text style={{ marginTop: 6, color: product.stock > 0 ? colors.goodText : colors.danger, fontWeight: '600', fontSize: 13 }}>
            {product.stock > 0
              ? product.stock <= 5
                ? t('lowStock', { n: product.stock })
                : t('inStock')
              : t('outOfStock')}
          </Text>
        </View>

        {/* Do'kon */}
        <TouchableOpacity style={[s.block, s.shopRow]}
          onPress={() => navigation.navigate('ProductList', { shop: product.shop_id, title: product.shop_name })}>
          {product.shop_logo ? (
            <Image source={{ uri: imgUrl(product.shop_logo) }} style={s.shopLogo} />
          ) : (
            <View style={[s.shopLogo, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text>🏪</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.ink }}>{product.shop_name}</Text>
            <Rating value={product.shop_rating} size={12} />
          </View>
          <Text style={{ color: colors.muted }}>›</Text>
        </TouchableOpacity>

        {/* Xususiyatlar */}
        {Object.keys(product.attributes).length > 0 && (
          <View style={s.block}>
            <Text style={s.blockTitle}>{t('specs')}</Text>
            {Object.entries(product.attributes).map(([k, v]) => (
              <View key={k} style={s.attrRow}>
                <Text style={{ color: colors.ink2, flex: 1 }}>{k}</Text>
                <Text style={{ color: colors.ink, fontWeight: '600', flex: 1, textAlign: 'right' }}>{String(v)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tavsif */}
        {description ? (
          <View style={s.block}>
            <Text style={s.blockTitle}>{t('description')}</Text>
            <Text style={{ color: colors.ink2, lineHeight: 21 }}>{description}</Text>
          </View>
        ) : null}

        {/* Sharhlar */}
        <View style={s.block}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={s.blockTitle}>{t('reviewsCount', { n: reviewTotal })}</Text>
            {reviewTotal > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Reviews', { productId: product.id })}>
                <Text style={{ color: colors.brand, fontWeight: '600' }}>{t('viewAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length === 0 && (
            <Text style={{ color: colors.muted, marginTop: 6 }}>{t('noReviews')}</Text>
          )}
          {reviews.map((r) => (
            <View key={r.id} style={s.review}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: colors.ink }}>{r.user_name}</Text>
                <Text style={{ color: colors.star }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              </View>
              {r.comment ? <Text style={{ color: colors.ink2, marginTop: 4 }}>{r.comment}</Text> : null}
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{fmtDate(r.created_at)}</Text>
            </View>
          ))}
        </View>

        {/* O'xshash mahsulotlar */}
        {similar.length > 0 && (
          <View style={{ marginTop: 8, marginBottom: 12 }}>
            <Text style={[s.blockTitle, { paddingHorizontal: 16, marginBottom: 10 }]}>{t('similar')}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={similar}
              keyExtractor={(p) => String(p.id)}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item }) => (
                <ProductCard product={item} width={150}
                  onPress={() => navigation.push('ProductDetail', { id: item.id })} />
              )}
            />
          </View>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Pastki panel */}
      <View style={s.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.muted, fontSize: 11 }}>{t('price')}</Text>
          <Text style={{ fontWeight: '800', fontSize: 17, color: colors.ink }}>{fmtSum(product.price)}</Text>
        </View>
        {inCartQty > 0 ? (
          <Button title={t('goToCart', { n: inCartQty })} style={{ flex: 1.6 }}
            onPress={() => navigation.navigate('Main', { screen: 'Cart' })} />
        ) : (
          <Button title={product.stock > 0 ? t('addToCart') : t('outOfStock')}
            style={{ flex: 1.6 }} disabled={product.stock === 0} loading={adding} onPress={handleAdd} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dots: {
    position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.brand, width: 14 },
  favFloat: {
    position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
  salePill: {
    position: 'absolute', top: 14, left: 12, backgroundColor: colors.sale,
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  block: {
    backgroundColor: colors.surface, padding: 16, marginTop: 8,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.ink, lineHeight: 25 },
  blockTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bg },
  attrRow: {
    flexDirection: 'row', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  review: {
    marginTop: 12, padding: 12, backgroundColor: colors.bg, borderRadius: radius.md,
  },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: 22,
  },
});
