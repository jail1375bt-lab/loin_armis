const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const SB_URL = process.env.SUPABASE_URL || 'https://xgyjjuravbbtlsylamfv.supabase.co';
const SB_KEY = process.env.SUPABASE_KEY || 'sb_publishable_DxVjz2q0w9zJo5yau0aYfA_-ahV3byZ';

function allowedOrigin(req){
  var o = req.headers.origin || '';
  if(!o) return true;
  try{ var h = new URL(o).host; return /(\.vercel\.app$)|(loinarmis\.(online|com)$)|(^localhost)/.test(h); }catch(e){ return false; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  if (!allowedOrigin(req)) { res.status(403).json({ error: 'forbidden' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const items = (body && body.items) || [];
    if (!items.length) { res.status(400).json({ error: 'cart is empty' }); return; }
    const ids = [...new Set(items.map(it => it.id).filter(v => v !== undefined && v !== null))];
    if (!ids.length) { res.status(400).json({ error: 'cart is empty' }); return; }
    const url = SB_URL + '/rest/v1/products?id=in.(' + ids.join(',') + ')&select=id,price,sale,sold,stock,size_stock';
    const r = await fetch(url, { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
    if (!r.ok) { res.status(502).json({ error: 'product lookup failed' }); return; }
    const rows = await r.json();
    const map = {};
    rows.forEach(p => { map[String(p.id)] = p; });
    let amount = 0;
    for (const it of items) {
      const p = map[String(it.id)];
      if (!p) continue;
      if (p.sold) continue;                                  // 手動SOLD OUT
      const ss = (p.size_stock && typeof p.size_stock === 'object' && !Array.isArray(p.size_stock)) ? p.size_stock : null;
      if (ss) {                                              // サイズ別在庫がある場合はそのサイズで判定
        const q = parseInt(ss[it.size], 10) || 0;
        if (q <= 0) continue;
      } else if (p.stock != null && p.stock <= 0) {          // なければ総在庫で判定
        continue;
      }
      let sale = parseInt(p.sale, 10) || 0;
      if (sale < 0) sale = 0; if (sale > 100) sale = 100;
      const unit = sale > 0 ? Math.round((p.price || 0) * (100 - sale) / 100) : (p.price || 0);
      amount += unit;
    }
    if (amount <= 0) { res.status(400).json({ error: 'cart is empty' }); return; }
    const subtotal = amount;

    // クーポン割引
    const COUPONS = { LAS2026: 0.15, WELCOME15: 0.15 };
    const code = (body.coupon || '').toString().trim().toUpperCase();
    let discount = 0;
    if (COUPONS[code]) discount = Math.round(subtotal * COUPONS[code]);
    const itemsTotal = subtotal - discount;

    // 送料（割引後の商品額で送料無料を判定）。配送先の国で国内/海外を出し分け。
    const country = (body.country || 'JP').toString().trim().toUpperCase();
    const intl = country && country !== 'JP';
    let shipping = 0;
    try {
      const sres = await fetch(SB_URL + '/rest/v1/settings?id=eq.1&select=*', { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
      if (sres.ok) {
        const sj = await sres.json();
        const st = sj && sj[0];
        if (st) {
          const fee = intl ? (parseInt(st.ship_intl, 10) || 4000) : (parseInt(st.shipping_fee, 10) || 0);
          const fo  = intl ? (parseInt(st.free_over_intl, 10) || 40000) : (parseInt(st.free_over, 10) || 0);
          if (fee > 0 && !(fo > 0 && itemsTotal >= fo)) shipping = fee;
        }
      }
    } catch (e) {}
    amount = itemsTotal + shipping;

    const meta = {};
    if (body.userId) meta.user_id = String(body.userId);
    if (body.email)  meta.email   = String(body.email);
    if (code && discount > 0) { meta.coupon = code; meta.discount = String(discount); }
    meta.country = country;

    // 配送先の国が確定した後は、既存の PaymentIntent の金額（送料込み）を更新する
    if (body.paymentIntentId) {
      const upd = { amount, metadata: meta };
      if (body.email) upd.receipt_email = String(body.email);
      const pi = await stripe.paymentIntents.update(String(body.paymentIntentId), upd);
      res.status(200).json({ clientSecret: pi.client_secret, paymentIntentId: pi.id, amount, shipping, subtotal, discount });
      return;
    }

    // 新規作成（ログイン中の会員情報を Stripe に紐付け＋領収メール）
    const piParams = { amount, currency: 'jpy', automatic_payment_methods: { enabled: true }, metadata: meta };
    if (body.email) piParams.receipt_email = String(body.email);
    const pi = await stripe.paymentIntents.create(piParams);
    res.status(200).json({ clientSecret: pi.client_secret, paymentIntentId: pi.id, amount, shipping, subtotal, discount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
