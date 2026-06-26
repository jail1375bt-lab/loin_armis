// Vercel Serverless — 注文をサーバー側で検証して記録（偽注文防止）
// Stripe で支払い完了を確認してから、service鍵で orders に保存する。
// 必要な環境変数（Vercel）:
//   STRIPE_SECRET_KEY      … Stripe 秘密鍵
//   SUPABASE_SERVICE_KEY   … Supabase の service_role キー（秘密。絶対に公開しない）
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const SB_URL = process.env.SUPABASE_URL || 'https://xgyjjuravbbtlsylamfv.supabase.co';
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';

function allowedOrigin(req){
  var o = req.headers.origin || '';
  if(!o) return true;
  try{ var h = new URL(o).host; return /(\.vercel\.app$)|(loinarmis\.(online|com)$)|(^localhost)/.test(h); }catch(e){ return false; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  if (!allowedOrigin(req)) { res.status(403).json({ error: 'forbidden' }); return; }
  if (!SB_SERVICE) { res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e){ body = {}; } }
    const piId  = body && body.paymentIntentId;
    const items = (body && body.items) || [];
    const name  = (body && body.name) || '';
    if (!piId) { res.status(400).json({ error: 'no payment intent' }); return; }

    // Stripe で支払いを検証
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (!pi || (pi.status !== 'succeeded' && pi.status !== 'processing')) {
      res.status(400).json({ error: 'payment not completed' }); return;
    }
    const user_id = (pi.metadata && pi.metadata.user_id) || null;
    const email   = pi.receipt_email || (pi.metadata && pi.metadata.email) || null;
    if (!user_id) { res.status(200).json({ ok:true, note:'guest - skipped' }); return; }

    const H = { apikey: SB_SERVICE, Authorization: 'Bearer ' + SB_SERVICE };

    // 二重登録を防止（同じ payment_intent が既にあれば作らない）
    const chk = await fetch(SB_URL + '/rest/v1/orders?payment_intent=eq.' + encodeURIComponent(piId) + '&select=id', { headers: H });
    if (chk.ok) { const ex = await chk.json(); if (ex && ex.length) { res.status(200).json({ ok:true, note:'already recorded' }); return; } }

    const rec = { user_id, email, name, items, total: Math.round(pi.amount || 0), payment_intent: piId, status: 'paid' };
    const ins = await fetch(SB_URL + '/rest/v1/orders', {
      method: 'POST',
      headers: Object.assign({}, H, { 'Content-Type':'application/json', Prefer:'return=minimal' }),
      body: JSON.stringify(rec)
    });
    if (!ins.ok) { const t = await ins.text(); res.status(500).json({ error:'insert failed', detail:t }); return; }
    res.status(200).json({ ok:true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
