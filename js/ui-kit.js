/* HYPERCIX UI Kit - toasts y modales reutilizables
 * Expone: window.HCToast(msg, type), window.HCConfirm(msg, opts) -> Promise<bool>
 * Reemplaza window.alert por un toast (no bloqueante).
 */
(function () {
  'use strict';
  if (window.HCToast) return; // evitar doble carga

  // ── Estilos ──
  var css = '\
  .hc-toast-wrap{position:fixed;top:18px;right:18px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:340px}\
  .hc-toast{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:10px;color:#fff;font:500 14px/1.4 system-ui,Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);transform:translateX(120%);opacity:0;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .28s}\
  .hc-toast.show{transform:translateX(0);opacity:1}\
  .hc-toast .hc-ic{font-size:16px;line-height:1.2}\
  .hc-toast.ok{background:#10894f}.hc-toast.error{background:#c0392b}.hc-toast.warn{background:#b8860b}.hc-toast.info{background:#1f2937;border:1px solid rgba(255,255,255,.12)}\
  .hc-modal-ov{position:fixed;inset:0;background:rgba(2,6,15,.6);backdrop-filter:blur(2px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .2s}\
  .hc-modal-ov.show{opacity:1}\
  .hc-modal{width:min(420px,100%);background:#111827;color:#e5e7eb;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.5);transform:scale(.96);transition:transform .2s}\
  .hc-modal-ov.show .hc-modal{transform:scale(1)}\
  .hc-modal h3{margin:0 0 8px;font-size:17px}\
  .hc-modal p{margin:0 0 16px;font-size:14px;color:#cbd5e1;line-height:1.5}\
  .hc-modal input{width:100%;padding:10px 12px;border-radius:9px;border:1px solid #374151;background:#0b0f17;color:#f9fafb;font-size:14px;margin-bottom:16px;outline:none}\
  .hc-modal input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.25)}\
  .hc-modal-actions{display:flex;gap:10px;justify-content:flex-end}\
  .hc-btn{padding:9px 16px;border:0;border-radius:9px;font:600 14px system-ui,Arial;cursor:pointer}\
  .hc-btn-cancel{background:#374151;color:#e5e7eb}.hc-btn-cancel:hover{background:#4b5563}\
  .hc-btn-ok{background:#2563eb;color:#fff}.hc-btn-ok:hover{background:#1d4ed8}\
  .hc-btn-ok.safe{background:#10894f}.hc-btn-ok.safe:hover{background:#0c6e40}';
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function wrap() {
    var w = document.querySelector('.hc-toast-wrap');
    if (!w) {
      w = document.createElement('div');
      w.className = 'hc-toast-wrap';
      document.body.appendChild(w);
    }
    return w;
  }

  var ICONS = { ok: '✓', error: '✕', warn: '⚠', info: 'ℹ' };

  window.HCToast = function (message, type) {
    type = type || 'info';
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { window.HCToast(message, type); }); return; }
    var el = document.createElement('div');
    el.className = 'hc-toast ' + type;
    el.innerHTML = '<span class="hc-ic">' + (ICONS[type] || ICONS.info) + '</span><span>' + String(message).replace(/</g, '&lt;') + '</span>';
    wrap().appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 320);
    }, type === 'error' ? 5000 : 3200);
  };

  // Modal generico (confirm / prompt)
  function modal(opts) {
    return new Promise(function (resolve) {
      var ov = document.createElement('div');
      ov.className = 'hc-modal-ov';
      var isPrompt = opts.type === 'prompt';
      ov.innerHTML = '<div class="hc-modal" role="dialog" aria-modal="true">' +
        '<h3>' + (opts.title || 'Confirmar') + '</h3>' +
        (opts.message ? '<p>' + opts.message + '</p>' : '') +
        (isPrompt ? '<input id="hc-modal-input" type="text" value="' + (opts.value || '').replace(/"/g, '&quot;') + '" placeholder="' + (opts.placeholder || '') + '" />' : '') +
        '<div class="hc-modal-actions">' +
        '<button class="hc-btn hc-btn-cancel" data-x="cancel">' + (opts.cancelText || 'Cancelar') + '</button>' +
        '<button class="hc-btn hc-btn-ok ' + (opts.danger ? '' : 'safe') + '" data-x="ok">' + (opts.confirmText || 'Aceptar') + '</button>' +
        '</div></div>';
      document.body.appendChild(ov);
      requestAnimationFrame(function () { ov.classList.add('show'); });
      var input = ov.querySelector('#hc-modal-input');
      if (input) { input.focus(); input.select(); }

      function close(val) {
        ov.classList.remove('show');
        setTimeout(function () { ov.remove(); }, 200);
        resolve(val);
      }
      ov.addEventListener('click', function (e) {
        var b = e.target.closest('[data-x]');
        if (e.target === ov) return close(isPrompt ? null : false);
        if (!b) return;
        if (b.dataset.x === 'ok') close(isPrompt ? (input ? input.value : '') : true);
        else close(isPrompt ? null : false);
      });
      ov.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close(isPrompt ? null : false);
        if (e.key === 'Enter' && isPrompt) close(input ? input.value : '');
      });
    });
  }

  window.HCConfirm = function (message, opts) {
    opts = opts || {};
    return modal({ type: 'confirm', title: opts.title || 'Confirmar', message: message, confirmText: opts.confirmText, cancelText: opts.cancelText, danger: opts.danger !== false });
  };
  window.HCPrompt = function (message, value, opts) {
    opts = opts || {};
    return modal({ type: 'prompt', title: opts.title || 'Ingresar dato', message: message, value: value || '', placeholder: opts.placeholder, confirmText: opts.confirmText || 'Guardar', danger: false });
  };

  // Reemplazar alert nativo por toast (no bloqueante, transparente para los modulos)
  window.alert = function (msg) {
    var t = 'info';
    var s = String(msg).toLowerCase();
    if (/error|no se|invalid|fall|super/.test(s)) t = 'error';
    else if (/import|guard|agreg|elimin|actualiz|éxito|exito|ok/.test(s)) t = 'ok';
    window.HCToast(msg, t);
  };
})();
