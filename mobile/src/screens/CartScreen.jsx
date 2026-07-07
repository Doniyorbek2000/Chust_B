import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { imgUrl } from '../api/client';
import { colors, radius } from '../theme';
import { Button, QtyStepper, Empty } from '../components/ui';
import { useApp } from '../store/AppContext';
import { useI18n } from '../i18n';

export default function CartScreen({ navigation }) {
  const { user, cart, refreshCart, updateCartItem, removeCartItem } = useApp();
  const { t, lname, fmtSum } = useI18n();
  const [busyId, setBusyId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (user) refreshCart();
    }, [user, refreshCart])
  );

  if (!user) {
    return (
      <SafeAreaView style={s.wrap} edges={['top']}>
        <Text style={s.title}>{t('cartTitle')}</Text>
        <Empty icon="🔐" title={t('loginRequired')} text={t('cartLoginText')}
          action={<Button title={t('login')} style={{ marginTop: 10, paddingHorizontal: 40 }}
            onPress={() => navigation.navigate('Login')} />} />
      </SafeAreaView>
    );
  }

  const changeQty = async (item, qty) => {
    if (qty < 1) return;
    setBusyId(item.id);
    try {
      await updateCartItem(item.id, qty);
    } finally {
      setBusyId(null);
    }
  };

  const remove = (item) => {
    Alert.alert(t('delete'), t('removeFromCartQ', { name: lname(item.product) }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => removeCartItem(item.id) },
    ]);
  };

  const available = cart.items.filter((i) => i.available);
  const freeFrom = cart.free_shipping_from || 300000;
  const freeLeft = Math.max(0, freeFrom - cart.subtotal);
  const freeProgress = Math.min(1, cart.subtotal / freeFrom);

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Text style={s.title}>
        {t('cartTitle')} {cart.items.length ? `(${cart.items.length})` : ''}
      </Text>

      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingBottom: 240, paddingHorizontal: 16, gap: 10 }}
        ListEmptyComponent={
          <Empty icon="🛒" title={t('cartEmpty')} text={t('cartEmptyText')}
            action={<Button title={t('startShopping')} style={{ marginTop: 10, paddingHorizontal: 30 }}
              onPress={() => navigation.navigate('Home')} />} />
        }
        renderItem={({ item }) => (
          <View style={[s.item, !item.available && { opacity: 0.55 }]}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.product.id })}>
              <Image source={{ uri: imgUrl(item.product.image) }} style={s.img} />
            </TouchableOpacity>
            <View style={{ flex: 1, gap: 4 }}>
              <Text numberOfLines={2} style={{ color: colors.ink, fontSize: 13.5 }}>{lname(item.product)}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.product.shop_name}</Text>
              {!item.available && (
                <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>{t('outOfStock')}</Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontWeight: '800', color: colors.ink, fontSize: 15 }}>
                  {fmtSum(item.line_total)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <QtyStepper qty={item.qty} max={item.product.stock}
                    onChange={(q) => busyId !== item.id && changeQty(item, q)} />
                  <TouchableOpacity onPress={() => remove(item)} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {available.length > 0 && (
        <View style={s.summary}>
          {/* Bepul yetkazish progressi */}
          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '600', color: freeLeft > 0 ? colors.ink2 : colors.goodText }}>
              {freeLeft > 0 ? t('freeShipLeft', { n: fmtSum(freeLeft) }) : t('freeShipDone')}
            </Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${freeProgress * 100}%` },
                freeLeft === 0 && { backgroundColor: colors.good }]} />
            </View>
          </View>

          <View style={s.sumRow}>
            <Text style={{ color: colors.ink2 }}>{t('productsN', { n: available.length })}</Text>
            <Text style={{ fontWeight: '600', color: colors.ink }}>{fmtSum(cart.subtotal)}</Text>
          </View>
          <View style={s.sumRow}>
            <Text style={{ color: colors.ink2 }}>{t('shipping')}</Text>
            <Text style={{ fontWeight: '600', color: cart.shipping_fee ? colors.ink : colors.goodText }}>
              {cart.shipping_fee ? fmtSum(cart.shipping_fee) : t('free')}
            </Text>
          </View>
          <View style={[s.sumRow, { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 }]}>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.ink }}>{t('total')}</Text>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.ink }}>{fmtSum(cart.total)}</Text>
          </View>
          <Button title={t('checkoutBtn')} onPress={() => navigation.navigate('Checkout')} />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, padding: 16, paddingBottom: 10 },
  item: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: 12, borderWidth: 1, borderColor: colors.line,
  },
  img: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.bg },
  summary: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, padding: 16, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: colors.line, gap: 8,
  },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTrack: {
    height: 6, backgroundColor: colors.line, borderRadius: 3, marginTop: 6, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 3 },
});
