import { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { imgUrl } from '../api/client';
import { colors, radius, fmtSum } from '../theme';
import { Button, QtyStepper, Empty } from '../components/ui';
import { useApp } from '../store/AppContext';

export default function CartScreen({ navigation }) {
  const { user, cart, refreshCart, updateCartItem, removeCartItem } = useApp();
  const [busyId, setBusyId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (user) refreshCart();
    }, [user, refreshCart])
  );

  if (!user) {
    return (
      <SafeAreaView style={s.wrap} edges={['top']}>
        <Text style={s.title}>Savat</Text>
        <Empty icon="🔐" title="Hisobingizga kiring"
          text="Savatdan foydalanish uchun tizimga kirishingiz kerak"
          action={<Button title="Kirish" style={{ marginTop: 10, paddingHorizontal: 40 }}
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
    Alert.alert("O'chirish", `"${item.product.name}" savatdan olinsinmi?`, [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => removeCartItem(item.id) },
    ]);
  };

  const available = cart.items.filter((i) => i.available);

  return (
    <SafeAreaView style={s.wrap} edges={['top']}>
      <Text style={s.title}>Savat {cart.items.length ? `(${cart.items.length})` : ''}</Text>

      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: 16, gap: 10 }}
        ListEmptyComponent={
          <Empty icon="🛒" title="Savat bo'sh" text="Mahsulotlarni qo'shib xarid qilishni boshlang"
            action={<Button title="Xaridni boshlash" style={{ marginTop: 10, paddingHorizontal: 30 }}
              onPress={() => navigation.navigate('Home')} />} />
        }
        renderItem={({ item }) => (
          <View style={[s.item, !item.available && { opacity: 0.55 }]}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { id: item.product.id })}>
              <Image source={{ uri: imgUrl(item.product.image) }} style={s.img} />
            </TouchableOpacity>
            <View style={{ flex: 1, gap: 4 }}>
              <Text numberOfLines={2} style={{ color: colors.ink, fontSize: 13.5 }}>{item.product.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.product.shop_name}</Text>
              {!item.available && (
                <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>Omborda qolmagan</Text>
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
          <View style={s.sumRow}>
            <Text style={{ color: colors.ink2 }}>Mahsulotlar ({available.length})</Text>
            <Text style={{ fontWeight: '600', color: colors.ink }}>{fmtSum(cart.subtotal)}</Text>
          </View>
          <View style={s.sumRow}>
            <Text style={{ color: colors.ink2 }}>Yetkazib berish</Text>
            <Text style={{ fontWeight: '600', color: cart.shipping_fee ? colors.ink : colors.goodText }}>
              {cart.shipping_fee ? fmtSum(cart.shipping_fee) : 'Bepul'}
            </Text>
          </View>
          <View style={[s.sumRow, { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 }]}>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.ink }}>Jami</Text>
            <Text style={{ fontWeight: '800', fontSize: 16, color: colors.ink }}>{fmtSum(cart.total)}</Text>
          </View>
          <Button title="Buyurtma berish →" onPress={() => navigation.navigate('Checkout')} />
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
});
