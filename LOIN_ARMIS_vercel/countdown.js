/* LOIN ARMIS — オープニング カウントダウン オーバーレイ
   開始: 2026-06-28 20:00 JST  →  オープン: 2026-06-30 20:00 JST
   この期間だけ全画面オーバーレイでサイトをロックする。
   オープン時刻を過ぎたら自動でサイトが開く。 */
(function () {
  var START = new Date('2026-06-28T20:00:00+09:00').getTime();
  var OPEN  = new Date('2026-06-30T20:00:00+09:00').getTime();
  var PREVIEW_PASS = '8610'; // 管理者プレビュー用パスワード（ここを書き換えれば変更可）

  function now() { return Date.now(); }

  // ロック期間外は何もしない（通常サイト）
  if (now() < START || now() >= OPEN) return;

  // 管理者が一度パスワードで解錠したら、以降は通常サイトを表示（同じ端末・同じブラウザ）
  try { if (localStorage.getItem('la_preview') === '1') return; } catch (e) {}

  var css = ''
    + "@font-face{font-family:'LA_OPTITimes';src:url('OPTITimes-Roman.otf') format('opentype');font-display:swap}"
    + "@font-face{font-family:'LA_Octin';src:url('OctinCollege.otf') format('opentype');font-display:swap}"
    + "#la-cd{position:fixed;inset:0;z-index:2147483647;background:#f4f4f1;color:#0a0a0a;"
    + "display:flex;flex-direction:column;align-items:center;justify-content:center;"
    + "padding:28px;text-align:center;overflow:hidden}"
    + "#la-cd .cd-logo{width:clamp(190px,44vw,380px);height:auto;display:block;margin:0 0 34px}"
    + "#la-cd .cd-soon{font-family:'LA_OPTITimes',serif;font-size:clamp(25px,7.4vw,72px);"
    + "line-height:1;letter-spacing:.01em;white-space:nowrap;margin:0 0 12px}"
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
    + "letter-spacing:.26em;color:#0a0a0a;margin-top:42px;text-transform:uppercase;padding-left:.26em}"
    + "#la-cd .cd-gate{display:none;gap:8px;margin-top:30px;align-items:center}"
    + "#la-cd .cd-dot{position:absolute;bottom:15px;right:15px;width:15px;height:15px;padding:0;"
    + "border:1px solid rgba(0,0,0,.12);border-radius:50%;background:transparent;cursor:pointer;"
    + "opacity:.55;transition:opacity .2s,border-color .2s}"
    + "#la-cd .cd-dot:hover{opacity:1;border-color:rgba(0,0,0,.4)}"
    + "#la-cd .cd-pass{font-family:'LA_Octin',monospace;font-size:11px;letter-spacing:.18em;"
    + "text-align:center;width:160px;padding:9px 12px;border:1px solid #c9c9c4;border-radius:0;"
    + "background:#fff;color:#0a0a0a;outline:none}"
    + "#la-cd .cd-pass::placeholder{color:#b3b3ad;letter-spacing:.18em}"
    + "#la-cd .cd-go{font-family:'LA_Octin',monospace;font-size:11px;letter-spacing:.18em;"
    + "padding:9px 16px;border:1px solid #0a0a0a;background:#0a0a0a;color:#fff;cursor:pointer;text-transform:uppercase}"
    + "#la-cd .cd-err{font-family:'LA_Octin',monospace;font-size:10px;letter-spacing:.16em;"
    + "color:#b00020;margin-top:12px;min-height:12px;text-transform:uppercase}"
    + "#la-cd.shake{animation:lashake .35s}"
    + "@keyframes lashake{0%,100%{transform:none}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}";

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
      '<div class="cd-open">SS26 online store open</div>' +
      '<form class="cd-gate" id="cd-gate">' +
        '<input class="cd-pass" id="cd-pass" type="password" inputmode="numeric" placeholder="ADMIN" autocomplete="off">' +
        '<button class="cd-go" type="submit">ENTER</button>' +
      '</form>' +
      '<div class="cd-err" id="cd-err"></div>' +
      '<button class="cd-dot" id="cd-dot" type="button" aria-label=" "></button>';
    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // 右下の目立たないボタンでパスワード欄を表示
    var dot = document.getElementById('cd-dot');
    var gate = document.getElementById('cd-gate');
    if (dot) dot.addEventListener('click', function () {
      if (gate) gate.style.display = 'flex';
      dot.style.display = 'none';
      var inp = document.getElementById('cd-pass'); if (inp) inp.focus();
    });

    // 管理者プレビュー解錠
    if (gate) gate.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var inp = document.getElementById('cd-pass');
      var val = (inp && inp.value ? inp.value : '').trim();
      if (val === PREVIEW_PASS) {
        try { localStorage.setItem('la_preview', '1'); } catch (e2) {}
        ov.remove();
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      } else {
        var err = document.getElementById('cd-err');
        if (err) err.textContent = 'WRONG PASSWORD';
        ov.classList.add('shake');
        setTimeout(function () { ov.classList.remove('shake'); }, 400);
        if (inp) { inp.value = ''; inp.focus(); }
      }
    });

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
