(() => {
  const CLIENT_KEY = 'hypercix-admin-clients';

  const defaultClients = [
    { id: 'cli-1', name: 'Carlos Mendoza', email: 'cmendoza@ejemplo.com', phone: '+51 999 888 777', lastPurchase: '2026-06-01', notes: 'Cliente recurrente' },
    { id: 'cli-2', name: 'Maria Torres', email: 'mtorres@ejemplo.com', phone: '+51 988 777 666', lastPurchase: '2026-05-28', notes: '' },
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

  function getClients() {
    return readJSON(CLIENT_KEY, []);
  }

  function saveClients(clients) {
    writeJSON(CLIENT_KEY, clients);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  const form = document.getElementById('client-form');
  const editingId = document.getElementById('editing-id');
  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const phoneInput = document.getElementById('client-phone');
  const notesInput = document.getElementById('client-notes');
  const submitBtn = document.getElementById('submit-client');
  const formTitle = document.getElementById('client-form-title');
  const tableBody = document.getElementById('client-table-body');
  const searchInput = document.getElementById('client-search');

  function renderClients() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const clients = getClients().filter(c => !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query));

    if (!clients.length) {
      tableBody.innerHTML = '<tr><td colspan="5" class="empty-row">No hay clientes registrados.</td></tr>';
      return;
    }

    tableBody.innerHTML = clients.map(c => `
      <tr>
        <td><strong>${escapeHTML(c.name)}</strong></td>
        <td>${escapeHTML(c.email)}</td>
        <td>${escapeHTML(c.phone)}</td>
        <td>${c.lastPurchase || '--'}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn-secondary btn-small" data-action="edit" data-id="${escapeHTML(c.id)}">Editar</button>
            <button type="button" class="btn-danger btn-small" data-action="delete" data-id="${escapeHTML(c.id)}">Eliminar</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function resetForm() {
    form.reset();
    editingId.value = '';
    submitBtn.textContent = 'Guardar cliente';
    formTitle.textContent = 'Nuevo cliente';
  }

  function fillForm(client) {
    editingId.value = client.id;
    nameInput.value = client.name;
    emailInput.value = client.email;
    phoneInput.value = client.phone;
    notesInput.value = client.notes || '';
    submitBtn.textContent = 'Actualizar cliente';
    formTitle.textContent = 'Editar cliente';
    nameInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const clients = getClients();
    const client = {
      id: editingId.value || `cli-${Date.now()}`,
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      notes: notesInput.value.trim(),
      lastPurchase: editingId.value
        ? (clients.find(c => c.id === editingId.value)?.lastPurchase || '')
        : '',
    };

    const idx = clients.findIndex(c => c.id === client.id);
    if (idx >= 0) clients[idx] = client;
    else clients.push(client);

    saveClients(clients);
    resetForm();
    renderClients();
  });

  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const clients = getClients();
    const client = clients.find(c => c.id === btn.dataset.id);
    if (!client) return;

    if (btn.dataset.action === 'edit') fillForm(client);
    if (btn.dataset.action === 'delete' && confirm(`Eliminar cliente "${client.name}"?`)) {
      saveClients(clients.filter(c => c.id !== client.id));
      renderClients();
    }
  });

  document.getElementById('clear-form').addEventListener('click', resetForm);
  document.getElementById('new-client-button').addEventListener('click', () => { resetForm(); nameInput.focus(); });
  searchInput.addEventListener('input', renderClients);

  resetForm();
  renderClients();
  window.addEventListener('store-synced', renderClients);
})();
