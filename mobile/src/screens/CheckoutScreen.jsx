import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { colors, radius, fmtSum } from '../theme';
import { Button, Input } from '../components/ui';
import { useApp } from '../store/AppContext';

/** Buyurtma rasmiylashtirish: manzil → to'lov → promokod → tasdiqlash */
export default function CheckoutScreen({ navigation }) {
  const { cart, refreshCart } = useApp();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [payment, setPayment] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null); // {coupon, discount}
  const [couponError, setCouponError] = useState('');
  const [placing, setPlacing] = useState(false);

  const loadAddresses = useCallback(async () => {
    const d = await api('/me/addresses');
    setAddresses(d.addresses);
    if (d.addresses.length && !d.addresses.some((a) => a.id === addressId)) {
      setAddressId((d.addresses.find((a) => a.is_default) || d.addresses[0]).id);
    }
  }, [addressId]);

  useFocusEffect(
    useCallback(() => {
      loadAddresses().catch(() => {});
    }, [loadAddresses])
  );

  useEffect(() => {
    if (cart.items.length === 0) navigation.goBack();
  }, [cart.items.length, navigation]);

  const applyCoupon = async () => {
    setCouponError('');
    setCoupon(null);
    if (!couponCode.trim()) return;
    try {
      const d = await api('/orders/validate-coupon', {
        method: 'POST',
        body: { code: couponCode.trim(), subtotal: cart.subtotal },
      });
      setCoupon(d);
    } catch (e) {
      setCouponError(e.message);
    }
  };

  const discount = coupon?.discount || 0;
  const total = Math.max(0, cart.subtotal - discount) + cart.shipping_fee;

  const placeOrder = async () => {
    if (!addressId) {
      Alert.alert('Manzil kerak', 'Avval yetkazib berish manzilini qo‘shing');
      return;
    }
    setPlacing(true);
    try {
      const d = await api('/orders', {
        method: 'POST',
        body: {
          address_id: addressId,
          payment_method: payment,
          coupon_code: coupon ? coupon.coupon.code : undefined,
        },
      });
      await refreshCart();
      navigation.replace('OrderSuccess', { orders: d.orders });
    } catch (e) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Manzil */}
        <Text style={s.section}>📍 Yetkazib berish manzili</Text>
        {addresses.map((a) => (
          <TouchableOpacity key={a.id} style={[s.option, addressId === a.id && s.optionOn]}
            onPress={() => setAddressId(a.id)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.ink }}>{a.label}</Text>
              <Text style={{ color: colors.ink2, fontSize: 13, marginTop: 2 }}>
                {a.region}, {a.city}, {a.street}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{a.phone}</Text>
            </View>
            <View style={[s.radio, addressId === a.id && s.radioOn]} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddressForm', {})}>
          <Text style={{ color: colors.brand, fontWeight: '700' }}>+ Yangi manzil qo'shish</Text>
        </TouchableOpacity>

        {/* To'lov */}
        <Text style={s.section}>💳 To'lov usuli</Text>
        {[['cash', '💵 Naqd pul', 'Yetkazib berilganda to‘laysiz'],
          ['card', '💳 Karta orqali', 'Hozir onlayn to‘lov (demo)']].map(([key, label, hint]) => (
          <TouchableOpacity key={key} style={[s.option, payment === key && s.optionOn]}
            onPress={() => setPayment(key)}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: colors.ink }}>{label}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{hint}</Text>
            </View>
            <View style={[s.radio, payment === key && s.radioOn]} />
          </TouchableOpacity>
        ))}

        {/* Promokod */}
        <Text style={s.section}>🎟️ Promokod</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input placeholder="SALOM10" autoCapitalize="characters" value={couponCode}
              onChangeText={(v) => { setCouponCode(v); setCoupon(null); setCouponError(''); }}
              error={couponError} />
          </View>
          <Button title="Qo'llash" variant="ghost" style={{ height: 48 }} onPress={applyCoupon} />
        </View>
        {coupon && (
          <Text style={{ color: colors.goodText, fontWeight: '600', marginTop: -6 }}>
            ✓ "{coupon.coupon.code}" qo'llandi — {fmtSum(coupon.discount)} chegirma
          </Text>
        )}

        {/* Xulosa */}
        <Text style={s.section}>🧾 Buyurtma xulosasi</Text>
        <View style={s.summaryCard}>
          <Row label={`Mahsulotlar (${cart.items.length})`} value={fmtSum(cart.subtotal)} />
          <Row label="Yetkazib berish" value={cart.shipping_fee ? fmtSum(cart.shipping_fee) : 'Bepul'} />
          {discount > 0 && <Row label="Chegirma" value={`−${fmtSum(discount)}`} good />}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginVertical: 8 }} />
          <Row label="Jami to'lov" value={fmtSum(total)} bold />
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.muted, fontSize: 11 }}>Jami</Text>
          <Text style={{ fontWeight: '800', fontSize: 17, color: colors.ink }}>{fmtSum(total)}</Text>
        </View>
        <Button title="Buyurtmani tasdiqlash" style={{ flex: 1.7 }} loading={placing} onPress={placeOrder} />
      </View>
    </View>
  );
}

function Row({ label, value, bold, good }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ color: bold ? colors.ink : colors.ink2, fontWeight: bold ? '800' : '400', fontSize: bold ? 16 : 14 }}>
        {label}
      </Text>
      <Text style={{
        color: good ? colors.goodText : colors.ink,
        fontWeight: bold ? '800' : '600', fontSize: bold ? 16 : 14,
      }}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 18, marginBottom: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14,
    borderWidth: 1.5, borderColor: colors.line, marginBottom: 8,
  },
  optionOn: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.line },
  radioOn: { borderColor: colors.brand, borderWidth: 6 },
  addBtn: {
    padding: 13, alignItems: 'center', borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.brand, borderStyle: 'dashed',
  },
  summaryCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, padding: 16, paddingBottom: 22,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
});
