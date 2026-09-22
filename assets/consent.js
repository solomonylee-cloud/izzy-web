/* izzywolf.com — opt-in Meta pixel (founder ruling 2026-09-22).
   The pixel NEVER loads until the visitor taps "OK". "No thanks", a browser Global Privacy Control
   signal, or no answer = no pixel. The choice is remembered in localStorage and can be changed any
   time from the Privacy Policy ("Change my ad-tracking choice").
   Pages that must never carry the pixel simply do not include this script (children's privacy,
   account, captcha pages). Cloudflare Web Analytics is separate, cookieless, and needs no consent. */
(function () {
  var PIXEL_ID = '1639479554353659';            // Meta dataset "izzywolf.com" (portfolio "Izzy · Snow and Sun")
  var KEY = 'izzy_ad_consent';                   // 'granted' | 'denied'
  var loaded = false;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: ask again next time */ } }
  function gpc() { try { return navigator.globalPrivacyControl === true; } catch (e) { return false; } }

  function loadPixel() {
    if (loaded) return; loaded = true;
    /* Meta's standard base code */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function removeBanner() { var b = document.getElementById('izzy-consent'); if (b) b.remove(); }

  function showBanner() {
    if (document.getElementById('izzy-consent')) return;
    var css = document.createElement('style');
    css.textContent =
      '#izzy-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;' +
      'background:#1A2E4D;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 8px 28px rgba(0,0,0,.25);' +
      'font:15px/1.45 Quicksand,system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}' +
      '#izzy-consent p{margin:0;flex:1 1 260px}#izzy-consent a{color:#FFB300}' +
      '#izzy-consent .b{display:flex;gap:8px}#izzy-consent button{font:inherit;font-weight:700;border-radius:999px;' +
      'padding:8px 16px;cursor:pointer;border:1px solid #fff}#izzy-consent .ok{background:#FFB300;color:#1A2E4D;border-color:#FFB300}' +
      '#izzy-consent .no{background:transparent;color:#fff}';
    document.head.appendChild(css);
    var b = document.createElement('div');
    b.id = 'izzy-consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Ad measurement choice');
    b.innerHTML = '<p>We use a Meta pixel to measure our ads. It only turns on if you say OK. ' +
      '<a href="privacy.html#ads">Details</a></p><div class="b"><button class="no" type="button">No thanks</button>' +
      '<button class="ok" type="button">OK</button></div>';
    b.querySelector('.ok').onclick = function () { write('granted'); removeBanner(); loadPixel(); };
    b.querySelector('.no').onclick = function () { write('denied'); removeBanner(); };
    document.body.appendChild(b);
  }

  window.izzyAds = {
    enabled: function () { return loaded && typeof window.fbq === 'function'; },
    lead: function () { if (this.enabled()) window.fbq('track', 'Lead'); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} ; location.reload(); }
  };

  function start() {
    if (gpc()) return;                     // honour Global Privacy Control: no pixel, no banner
    var c = read();
    if (c === 'granted') loadPixel();
    else if (c !== 'denied') showBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
