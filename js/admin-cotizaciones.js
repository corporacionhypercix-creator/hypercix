(() => {
  const QUOTE_KEY = 'hypercix-admin-quotes';

  const defaultQuotes = [
    { id: 'q-1', client: 'Empresa ABC', email: 'abc@ejemplo.com', phone: '+51 999 111 222', product: 'Kit de cámaras 8MP', description: 'Solicitan cotización para 20 cámaras con instalación', amount: 8500, status: 'pendiente', date: '2026-06-07' },
    { id: 'q-2', client: 'Almacenes del Norte', email: 'almacenes@ejemplo.com', phone: '+51 988 333 444', product: 'DVR 16 canales', description: 'Requieren 5 DVR para sucursales', amount: 4200, status: 'aprobada', date: '2026-06-05' },
  ];

  function readJSON(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getQuotes() {
    return readJSON(QUOTE_KEY, []);
  }

  function saveQuotes(quotes) {
    writeJSON(QUOTE_KEY, quotes);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return `S/ ${Number(value || 0).toFixed(2)}`;
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  const form = document.getElementById('quote-form');
  const editingId = document.getElementById('editing-id');
  const clientInput = document.getElementById('quote-client');
  const emailInput = document.getElementById('quote-email');
  const phoneInput = document.getElementById('quote-phone');
  const productInput = document.getElementById('quote-product');
  const descInput = document.getElementById('quote-description');
  const amountInput = document.getElementById('quote-amount');
  const statusSelect = document.getElementById('quote-status');
  const submitBtn = document.getElementById('submit-quote');
  const formTitle = document.getElementById('quote-form-title');
  const tableBody = document.getElementById('quote-table-body');
  const searchInput = document.getElementById('quote-search');
  const statusFilter = document.getElementById('quote-status-filter');

  function renderQuotes() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const filterStatus = statusFilter.value;
    let quotes = getQuotes().filter(q => {
      if (filterStatus && q.status !== filterStatus) return false;
      if (query) {
        const text = `${q.client} ${q.product} ${q.description}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    if (!quotes.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">No hay cotizaciones.</td></tr>';
      return;
    }

    tableBody.innerHTML = quotes.map(q => {
      const statusClass = q.status === 'aprobada' ? 'status-approved' : q.status === 'rechazada' ? 'status-rejected' : 'status-pending';
      return `<tr>
        <td><strong>${escapeHTML(q.client)}</strong></td>
        <td>${escapeHTML(q.email)}<br><small>${escapeHTML(q.phone)}</small></td>
        <td>${escapeHTML(q.product)}</td>
        <td>${formatMoney(q.amount)}</td>
        <td><span class="quote-status ${statusClass}">${q.status}</span></td>
        <td>${q.date || '--'}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn-secondary btn-small" data-action="edit" data-id="${escapeHTML(q.id)}">Editar</button>
            <button type="button" class="btn-danger btn-small" data-action="delete" data-id="${escapeHTML(q.id)}">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function resetForm() {
    form.reset();
    editingId.value = '';
    statusSelect.value = 'pendiente';
    submitBtn.textContent = 'Guardar cotización';
    formTitle.textContent = 'Nueva cotización';
  }

  function fillForm(quote) {
    editingId.value = quote.id;
    clientInput.value = quote.client;
    emailInput.value = quote.email;
    phoneInput.value = quote.phone;
    productInput.value = quote.product;
    descInput.value = quote.description;
    amountInput.value = quote.amount;
    statusSelect.value = quote.status;
    submitBtn.textContent = 'Actualizar cotización';
    formTitle.textContent = 'Editar cotización';
    clientInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const quotes = getQuotes();
    const quote = {
      id: editingId.value || `q-${Date.now()}`,
      client: clientInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      product: productInput.value.trim(),
      description: descInput.value.trim(),
      amount: Number(amountInput.value),
      status: statusSelect.value,
      date: editingId.value ? (quotes.find(q => q.id === editingId.value)?.date || today()) : today(),
    };

    const idx = quotes.findIndex(q => q.id === quote.id);
    if (idx >= 0) quotes[idx] = quote;
    else quotes.unshift(quote);

    saveQuotes(quotes);
    resetForm();
    renderQuotes();
  });

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === btn.dataset.id);
    if (!quote) return;

    if (btn.dataset.action === 'edit') fillForm(quote);
    if (btn.dataset.action === 'delete' && confirm(`Eliminar cotización de "${quote.client}"?`)) {
      saveQuotes(quotes.filter(q => q.id !== quote.id));
      renderQuotes();
    }
  });

  document.getElementById('clear-form').addEventListener('click', resetForm);
  document.getElementById('new-quote-button').addEventListener('click', () => { resetForm(); clientInput.focus(); });
  searchInput.addEventListener('input', renderQuotes);
  statusFilter.addEventListener('change', renderQuotes);

  resetForm();
  renderQuotes();
  window.addEventListener('store-synced', renderQuotes);
})();
