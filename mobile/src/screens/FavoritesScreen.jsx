import { useState, useCallback } from 'react';
import { Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { colors } from '../theme';
import { ProductCard, Empty, Button, Loading } from '../components/ui';
import { useApp } from '../store/AppContext';

export default function FavoritesScreen({ navigation }) {
  const { user, favIds, toggleFavorite } = useApp();
  const [products, setProducts] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      api('/me/favorites').then((d) => setProducts(d.favorites)).catch(() => setProducts([]));
    }, [user, favIds.size]) // eslint-disable-line
  );

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.ink, padding: 16 }}>Sevimlilar</Text>
        <Empty icon="🔐" title="Hisobingizga kiring" text="Sevimlilar ro'yxati uchun tizimga kiring"
          action={<Button title="Kirish" style={{ marginTop: 10, paddingHorizontal: 40 }}
            onPress={() => navigation.navigate('Login')} />} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.ink, padding: 16, paddingBottom: 10 }}>
        Sevimlilar {products?.length ? `(${products.length})` : ''}
      </Text>
      {!products ? (
        <Loading />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          ListEmptyComponent={
            <Empty icon="❤️" title="Sevimlilar bo'sh"
              text="Mahsulot kartasidagi yurak belgisini bosib qo'shing" />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              onToggleFav={() => toggleFavorite(item.id)}
              isFav={favIds.has(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
