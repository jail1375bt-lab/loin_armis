// Vercel Serverless Function — Stripe PaymentIntent 作成
// 秘密鍵は Vercel の環境変数 STRIPE_SECRET_KEY に設定（コードには書かない）
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const PRODUCTS = require('../products.js'); // 商品データは products.js を唯一の正とする

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({error:'method not allowed'}); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e){ body = {}; } }
    const items = (body && body.items) || [];
    let amount = 0;
    for (const it of items) {
      const p = PRODUCTS[it.id];
      if (!p || p.sold) continue;     // SOLD OUT は購入不可
      amount += (p.price || 0);
    }
    if (amount <= 0) { res.status(400).json({error:'cart is empty'}); return; }
    const pi = await stripe.paymentIntents.create({
      amount, currency: 'jpy',
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({ clientSecret: pi.client_secret, amount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
