/* =========================================================
   LOIN ARMIS — Store loader (store.js)
   Supabase の products テーブルを読み込み、サイト各ページが使う
   形に正規化して window.Store に公開する。
   読み込み順: supabase-js → supabase-config.js → store.js → ページ本体
   ========================================================= */
(function(){
  var sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
  var cache = null;

  function fmt(n){ return '¥' + (Number(n)||0).toLocaleString(); }
  function arr(v){ return (Array.isArray(v) && v.length) ? v : null; }

  // カテゴリ判定：明示設定が "1OF1 + SAMPLE"/"Collaboration" ならそれを優先。
  // それ以外は商品名から自動判定（名前に 1OF1 → サンプル枠、× → コラボ枠）。
  function resolveCat(r){
    var c = (r.cat || '').trim();
    var lc = c.toLowerCase();
    if(lc === '1of1 + sample' || lc === 'collaboration') return c;
    var n = (r.name || '');
    if(/1\s*of\s*1|1of1/i.test(n)) return '1OF1 + SAMPLE';
    if(/[×✕]/.test(n)) return 'Collaboration';
    return c;
  }

  function norm(r){
    var sale = parseInt(r.sale,10) || 0;
    if(sale < 0) sale = 0; if(sale > 100) sale = 100;
    var now  = sale > 0 ? Math.round((r.price||0) * (100 - sale) / 100) : (r.price||0);

    // サイズ別在庫 {S:3,M:0,...}。設定があれば在庫の正とする。
    var ss = (r.size_stock && typeof r.size_stock === 'object' && !Array.isArray(r.size_stock)) ? r.size_stock : null;
    var ssKeys = ss ? Object.keys(ss) : null;
    var anyStock = ss ? ssKeys.some(function(k){ return (parseInt(ss[k],10)||0) > 0; }) : null;

    // 売切判定：手動sold or サイズ別が全て0 or（サイズ別なしなら）総在庫0
    var sold = !!r.sold || (ss ? !anyStock : (r.stock != null && r.stock <= 0));

    return {
      id:        r.id,                 // Supabase の主キー（安定ID）
      n:         r.name || '',
      cat:       resolveCat(r),
      season:    r.season || '',
      price:     r.price || 0,         // 元値（数値）
      sale:      sale,                 // 割引%（0=なし）
      now:       now,                  // 実際に払う額（数値）
      p:         fmt(now),             // 実売価格（表示用 ¥）
      was:       sale > 0 ? fmt(r.price) : null,
      desc:      r.descr || '',
      imgs:      arr(r.imgs),
      sizes:     arr(r.sizes) || (ssKeys && ssKeys.length ? ssKeys.slice() : null),
      chart:     (r.chart && (r.chart.head || r.chart.cols)) ? r.chart : null,
      features:  arr(r.features),
      sizeStock: ss,                   // {size:qty} or null
      sold:      sold,
      stock:     r.stock
    };
  }

  function load(){
    if(cache) return Promise.resolve(cache);
    return sb.from('products').select('*').order('sort',{ascending:true}).then(function(res){
      if(res.error){ console.error('[Store] load error', res.error); throw res.error; }
      cache = (res.data || []).map(norm);
      return cache;
    });
  }

  function byId(list, id){ return list.find(function(x){ return String(x.id) === String(id); }); }

  // 送料設定を取得（settingsテーブル id=1）。海外用の列が無くても壊れないよう全列取得。
  function getSettings(){
    return sb.from('settings').select('*').eq('id',1).single()
      .then(function(r){ return (r && r.data) || {shipping_fee:0, free_over:0}; })
      .catch(function(){ return {shipping_fee:0, free_over:0}; });
  }
  // 小計と配送先国に対する送料を計算（country が 'JP' 以外なら海外料金）
  function shipFor(subtotal, st, country){
    st = st || {};
    var intl = !!(country && String(country).toUpperCase() !== 'JP');
    var fee = intl ? (parseInt(st.ship_intl,10) || 4000) : (parseInt(st.shipping_fee,10) || 0);
    var fo  = intl ? (parseInt(st.free_over_intl,10) || 40000) : (parseInt(st.free_over,10) || 0);
    if(fee <= 0) return 0;
    if(fo > 0 && subtotal >= fo) return 0;
    return fee;
  }

  window.Store = { load: load, byId: byId, fmt: fmt, settings: getSettings, shipFor: shipFor };
})();
