(() => {
  const PRODUCT_KEY = 'hypercix-admin-products';

  function readJSON(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getProducts() {
    return readJSON(PRODUCT_KEY, []);
  }

  function saveProducts(products) {
    writeJSON(PRODUCT_KEY, products);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function formatMoney(value) {
    return `S/ ${Number(value || 0).toFixed(2)}`;
  }

  const tableBody = document.getElementById('inventory-table-body');
  const searchInput = document.getElementById('inventory-search');
  const lowStockCheck = document.getElementById('low-stock-filter');
  const stockSummary = document.getElementById('stock-summary');

  function renderInventory() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const onlyLow = lowStockCheck.checked;
    let products = getProducts();

    let totalProducts = products.length;
    let totalStock = 0;
    let lowStockCount = 0;

    products = products.filter(p => {
      totalStock += Number(p.stock || 0);
      if (p.stock <= 5) lowStockCount++;
      if (onlyLow && p.stock > 5) return false;
      if (query) {
        const text = `${p.code || ''} ${p.description || ''} ${p.category || ''} ${p.brand || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      return true;
    });

    stockSummary.textContent = `Total: ${totalProducts} productos | Stock total: ${totalStock} unidades | Stock bajo: ${lowStockCount}`;

    if (!products.length) {
      tableBody.innerHTML = '<tr><td colspan="5" class="empty-row">No hay productos en inventario.</td></tr>';
      return;
    }

    tableBody.innerHTML = products.map(p => `
      <tr class="${p.stock <= 5 ? 'low-stock-row' : ''}">
        <td>
          ${p.image ? `<img src="${escapeHTML(p.image)}" alt="" style="width:48px;height:48px;border-radius:0.5rem;object-fit:cover;" />`
            : `<div style="width:48px;height:48px;border-radius:0.5rem;background:#e5e7eb;display:grid;place-items:center;font-size:0.7rem;color:#6b7280;">${escapeHTML((p.code || '?').slice(0, 6))}</div>`}
        </td>
        <td><strong>${escapeHTML(p.code || '')}</strong></td>
        <td>${escapeHTML(p.description || '')}<br><small>${escapeHTML(p.category || '')}</small></td>
        <td>
          <input type="number" class="stock-input" data-id="${escapeHTML(p.id)}" value="${Number(p.stock || 0)}" min="0" />
        </td>
        <td class="${p.stock <= 5 ? 'low-stock' : ''}">
          ${p.stock <= 5 ? '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:11px;height:11px;vertical-align:middle"><path d="M7 1L1 12h12z"/><line x1="7" y1="6" x2="7" y2="9"/></svg> Stock bajo' : '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:11px;height:11px;vertical-align:middle;color:var(--success)"><polyline points="2,7 6,11 12,3"/></svg> OK'}
        </td>
      </tr>`).join('');

    document.querySelectorAll('.stock-input').forEach(input => {
      input.addEventListener('change', function() {
        const products = getProducts();
        const product = products.find(p => p.id === this.dataset.id);
        if (product) {
          product.stock = Math.max(0, Number(this.value));
          saveProducts(products);
          renderInventory();
        }
      });
    });
  }

  searchInput.addEventListener('input', renderInventory);
  lowStockCheck.addEventListener('change', renderInventory);

  renderInventory();
})();
