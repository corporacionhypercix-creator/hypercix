(() => {
  const SETTINGS_KEY = 'hypercix-admin-settings';

  const defaultSettings = {
    storeName: 'HYPERCIX',
    currency: 'S/',
    currencyCode: 'PEN',
    taxRate: 18,
    taxName: 'IGV',
    email: 'contacto@hypercix.com',
    phone: '+51 999 000 000',
    address: 'Av. Principal 123, Lima, Perú',
    theme: 'light',
  };

  function readJSON(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSettings() {
    if (!localStorage.getItem(SETTINGS_KEY)) writeJSON(SETTINGS_KEY, defaultSettings);
    return readJSON(SETTINGS_KEY, defaultSettings);
  }

  function saveSettings(settings) {
    writeJSON(SETTINGS_KEY, settings);
  }

  const form = document.getElementById('settings-form');
  const storeNameInput = document.getElementById('sett-store-name');
  const currencyInput = document.getElementById('sett-currency');
  const currencyCodeInput = document.getElementById('sett-currency-code');
  const taxRateInput = document.getElementById('sett-tax-rate');
  const taxNameInput = document.getElementById('sett-tax-name');
  const emailInput = document.getElementById('sett-email');
  const phoneInput = document.getElementById('sett-phone');
  const addressInput = document.getElementById('sett-address');

  function loadSettings() {
    const s = getSettings();
    storeNameInput.value = s.storeName;
    currencyInput.value = s.currency;
    currencyCodeInput.value = s.currencyCode;
    taxRateInput.value = s.taxRate;
    taxNameInput.value = s.taxName;
    emailInput.value = s.email;
    phoneInput.value = s.phone;
    addressInput.value = s.address;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      storeName: storeNameInput.value.trim(),
      currency: currencyInput.value.trim(),
      currencyCode: currencyCodeInput.value.trim().toUpperCase(),
      taxRate: Number(taxRateInput.value),
      taxName: taxNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
    };
    saveSettings(settings);
    alert('Configuración guardada correctamente.');
  });

  document.getElementById('reset-settings').addEventListener('click', () => {
    if (confirm('Restaurar valores por defecto?')) {
      saveSettings(defaultSettings);
      loadSettings();
      alert('Configuración restaurada a valores por defecto.');
    }
  });

  loadSettings();
})();
