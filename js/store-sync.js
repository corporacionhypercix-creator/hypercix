(function () {
  'use strict';
  var PREFIX = 'hypercix-admin-';
  var TOKEN_KEY = 'hypercix-auth-token';
  var USER_KEY = 'hypercix-auth-user';

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
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  var path = location.pathname;
  var isAdmin = path.indexOf('/admin/') !== -1;
  var isLogin = /login\.html$/i.test(path);

  if (isAdmin && !isLogin && !getToken()) {
    location.replace('login.html');
    return;
  }
})();
