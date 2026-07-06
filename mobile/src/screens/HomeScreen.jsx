import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, FlatList,
  RefreshControl, Dimensions, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, imgUrl } from '../api/client';
import { colors, radius } from '../theme';
import { ProductCard, SectionHead, Loading } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

const { width: SCREEN_W } = Dimensions.get('window');
const RECENT_KEY = 'adm_recent_products';

export default function HomeScreen({ navigation }) {
  const { favIds, toggleFavorite, user } = useApp();
  const { t, lname } = useI18n();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const load = useCallback(async () => {
    const [b, c, p, d, n] = await Promise.all([
      api('/banners'),
      api('/categories'),
      api('/products?sort=popular&limit=8'),
      api('/products?sort=discount&limit=8'),
      api('/products?sort=new&limit=8'),
    ]);
    setBanners(b.banners);
    setCategories(c.categories);
    setPopular(p.products);
    setDiscounted(d.products.filter((x) => x.discount_percent > 0));
    setFresh(n.products);

    // oxirgi ko'rilgan mahsulotlar (lokal saqlanadi)
    try {
      const ids = JSON.parse((await AsyncStorage.getItem(RECENT_KEY)) || '[]');
      if (ids.length) {
        const r = await api(`/products?ids=${ids.join(',')}&limit=20`);
        const byId = new Map(r.products.map((x) => [x.id, x]));
        setRecent(ids.map((id) => byId.get(id)).filter(Boolean));
      } else {
        setRecent([]);
      }
    } catch {
      /* jim */
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // ekranga qaytganda "oxirgi ko'rilganlar" yangilanadi
  useEffect(() => {
    const unsub = navigation.addListener('focus', async () => {
      try {
        const ids = JSON.parse((await AsyncStorage.getItem(RECENT_KEY)) || '[]');
        if (!ids.length) return;
        const r = await api(`/products?ids=${ids.join(',')}&limit=20`);
        const byId = new Map(r.products.map((x) => [x.id, x]));
        setRecent(ids.map((id) => byId.get(id)).filter(Boolean));
      } catch {
        /* jim */
      }
    });
    return unsub;
  }, [navigation]);

  // banner avtomatik aylanishi
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setBannerIndex((i) => {
        const next = (i + 1) % banners.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  const openBanner = (b) => {
    if (b.link_type === 'product') navigation.navigate('ProductDetail', { id: b.link_id });
    else if (b.link_type === 'category')
      navigation.navigate('ProductList', { category: b.link_id, title: b.title });
  };

  const goProduct = (p) => navigation.navigate('ProductDetail', { id: p.id });

  const HScroll = ({ items }) => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={items}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          width={150}
          onPress={() => goProduct(item)}
          onToggleFav={user ? () => toggleFavorite(item.id) : undefined}
          isFav={favIds.has(item.id)}
        />
      )}
    />
  );

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>

        {/* Qidiruv paneli */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.searchBox} activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}>
            <Text style={{ color: colors.muted }}>🔍  {t('searchPlaceholder')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.bellBtn} onPress={() =>
            user ? navigation.navigate('Notifications') : navigation.navigate('Login')}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Bannerlar */}
        {banners.length > 0 && (
          <View>
            <FlatList
              ref={bannerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={banners}
              keyExtractor={(b) => String(b.id)}
              onMomentumScrollEnd={(e) =>
                setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))}
              getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.9} onPress={() => openBanner(item)}
                  style={{ width: SCREEN_W, paddingHorizontal: 16 }}>
                  <Image source={{ uri: imgUrl(item.image) }} style={s.banner} />
                </TouchableOpacity>
              )}
            />
            <View style={s.dots}>
              {banners.map((_, i) => (
                <View key={i} style={[s.dot, i === bannerIndex && s.dotOn]} />
              ))}
            </View>
          </View>
        )}

        {/* Kategoriyalar */}
        <SectionHead title={t('categories')} onMore={() => navigation.navigate('Catalog')} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ alignItems: 'center', width: 72 }}
              onPress={() => navigation.navigate('ProductList', { category: item.id, title: lname(item) })}>
              <View style={s.catCircle}>
                <Text style={{ fontSize: 26 }}>{item.icon || '🛍️'}</Text>
              </View>
              <Text numberOfLines={2} style={s.catName}>{lname(item)}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Chegirmalar */}
        {discounted.length > 0 && (
          <>
            <SectionHead title={t('discounts')}
              onMore={() => navigation.navigate('ProductList', { sort: 'discount', title: t('sortDiscount') })} />
            <HScroll items={discounted} />
          </>
        )}

        {/* Ommabop */}
        <SectionHead title={t('popularProducts')}
          onMore={() => navigation.navigate('ProductList', { sort: 'popular', title: t('sortPopular') })} />
        <HScroll items={popular} />

        {/* Yangi */}
        <SectionHead title={t('newProducts')}
          onMore={() => navigation.navigate('ProductList', { sort: 'new', title: t('sortNew') })} />
        <HScroll items={fresh} />

        {/* Oxirgi ko'rilganlar */}
        {recent.length > 0 && (
          <>
            <SectionHead title={t('recentlyViewed')} />
            <HScroll items={recent} />
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flex: 1, height: 44, backgroundColor: colors.surface, borderRadius: radius.md,
    justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line,
  },
  bellBtn: {
    width: 44, height: 44, backgroundColor: colors.surface, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line,
  },
  banner: { width: '100%', height: 150, borderRadius: radius.lg, backgroundColor: colors.line },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.brand, width: 16 },
  catCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brandSoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  catName: { fontSize: 11, textAlign: 'center', color: colors.ink2 },
});
