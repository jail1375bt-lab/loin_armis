// Vercel Serverless Function — Stripe PaymentIntent 作成
// 価格は必ず Supabase（サーバー側）で再計算する。クライアントの金額は信用しない。
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const SB_URL = process.env.SUPABASE_URL || 'https://xgyjjuravbbtlsylamfv.supabase.co';
const SB_KEY = process.env.SUPABASE_KEY || 'sb_publishable_DxVjz2q0w9zJo5yau0aYfA_-ahV3byZ';

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
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
      if (p.sold) continue;
      const ss = (p.size_stock && typeof p.size_stock === 'object' && !Array.isArray(p.size_stock)) ? p.size_stock : null;
      if (ss) {
        const q = parseInt(ss[it.size], 10) || 0;
        if (q <= 0) continue;
      } else if (p.stock != null && p.stock <= 0) {
        continue;
      }
      let sale = parseInt(p.sale, 10) || 0;
      if (sale < 0) sale = 0; if (sale > 100) sale = 100;
      const unit = sale > 0 ? Math.round((p.price || 0) * (100 - sale) / 100) : (p.price || 0);
      amount += unit;
    }
    if (amount <= 0) { res.status(400).json({ error: 'cart is empty' }); return; }
    const pi = await stripe.paymentIntents.create({
      amount, currency: 'jpy',
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({ clientSecret: pi.client_secret, amount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
