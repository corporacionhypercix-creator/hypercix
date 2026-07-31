/* HYPERCIX - Capa de sincronizacion cliente <-> servidor
 * Hidrata localStorage desde el servidor (lectura) y replica los cambios (escritura).
 * Se carga ANTES que los modulos para que lean datos frescos.
 * Si el servidor no responde, cae a localStorage (modo offline).
 */
(function () {
  'use strict';

  var PREFIX = 'hypercix-admin-';
  var TOKEN_KEY = 'hypercix-auth-token';
  var USER_KEY = 'hypercix-auth-user';

  // Claves sincronizables con el servidor
  var SYNC_KEYS = {
    'hypercix-admin-products': 1,
    'hypercix-admin-categories': 1,
    'hypercix-admin-categories-data': 1,
    'hypercix-admin-brands': 1,
    'hypercix-admin-brands-data': 1,
    'hypercix-admin-clients': 1,
    'hypercix-admin-quotes': 1,
    'hypercix-admin-exchange-rate': 1,
    'hypercix-admin-rate-history': 1,
    'hypercix-admin-banners': 1,
    'hypercix-admin-settings': 1
  };

  var path = location.pathname;
  var isAdmin = path.indexOf('/admin/') !== -1;
  var isLogin = /login\.html$/i.test(path);

  // ── Base de la API ──
  // Hosting hibrido: frontend en Cloudflare Pages, backend en Render.
  //   - file:// (HTML abierto como archivo) -> server local :3000
  //   - localhost en cualquier puerto -> mismo origen (asume que server.js
  //     sirve este puerto). Si usas Live Server u otro y necesitas apuntar
  //     a un backend diferente, define window.HC_API_BASE antes de este script.
  //   - dominio del backend (onrender.com) -> mismo origen ('')
  //   - cualquier otro dominio (Cloudflare Pages, dominio propio) -> backend propio
  // Para forzar una URL: window.HC_API_BASE = 'https://mi-backend...' (override total).
  // Para cambiar solo el backend de produccion: window.HC_BACKEND_URL = '...'.
  var BACKEND_URL = (window.HC_BACKEND_URL || 'https://www.corporacionhypercix.com').replace(/\/+$/, '');
  var API_PORT = '3000';
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  var isBackendHost = /(^|\.)onrender\.com$/i.test(host);
  var API = '';
  if (window.HC_API_BASE) {
    API = String(window.HC_API_BASE).replace(/\/+$/, '');
  } else if (location.protocol === 'file:') {
    API = 'http://localhost:' + API_PORT;
  } else if (isLocal) {
    API = '';
  } else if (!isBackendHost) {
    API = BACKEND_URL;
  }
  window.HC_API = API;

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }

  // Header que evita la pagina intersticial de ngrok cuando exponemos la web
  // por su tunel (la advertencia rompe los fetch JSON). En cualquier otro
  // hosting no hace nada — es un header personalizado inofensivo.
  window.HCFetchHeaders = { 'ngrok-skip-browser-warning': 'true' };

  // ── Helpers de auth expuestos globalmente ──
  window.HCAuth = {
    token: getToken,
    user: function () {
      try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
      catch (e) { return null; }
    },
    setSession: function (token, user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || null));
    },
    logout: function () {
      var t = getToken();
      try {
        fetch(API + '/api/logout', { method: 'POST', headers: { 'X-Auth-Token': t, 'ngrok-skip-browser-warning': 'true' } }).catch(function () {});
      } catch (e) {}
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  // ── 1) Guardia de autenticacion para el panel admin ──
  if (isAdmin && !isLogin && !getToken()) {
    location.replace('login.html');
    return;
  }

  // ── 2) Hidratar localStorage desde el servidor (asincrono) ──
  // No bloquea la UI; si el servidor esta frio (cold start Render ~30s) la
  // pagina se renderiza con cache local y se actualiza cuando llegue la
  // respuesta o en el siguiente ciclo de sync periodico (15s).
  if (!isLogin) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', API + '/api/store', true); // asincrono
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
      xhr.timeout = 10000; // 10s max
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var all = JSON.parse(xhr.responseText);
            Object.keys(SYNC_KEYS).forEach(function (k) {
              if (all[k] !== null && all[k] !== undefined) {
                localStorage.setItem(k, JSON.stringify(all[k]));
              }
            });
          } catch (e) {}
          try { window.dispatchEvent(new CustomEvent('store-synced')); } catch (e) {}
        }
      };
      xhr.ontimeout = function () {
        if (window.console) console.warn('[store-sync] timeout, usando cache local');
      };
      xhr.onerror = function () {
        if (window.console) console.warn('[store-sync] error de red, usando cache local');
      };
      xhr.send(null);
    } catch (e) {
      if (window.console) console.warn('[store-sync] offline, usando cache local');
    }
  }

  // ── 3) Parchear setItem para replicar cambios admin al servidor ──
  // Cola de reintentos para PUTs que fallan (cold start, red caida, etc.)
  var putQueue = {}; // { key: value }
  var rawSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    rawSetItem(key, value);
    if (SYNC_KEYS[key] && getToken()) {
      var doPut = function () {
        fetch(API + '/api/store/' + encodeURIComponent(key), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken(), 'ngrok-skip-browser-warning': 'true' },
          body: value
        }).then(function (r) {
          if (r.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if (isAdmin && !isLogin) location.replace('login.html');
          } else if (r.ok) {
            delete putQueue[key]; // exito, quitar de cola
          } else {
            putQueue[key] = value; // fallo, encolar para reintento
          }
        }).catch(function () { putQueue[key] = value; });
      };
      doPut();
    }
  };
  // Reintentar PUTs fallidos cada 30s
  if (isAdmin && getToken()) {
    setInterval(function () {
      Object.keys(putQueue).forEach(function (k) {
        fetch(API + '/api/store/' + encodeURIComponent(k), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken(), 'ngrok-skip-browser-warning': 'true' },
          body: putQueue[k]
        }).then(function (r) {
          if (r.ok) delete putQueue[k];
        }).catch(function () {});
      });
    }, 30000);
  }

  // ── 4) Interceptar enlaces "Salir" para cerrar sesion limpiamente ──
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a');
    links.forEach(function (a) {
      var txt = (a.textContent || '').trim().toLowerCase();
      if (txt === 'salir' || a.hasAttribute('data-logout')) {
        a.addEventListener('click', function () { window.HCAuth.logout(); });
      }
    });
  });
})();
