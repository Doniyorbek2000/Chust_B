import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, imgUrl } from '../api/client';
import { colors, radius, fmtSum, fmtDate, ORDER_STATUS } from '../theme';
import { Loading, Button } from '../components/ui';

const TIMELINE = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [reviewing, setReviewing] = useState(null); // order item

  const load = useCallback(
    () => api(`/orders/${id}`).then((d) => setOrder(d.order)),
    [id]
  );

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load])
  );

  if (!order) return <Loading />;

  const st = ORDER_STATUS[order.status];
  const cancelled = order.status === 'cancelled';
  const reachedIndex = TIMELINE.indexOf(order.status);

  const cancel = () => {
    Alert.alert('Bekor qilish', 'Buyurtmani bekor qilmoqchimisiz?', [
      { text: "Yo'q", style: 'cancel' },
      {
        text: 'Ha, bekor qilish', style: 'destructive',
        onPress: async () => {
          try {
            await api(`/orders/${order.id}/cancel`, { method: 'POST' });
            load();
          } catch (e) {
            Alert.alert('Xatolik', e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Holat */}
      <View style={s.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{order.shop?.name}</Text>
          <View style={[s.statusPill, { backgroundColor: st.bg }]}>
            <Text style={{ color: st.color, fontWeight: '700', fontSize: 12 }}>{st.icon} {st.label}</Text>
          </View>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{fmtDate(order.created_at)}</Text>

        {/* Jarayon chizig'i */}
        {!cancelled && (
          <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center' }}>
            {TIMELINE.map((step, i) => {
              const done = i <= reachedIndex;
              return (
                <View key={step} style={{ flex: i === 0 ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}>
                  {i > 0 && <View style={[s.tLine, done && { backgroundColor: colors.brand }]} />}
                  <View style={[s.tDot, done && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
                    {done && <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {!cancelled && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {TIMELINE.map((step) => (
              <Text key={step} style={{ fontSize: 10, color: colors.muted, flex: 1, textAlign: 'center' }}>
                {ORDER_STATUS[step].label}
              </Text>
            ))}
          </View>
        )}

        {/* Tarix */}
        <View style={{ marginTop: 14, gap: 8 }}>
          {order.history.map((h, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: colors.muted, fontSize: 12, width: 108 }}>{fmtDate(h.created_at)}</Text>
              <Text style={{ color: colors.ink2, fontSize: 12, flex: 1 }}>
                {ORDER_STATUS[h.status]?.label}{h.note ? ` — ${h.note}` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Mahsulotlar */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Mahsulotlar</Text>
        {order.items.map((it) => (
          <View key={it.id} style={s.itemRow}>
            <Image source={{ uri: imgUrl(it.image) }} style={s.itemImg} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={{ color: colors.ink, fontSize: 13.5 }}>{it.name}</Text>
              <Text style={{ color: colors.ink2, marginTop: 2, fontSize: 13 }}>
                {it.qty} × {fmtSum(it.price)}
              </Text>
              {order.status === 'delivered' && (
                <TouchableOpacity onPress={() => setReviewing(it)}>
                  <Text style={{ color: colors.brand, fontWeight: '600', fontSize: 13, marginTop: 4 }}>
                    ⭐ Baholash
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontWeight: '700', color: colors.ink }}>{fmtSum(it.price * it.qty)}</Text>
          </View>
        ))}
      </View>

      {/* To'lov xulosasi */}
      <View style={s.card}>
        <Text style={s.cardTitle}>To'lov</Text>
        <Row label="Mahsulotlar" value={fmtSum(order.subtotal)} />
        <Row label="Yetkazib berish" value={order.shipping_fee ? fmtSum(order.shipping_fee) : 'Bepul'} />
        {order.discount > 0 && (
          <Row label={`Chegirma${order.coupon_code ? ` (${order.coupon_code})` : ''}`}
            value={`−${fmtSum(order.discount)}`} good />
        )}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginVertical: 8 }} />
        <Row label="Jami" value={fmtSum(order.total)} bold />
        <Row label="Usul"
          value={`${order.payment_method === 'card' ? '💳 Karta' : '💵 Naqd'} · ${{ pending: 'kutilmoqda', paid: "to'langan", refunded: 'qaytarilgan' }[order.payment_status]}`} />
      </View>

      {/* Manzil */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Yetkazib berish manzili</Text>
        <Text style={{ color: colors.ink2, lineHeight: 20 }}>
          {order.address.region}, {order.address.city}{'\n'}{order.address.street}{'\n'}{order.address.phone}
        </Text>
      </View>

      {['pending', 'confirmed'].includes(order.status) && (
        <Button title="Buyurtmani bekor qilish" variant="danger" onPress={cancel} />
      )}

      {/* Baholash modali */}
      <Modal visible={!!reviewing} transparent animationType="slide" onRequestClose={() => setReviewing(null)}>
        {reviewing && (
          <ReviewSheet item={reviewing} orderId={order.id}
            onClose={() => setReviewing(null)}
            onDone={() => { setReviewing(null); Alert.alert('Rahmat!', 'Sharhingiz saqlandi'); }} />
        )}
      </Modal>
    </ScrollView>
  );
}

function ReviewSheet({ item, orderId, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api(`/orders/${orderId}/review`, {
        method: 'POST',
        body: { product_id: item.product_id, rating, comment },
      });
      onDone();
    } catch (e) {
      Alert.alert('Xatolik', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={s.sheet}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <TouchableOpacity key={r} onPress={() => setRating(r)}>
              <Text style={{ fontSize: 34, color: r <= rating ? colors.star : colors.line }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={s.commentInput}
          placeholder="Fikringizni yozing (ixtiyoriy)…"
          placeholderTextColor={colors.muted}
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <Button title="Yuborish" loading={busy} onPress={submit} style={{ marginTop: 12 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function Row({ label, value, bold, good }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={{ color: colors.ink2, fontWeight: bold ? '800' : '400' }}>{label}</Text>
      <Text style={{ color: good ? colors.goodText : colors.ink, fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.line,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  statusPill: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tDot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.line,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  tLine: { flex: 1, height: 3, backgroundColor: colors.line },
  itemRow: {
    flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  itemImg: { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.bg },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 34,
  },
  commentInput: {
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12,
    minHeight: 84, textAlignVertical: 'top', fontSize: 14, color: colors.ink,
  },
});
