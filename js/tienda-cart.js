/* HYPERCIX - Carrito de cotizacion de la tienda
 * El cliente agrega productos con "Cotizar" y envia una solicitud de cotizacion.
 * Se guarda en el servidor (POST /api/quotes) y aparece en el panel admin.
 */
(function () {
  'use strict';
  var CART_KEY = 'hypercix-cart';

  function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(v) { return 'S/ ' + Number(v || 0).toFixed(2); }
  function load() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; } }
  function save(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); }

  var cart = load();

  // ── Estilos ──
  var css = '\
  .hc-cart-fab{position:fixed;right:20px;bottom:90px;z-index:9000;width:56px;height:56px;border-radius:50%;background:#cc0000;color:#fff;border:0;cursor:pointer;box-shadow:0 12px 30px rgba(204,0,0,.45);display:grid;place-items:center;transition:transform .15s,box-shadow .15s}\
  .hc-cart-fab:hover{transform:scale(1.07);box-shadow:0 16px 40px rgba(204,0,0,.55)}\
  .hc-cart-count{position:absolute;top:-5px;right:-5px;background:#fff;color:#cc0000;min-width:22px;height:22px;border-radius:11px;font-size:11px;font-weight:800;display:grid;place-items:center;padding:0 4px;border:2px solid #cc0000}\
  .hc-cart-ov{position:fixed;inset:0;background:rgba(2,6,15,.6);z-index:9001;opacity:0;pointer-events:none;transition:opacity .25s}\
  .hc-cart-ov.open{opacity:1;pointer-events:auto}\
  .hc-cart{position:fixed;top:0;right:0;height:100%;width:min(420px,100%);background:#0d1426;color:#e5e7eb;z-index:9002;transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;box-shadow:-24px 0 60px rgba(0,0,0,.6)}\
  .hc-cart.open{transform:translateX(0)}\
  .hc-cart-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(135deg,rgba(204,0,0,.1),transparent)}\
  .hc-cart-head h3{margin:0;font-size:17px;font-weight:700;display:flex;align-items:center;gap:6px}\
  .hc-cart-close{background:none;border:0;color:#9ca3af;font-size:24px;cursor:pointer;line-height:1;transition:color .15s;padding:0 4px}\
  .hc-cart-close:hover{color:#fff}\
  .hc-cart-body{flex:1;overflow-y:auto;padding:14px 20px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.1) transparent}\
  .hc-cart-empty{text-align:center;color:#6b7280;padding:40px 0;display:flex;flex-direction:column;align-items:center;gap:8px}\
  .hc-ci{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}\
  .hc-ci-info{flex:1;min-width:0}\
  .hc-ci-info strong{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
  .hc-ci-info small{color:#6b7280;font-size:12px}\
  .hc-ci-qty{display:flex;align-items:center;gap:6px}\
  .hc-ci-qty button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:16px;line-height:1;transition:background .15s}\
  .hc-ci-qty button:hover{background:rgba(204,0,0,.2);border-color:rgba(204,0,0,.4)}\
  .hc-ci-qty span{min-width:22px;text-align:center;font-weight:700}\
  .hc-ci-rm{background:none;border:0;color:#6b7280;cursor:pointer;font-size:18px;transition:color .15s;padding:0 2px}\
  .hc-ci-rm:hover{color:#ef4444}\
  .hc-cart-foot{padding:16px 20px;border-top:1px solid rgba(255,255,255,.08)}\
  .hc-cart-total{display:flex;justify-content:space-between;align-items:baseline;font-size:14px;color:#9ca3af;margin-bottom:14px}\
  .hc-cart-total strong{color:#fff;font-size:22px;font-weight:800}\
  .hc-form label{display:block;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin:10px 0 4px}\
  .hc-form input,.hc-form textarea{width:100%;padding:9px 11px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#f9fafb;font-size:14px;outline:none;transition:border-color .2s}\
  .hc-form input:focus,.hc-form textarea:focus{border-color:rgba(204,0,0,.6);background:rgba(204,0,0,.04)}\
  .hc-cart-send{width:100%;margin-top:14px;padding:13px;border:0;border-radius:10px;background:linear-gradient(135deg,#cc0000,#e53935);color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s,transform .15s;letter-spacing:.02em}\
  .hc-cart-send:hover{opacity:.92;transform:translateY(-1px)}.hc-cart-send:disabled{opacity:.5;cursor:not-allowed;transform:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ── Estructura ──
  var fab = document.createElement('button');
  fab.className = 'hc-cart-fab';
  fab.innerHTML = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M1 1h3l2.5 11h11L19 5H5"/><circle cx="9" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg><span class="hc-cart-count" style="display:none">0</span>';
  document.body.appendChild(fab);

  var ov = document.createElement('div'); ov.className = 'hc-cart-ov'; document.body.appendChild(ov);
  var panel = document.createElement('aside'); panel.className = 'hc-cart';
  panel.innerHTML =
    '<div class="hc-cart-head"><h3><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;vertical-align:middle;margin-right:5px"><path d="M1 1h2.5l2 9h9L16 4H4"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="13" cy="15.5" r="1.5"/></svg> Mi cotización</h3><button class="hc-cart-close">&times;</button></div>' +
    '<div class="hc-cart-body" id="hc-cart-body"></div>' +
    '<div class="hc-cart-foot" id="hc-cart-foot"></div>';
  document.body.appendChild(panel);

  var countEl = fab.querySelector('.hc-cart-count');
  var bodyEl = panel.querySelector('#hc-cart-body');
  var footEl = panel.querySelector('#hc-cart-foot');

  function total() { return cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }

  function open() { cart = load(); ov.classList.add('open'); panel.classList.add('open'); render(); updateBadge(); }
  function close() { ov.classList.remove('open'); panel.classList.remove('open'); }

  // Refrescar carrito si otra parte del codigo (nuevo index.js) o pestana lo modifica
  window.addEventListener('storage', function (e) {
    if (e.key === CART_KEY) { cart = load(); updateBadge(); if (panel.classList.contains('open')) render(); }
  });
  // Polling ligero para cambios dentro de la misma pagina (storage event no dispara para misma ventana)
  setInterval(function () {
    var fresh = load();
    if (JSON.stringify(fresh) !== JSON.stringify(cart)) {
      cart = fresh; updateBadge();
      if (panel.classList.contains('open')) render();
    }
  }, 800);

  function updateBadge() {
    var n = count();
    countEl.textContent = n;
    countEl.style.display = n ? 'grid' : 'none';
  }

  function render() {
    if (!cart.length) {
      bodyEl.innerHTML = '<div class="hc-cart-empty"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:52px;height:52px;opacity:0.35;display:block;margin:0 auto 8px"><path d="M4 4h6l6 24h22L42 12H12"/><circle cx="22" cy="42" r="4"/><circle cx="36" cy="42" r="4"/></svg><p>Tu cotización está vacía.</p><p style="font-size:13px">Agrega productos con el botón <strong>Cotizar</strong>.</p></div>';
      footEl.innerHTML = '';
      updateBadge();
      return;
    }
    bodyEl.innerHTML = cart.map(function (i, idx) {
      return '<div class="hc-ci">' +
        '<div class="hc-ci-info"><strong>' + esc(i.description) + '</strong><small>' + esc(i.code) + ' · ' + money(i.price) + '</small></div>' +
        '<div class="hc-ci-qty"><button data-dec="' + idx + '">−</button><span>' + i.qty + '</span><button data-inc="' + idx + '">+</button></div>' +
        '<button class="hc-ci-rm" data-rm="' + idx + '" title="Quitar">&times;</button>' +
        '</div>';
    }).join('');
    footEl.innerHTML =
      '<div class="hc-cart-total"><span>Total estimado</span><strong>' + money(total()) + '</strong></div>' +
      '<form class="hc-form" id="hc-quote-form">' +
      '<label>Nombre / Empresa *</label><input id="hc-q-name" required maxlength="120" />' +
      '<label>Email</label><input id="hc-q-email" type="email" maxlength="120" />' +
      '<label>Teléfono *</label><input id="hc-q-phone" maxlength="40" />' +
      '<label>Mensaje (opcional)</label><textarea id="hc-q-msg" rows="2" maxlength="300"></textarea>' +
      '<button class="hc-cart-send" type="submit" id="hc-q-send">Enviar solicitud de cotización</button>' +
      '</form>';
    updateBadge();
  }

  function addProduct(id) {
    var products = window.__storeProducts || [];
    var p = products.find(function (x) { return String(x.id || x.code) === String(id) || x.code === id; });
    if (!p) return;
    var existing = cart.find(function (c) { return c.code === p.code; });
    if (existing) existing.qty += 1;
    else cart.push({ code: p.code, description: p.description, price: Number(p.price) || 0, qty: 1 });
    save(cart);
    updateBadge();
    if (window.HCToast) window.HCToast('"' + p.description + '" agregado a tu cotización', 'ok');
  }

  // ── Eventos ──
  fab.addEventListener('click', open);
  ov.addEventListener('click', close);
  panel.querySelector('.hc-cart-close').addEventListener('click', close);

  // Botones "Cotizar" del catalogo (delegacion)
  document.addEventListener('click', function (e) {
    var buy = e.target.closest('.btn-buy');
    if (buy && !buy.disabled) {
      e.preventDefault();
      addProduct(buy.dataset.id || buy.dataset.code);
    }
  });

  // Acciones dentro del carrito
  bodyEl.addEventListener('click', function (e) {
    var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if (inc) { cart[+inc.dataset.inc].qty++; }
    else if (dec) { var i = +dec.dataset.dec; cart[i].qty = Math.max(1, cart[i].qty - 1); }
    else if (rm) { cart.splice(+rm.dataset.rm, 1); }
    else return;
    save(cart); render();
  });

  // Enviar cotizacion
  footEl.addEventListener('submit', function (e) {
    if (e.target.id !== 'hc-quote-form') return;
    e.preventDefault();
    var name = document.getElementById('hc-q-name').value.trim();
    var email = document.getElementById('hc-q-email').value.trim();
    var phone = document.getElementById('hc-q-phone').value.trim();
    var msg = document.getElementById('hc-q-msg').value.trim();
    if (!name || !phone) { if (window.HCToast) window.HCToast('Completa nombre y teléfono.', 'warn'); return; }

    var btn = document.getElementById('hc-q-send');
    btn.disabled = true; btn.textContent = 'Enviando...';
    fetch((window.HC_API || '') + '/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ client: name, email: email, phone: phone, message: msg, items: cart })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'No se pudo enviar');
        cart = []; save(cart);
        close(); updateBadge();
        if (window.HCToast) window.HCToast('¡Cotización enviada! Te contactaremos pronto.', 'ok');
      })
      .catch(function (err) {
        if (window.HCToast) window.HCToast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Enviar solicitud de cotización';
      });
  });

  updateBadge();
})();
