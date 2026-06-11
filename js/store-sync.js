(function () {
  'use strict';

  var PREFIX = 'hypercix-admin-';
  var TOKEN_KEY = 'hypercix-auth-token';
  var USER_KEY = 'hypercix-auth-user';

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

  var API_PORT = '3000';
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  var API = '';
  if (location.protocol === 'file:') {
    API = 'http://localhost:' + API_PORT;
  } else if (isLocal && location.port && location.port !== API_PORT) {
    API = location.protocol + '//' + host + ':' + API_PORT;
  }
  window.HC_API = API;

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }

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

  if (isAdmin && !isLogin && !getToken()) {
    location.replace('login.html');
    return;
  }

  if (!isLogin) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', API + '/api/store', false);
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
      xhr.send(null);
      if (xhr.status === 200) {
        var all = JSON.parse(xhr.responseText);
        Object.keys(SYNC_KEYS).forEach(function (k) {
          if (all[k] !== null && all[k] !== undefined) {
            localStorage.setItem(k, JSON.stringify(all[k]));
          }
        });
      }
    } catch (e) {
      if (window.console) console.warn('[store-sync] offline, usando cache local');
    }
  }

  var rawSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    rawSetItem(key, value);
    if (SYNC_KEYS[key] && getToken()) {
      try {
        fetch(API + '/api/store/' + encodeURIComponent(key), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken(), 'ngrok-skip-browser-warning': 'true' },
          body: value
        }).then(function (r) {
          if (r.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if (isAdmin && !isLogin) location.replace('login.html');
          }
        }).catch(function () {});
      } catch (e) {}
    }
  };

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
