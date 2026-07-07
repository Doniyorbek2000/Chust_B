import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, imgUrl } from '../api/client';
import { colors, radius, ORDER_STATUS_STYLE } from '../theme';
import { Loading, Button } from '../components/ui';
import { useI18n, ORDER_STATUS_KEYS } from '../i18n';

const TIMELINE = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailScreen({ route }) {
  const { id } = route.params;
  const { t, terr, fmtSum, fmtDate } = useI18n();
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

  const st = ORDER_STATUS_STYLE[order.status];
  const cancelled = order.status === 'cancelled';
  const reachedIndex = TIMELINE.indexOf(order.status);
  const PAY_LABEL = { pending: t('payPending'), paid: t('payPaid'), refunded: t('payRefunded') };

  const cancel = () => {
    Alert.alert(t('cancelOrder'), t('cancelOrderQ'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yesCancel'), style: 'destructive',
        onPress: async () => {
          try {
            await api(`/orders/${order.id}/cancel`, { method: 'POST' });
            load();
          } catch (e) {
            Alert.alert(t('error'), terr(e.message));
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
            <Text style={{ color: st.color, fontWeight: '700', fontSize: 12 }}>
              {st.icon} {t(ORDER_STATUS_KEYS[order.status])}
            </Text>
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
                {t(ORDER_STATUS_KEYS[step])}
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
                {t(ORDER_STATUS_KEYS[h.status])}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Mahsulotlar */}
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('productsBlock')}</Text>
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
                    {t('rate')}
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
        <Text style={s.cardTitle}>{t('paymentBlock')}</Text>
        <Row label={t('productsBlock')} value={fmtSum(order.subtotal)} />
        <Row label={t('shipping')} value={order.shipping_fee ? fmtSum(order.shipping_fee) : t('free')} />
        {order.discount > 0 && (
          <Row label={`${t('discount')}${order.coupon_code ? ` (${order.coupon_code})` : ''}`}
            value={`−${fmtSum(order.discount)}`} good />
        )}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginVertical: 8 }} />
        <Row label={t('total')} value={fmtSum(order.total)} bold />
        <Row label={t('method')}
          value={`${order.payment_method === 'card' ? t('cardShort') : t('cashShort')} · ${PAY_LABEL[order.payment_status]}`} />
      </View>

      {/* Manzil */}
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('addressBlock')}</Text>
        <Text style={{ color: colors.ink2, lineHeight: 20 }}>
          {order.address.region}, {order.address.city}{'\n'}{order.address.street}{'\n'}{order.address.phone}
        </Text>
      </View>

      {['pending', 'confirmed'].includes(order.status) && (
        <Button title={t('cancelOrder')} variant="danger" onPress={cancel} />
      )}

      {/* Baholash modali */}
      <Modal visible={!!reviewing} transparent animationType="slide" onRequestClose={() => setReviewing(null)}>
        {reviewing && (
          <ReviewSheet item={reviewing} orderId={order.id}
            onClose={() => setReviewing(null)}
            onDone={() => { setReviewing(null); Alert.alert(t('thanks'), t('reviewSaved')); }} />
        )}
      </Modal>
    </ScrollView>
  );
}

function ReviewSheet({ item, orderId, onClose, onDone }) {
  const { t, terr } = useI18n();
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
      Alert.alert(t('error'), terr(e.message));
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
          placeholder={t('reviewPlaceholder')}
          placeholderTextColor={colors.muted}
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <Button title={t('send')} loading={busy} onPress={submit} style={{ marginTop: 12 }} />
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
