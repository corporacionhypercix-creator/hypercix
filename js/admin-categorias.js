(() => {
  const CATEGORY_DATA_KEY = 'hypercix-admin-categories-data';
  const CATEGORY_FLAT_KEY = 'hypercix-admin-categories';

  const defaultCategories = [
    { id: 'cat-1', name: 'Camaras', description: 'Cámaras de seguridad y vigilancia' },
    { id: 'cat-2', name: 'Alarmas', description: 'Sistemas de alarma y detección' },
    { id: 'cat-3', name: 'Accesorios', description: 'Accesorios y complementos' },
    { id: 'cat-4', name: 'Redes', description: 'Equipos de red y conectividad' },
    { id: 'cat-5', name: 'Servicios', description: 'Servicios técnicos profesionales' },
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

  function syncFlatList() {
    const categories = getCategories();
    const names = categories.map(c => c.name);
    writeJSON(CATEGORY_FLAT_KEY, names);
  }

  function getCategories() {
    if (!localStorage.getItem(CATEGORY_DATA_KEY)) {
      writeJSON(CATEGORY_DATA_KEY, defaultCategories);
      syncFlatList();
    }
    return readJSON(CATEGORY_DATA_KEY, []);
  }

  function saveCategories(categories) {
    writeJSON(CATEGORY_DATA_KEY, categories);
    syncFlatList();
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  const form = document.getElementById('category-form');
  const editingId = document.getElementById('editing-id');
  const nameInput = document.getElementById('category-name');
  const descInput = document.getElementById('category-description');
  const submitBtn = document.getElementById('submit-category');
  const formTitle = document.getElementById('category-form-title');
  const cardGrid = document.getElementById('category-grid');
  const searchInput = document.getElementById('category-search');

  function renderCategories() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const categories = getCategories().filter(c => !query || c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query));

    if (!categories.length) {
      cardGrid.innerHTML = '<p class="empty-row">No hay categorías para mostrar.</p>';
      return;
    }

    cardGrid.innerHTML = categories.map(c => `
      <article class="admin-card category-card">
        <div class="category-color" style="background: ${c.color || '#2563eb'}"></div>
        <h3>${escapeHTML(c.name)}</h3>
        <p>${escapeHTML(c.description)}</p>
        <div class="row-actions">
          <button type="button" class="btn-secondary btn-small" data-action="edit" data-id="${escapeHTML(c.id)}">Editar</button>
          <button type="button" class="btn-danger btn-small" data-action="delete" data-id="${escapeHTML(c.id)}">Eliminar</button>
        </div>
      </article>`).join('');
  }

  function resetForm() {
    form.reset();
    editingId.value = '';
    submitBtn.textContent = 'Guardar categoría';
    formTitle.textContent = 'Nueva categoría';
  }

  function fillForm(category) {
    editingId.value = category.id;
    nameInput.value = category.name;
    descInput.value = category.description;
    submitBtn.textContent = 'Actualizar categoría';
    formTitle.textContent = 'Editar categoría';
    nameInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const categories = getCategories();
    const category = {
      id: editingId.value || `cat-${Date.now()}`,
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
    };

    const idx = categories.findIndex(c => c.id === category.id);
    if (idx >= 0) categories[idx] = category;
    else categories.push(category);

    saveCategories(categories);
    resetForm();
    renderCategories();
  });

  cardGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const categories = getCategories();
    const category = categories.find(c => c.id === btn.dataset.id);
    if (!category) return;

    if (btn.dataset.action === 'edit') fillForm(category);
    if (btn.dataset.action === 'delete' && confirm(`Eliminar categoría "${category.name}"?`)) {
      saveCategories(categories.filter(c => c.id !== category.id));
      renderCategories();
    }
  });

  document.getElementById('clear-form').addEventListener('click', resetForm);
  document.getElementById('new-category-button').addEventListener('click', () => { resetForm(); nameInput.focus(); });
  searchInput.addEventListener('input', renderCategories);

  resetForm();
  renderCategories();
})();
