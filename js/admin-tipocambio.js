(() => {
  const RATE_KEY = 'hypercix-admin-exchange-rate';

  const defaultRate = {
    sourceCurrency: 'USD',
    targetCurrency: 'PEN',
    rate: 3.75,
    lastUpdated: '2026-06-09',
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

  function getRate() {
    if (!localStorage.getItem(RATE_KEY)) writeJSON(RATE_KEY, defaultRate);
    return readJSON(RATE_KEY, defaultRate);
  }

  function saveRate(rate) {
    writeJSON(RATE_KEY, rate);
  }

  const form = document.getElementById('rate-form');
  const sourceInput = document.getElementById('rate-source');
  const targetInput = document.getElementById('rate-target');
  const rateInput = document.getElementById('rate-value');
  const displayEl = document.getElementById('rate-display');
  const historyBody = document.getElementById('rate-history-body');

  function renderRate() {
    const rate = getRate();
    sourceInput.value = rate.sourceCurrency;
    targetInput.value = rate.targetCurrency;
    rateInput.value = rate.rate;
    displayEl.textContent = `1 ${rate.sourceCurrency} = ${Number(rate.rate).toFixed(4)} ${rate.targetCurrency}`;
    renderHistory();
  }

  function renderHistory() {
    const history = readJSON('hypercix-admin-rate-history', []);
    if (!history.length) {
      historyBody.innerHTML = '<tr><td colspan="3" class="empty-row">Sin historial de cambios.</td></tr>';
      return;
    }
    historyBody.innerHTML = history.slice().reverse().map(h => `
      <tr>
        <td>${h.date}</td>
        <td>1 ${h.source} = ${Number(h.rate).toFixed(4)} ${h.target}</td>
        <td>${h.note || '--'}</td>
      </tr>`).join('');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldRate = getRate();
    const newRate = {
      sourceCurrency: sourceInput.value.trim().toUpperCase(),
      targetCurrency: targetInput.value.trim().toUpperCase(),
      rate: Number(rateInput.value),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const history = readJSON('hypercix-admin-rate-history', []);
    history.push({
      date: newRate.lastUpdated,
      source: oldRate.sourceCurrency,
      target: oldRate.targetCurrency,
      rate: oldRate.rate,
      note: `Cambio a ${newRate.rate}`,
    });
    writeJSON('hypercix-admin-rate-history', history);

    saveRate(newRate);
    renderRate();
    alert('Tipo de cambio actualizado correctamente.');
  });

  renderRate();
})();
