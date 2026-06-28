/* LOIN ARMIS — オープニング カウントダウン オーバーレイ
   開始: 2026-06-28 20:00 JST  →  オープン: 2026-06-30 20:00 JST
   この期間だけ全画面オーバーレイでサイトをロックする。
   オープン時刻を過ぎたら自動でサイトが開く。 */
(function () {
  var START = new Date('2026-06-28T20:00:00+09:00').getTime();
  var OPEN  = new Date('2026-06-30T20:00:00+09:00').getTime();

  function now() { return Date.now(); }

  // ロック期間外は何もしない（通常サイト）
  if (now() < START || now() >= OPEN) return;

  var css = ''
    + "@font-face{font-family:'LA_OPTITimes';src:url('OPTITimes-Roman.otf') format('opentype');font-display:swap}"
    + "@font-face{font-family:'LA_Octin';src:url('OctinCollege.otf') format('opentype');font-display:swap}"
    + "#la-cd{position:fixed;inset:0;z-index:2147483647;background:#f4f4f1;color:#0a0a0a;"
    + "display:flex;flex-direction:column;align-items:center;justify-content:center;"
    + "padding:28px;text-align:center;overflow:hidden}"
    + "#la-cd .cd-logo{width:clamp(190px,44vw,380px);height:auto;display:block;margin:0 0 34px}"
    + "#la-cd .cd-soon{font-family:'LA_OPTITimes',serif;font-size:clamp(32px,8.4vw,72px);"
    + "line-height:1;letter-spacing:.01em;margin:0 0 12px}"
    + "#la-cd .cd-tag{font-family:'LA_Octin',monospace;font-size:clamp(10px,2.4vw,13px);"
    + "letter-spacing:.3em;color:#8a8a85;margin:0 0 44px;padding-left:.3em}"
    + "#la-cd .cd-timer{display:flex;align-items:flex-start;justify-content:center;gap:clamp(10px,3.2vw,30px)}"
    + "#la-cd .cd-unit{display:flex;flex-direction:column;align-items:center;min-width:clamp(52px,16vw,98px)}"
    + "#la-cd .cd-num{font-family:'LA_OPTITimes',serif;font-size:clamp(40px,12vw,92px);"
    + "line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}"
    + "#la-cd .cd-lbl{font-family:'LA_Octin',monospace;font-size:clamp(8px,2.2vw,11px);"
    + "letter-spacing:.24em;color:#777;margin-top:14px;text-transform:uppercase;padding-left:.24em}"
    + "#la-cd .cd-sep{font-family:'LA_OPTITimes',serif;font-size:clamp(34px,10vw,80px);"
    + "line-height:1;color:#c9c9c4;align-self:flex-start;margin-top:-2px}"
    + "#la-cd .cd-open{font-family:'LA_Octin',monospace;font-size:clamp(11px,2.8vw,15px);"
    + "letter-spacing:.26em;color:#0a0a0a;margin-top:42px;text-transform:uppercase;padding-left:.26em}";

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function build() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var ov = document.createElement('div');
    ov.id = 'la-cd';
    ov.innerHTML =
      '<img class="cd-logo" src="LOIN_ARMIS_LOGO.svg" alt="LOIN ARMIS">' +
      '<div class="cd-soon">A NEW BEGINNING</div>' +
      '<div class="cd-tag">now creates the future</div>' +
      '<div class="cd-timer">' +
        '<div class="cd-unit"><span class="cd-num" id="cd-d">00</span><span class="cd-lbl">Days</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-h">00</span><span class="cd-lbl">Hours</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-m">00</span><span class="cd-lbl">Minutes</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-s">00</span><span class="cd-lbl">Seconds</span></div>' +
      '</div>' +
      '<div class="cd-open">SS26 online store open</div>';
    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = pad(v); }

    function tick() {
      var diff = OPEN - now();
      if (diff <= 0) { location.reload(); return; } // オープン → サイトを表示
      var s = Math.floor(diff / 1000);
      set('cd-d', Math.floor(s / 86400));
      set('cd-h', Math.floor((s % 86400) / 3600));
      set('cd-m', Math.floor((s % 3600) / 60));
      set('cd-s', s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
