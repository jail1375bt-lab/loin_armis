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
    + "#la-cd .cd-mark{font-family:'LA_Octin',monospace;font-size:13px;letter-spacing:.42em;"
    + "text-transform:uppercase;margin:0 0 30px;padding-left:.42em}"
    + "#la-cd .cd-soon{font-family:'LA_OPTITimes',serif;font-size:clamp(34px,9vw,76px);"
    + "line-height:1;letter-spacing:.01em;margin:0 0 6px}"
    + "#la-cd .cd-date{font-family:'LA_Octin',monospace;font-size:clamp(11px,2.6vw,14px);"
    + "letter-spacing:.34em;color:#0a0a0a;margin:0 0 40px;padding-left:.34em}"
    + "#la-cd .cd-timer{display:flex;align-items:flex-start;justify-content:center;gap:clamp(10px,3.2vw,30px)}"
    + "#la-cd .cd-unit{display:flex;flex-direction:column;align-items:center;min-width:clamp(52px,16vw,98px)}"
    + "#la-cd .cd-num{font-family:'LA_OPTITimes',serif;font-size:clamp(40px,12vw,92px);"
    + "line-height:1;font-variant-numeric:tabular-nums;font-feature-settings:'tnum'}"
    + "#la-cd .cd-lbl{font-family:'LA_Octin',monospace;font-size:clamp(8px,2.2vw,11px);"
    + "letter-spacing:.24em;color:#777;margin-top:14px;text-transform:uppercase;padding-left:.24em}"
    + "#la-cd .cd-sep{font-family:'LA_OPTITimes',serif;font-size:clamp(34px,10vw,80px);"
    + "line-height:1;color:#c9c9c4;align-self:flex-start;margin-top:-2px}"
    + "#la-cd .cd-foot{position:absolute;bottom:26px;left:0;right:0;"
    + "font-family:'LA_Octin',monospace;font-size:10px;letter-spacing:.28em;color:#9a9a95;"
    + "text-transform:uppercase;padding-left:.28em}";

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function build() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var ov = document.createElement('div');
    ov.id = 'la-cd';
    ov.innerHTML =
      '<div class="cd-mark">LOIN ARMIS&trade;</div>' +
      '<div class="cd-soon">OPENING SOON</div>' +
      '<div class="cd-date">2026 . 06 . 30 &nbsp; 20:00 JST</div>' +
      '<div class="cd-timer">' +
        '<div class="cd-unit"><span class="cd-num" id="cd-d">00</span><span class="cd-lbl">Days</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-h">00</span><span class="cd-lbl">Hours</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-m">00</span><span class="cd-lbl">Minutes</span></div>' +
        '<div class="cd-sep">:</div>' +
        '<div class="cd-unit"><span class="cd-num" id="cd-s">00</span><span class="cd-lbl">Seconds</span></div>' +
      '</div>' +
      '<div class="cd-foot">SEE YOU SOON</div>';
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
