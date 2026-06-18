(() => {
  const BANNER_KEY = 'hypercix-admin-banners';
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const defaultBanners = [
    { id: 'ban-1', title: 'Ofertas de temporada', subtitle: 'Hasta 30% de descuento en cámaras IP', link: '#', image: '', active: true },
    { id: 'ban-2', title: 'Nuevos productos', subtitle: 'Conoce nuestra última línea de alarmas inteligentes', link: '#', image: '', active: true },
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

  function getBanners() {
    return readJSON(BANNER_KEY, []);
  }

  function saveBanners(banners) {
    writeJSON(BANNER_KEY, banners);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  const form = document.getElementById('banner-form');
  const editingId = document.getElementById('editing-id');
  const titleInput = document.getElementById('banner-title');
  const subtitleInput = document.getElementById('banner-subtitle');
  const linkInput = document.getElementById('banner-link');
  const imageUrlInput = document.getElementById('banner-image-url');
  const imageFileInput = document.getElementById('banner-image-file');
  const activeCheck = document.getElementById('banner-active');
  const preview = document.getElementById('banner-preview');
  const submitBtn = document.getElementById('submit-banner');
  const formTitle = document.getElementById('banner-form-title');
  const cardGrid = document.getElementById('banner-grid');
  const searchInput = document.getElementById('banner-search');
  let uploadedImage = '';

  function renderBanners() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const banners = getBanners().filter(b => !query ||
      b.title.toLowerCase().includes(query) ||
      b.subtitle.toLowerCase().includes(query));

    if (!banners.length) {
      cardGrid.innerHTML = '<p class="empty-row">No hay banners para mostrar.</p>';
      return;
    }

    cardGrid.innerHTML = banners.map(b => `
      <article class="admin-card banner-card ${b.active ? '' : 'inactive'}">
        ${b.image ? `<img src="${escapeHTML(b.image)}" alt="${escapeHTML(b.title)}" class="banner-thumb" />` : '<div class="banner-thumb placeholder">Sin imagen</div>'}
        <div class="banner-info">
          <h3>${escapeHTML(b.title)}</h3>
          <p>${escapeHTML(b.subtitle)}</p>
          <span class="banner-status ${b.active ? 'active' : 'inactive'}">${b.active ? 'Activo' : 'Inactivo'}</span>
        </div>
        <div class="row-actions">
          <button type="button" class="btn-secondary btn-small" data-action="edit" data-id="${escapeHTML(b.id)}">Editar</button>
          <button type="button" class="btn-danger btn-small" data-action="delete" data-id="${escapeHTML(b.id)}">Eliminar</button>
        </div>
      </article>`).join('');
  }

  function updatePreview(source) {
    if (!source) {
      preview.innerHTML = 'Sin imagen';
      return;
    }
    preview.innerHTML = `<img src="${escapeHTML(source)}" alt="Vista previa" style="width:100%;height:100%;object-fit:cover;" />`;
  }

  function resetForm() {
    form.reset();
    editingId.value = '';
    uploadedImage = '';
    imageUrlInput.placeholder = 'https://...';
    activeCheck.checked = true;
    submitBtn.textContent = 'Guardar banner';
    formTitle.textContent = 'Nuevo banner';
    updatePreview('');
  }

  function fillForm(banner) {
    editingId.value = banner.id;
    titleInput.value = banner.title;
    subtitleInput.value = banner.subtitle;
    linkInput.value = banner.link;
    activeCheck.checked = banner.active;
    uploadedImage = banner.image && banner.image.startsWith('data:image') ? banner.image : '';
    imageUrlInput.value = uploadedImage ? '' : banner.image;
    imageUrlInput.placeholder = uploadedImage ? 'Imagen cargada' : 'https://...';
    updatePreview(banner.image);
    submitBtn.textContent = 'Actualizar banner';
    formTitle.textContent = 'Editar banner';
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const banners = getBanners();
    const banner = {
      id: editingId.value || `ban-${Date.now()}`,
      title: titleInput.value.trim(),
      subtitle: subtitleInput.value.trim(),
      link: linkInput.value.trim(),
      active: activeCheck.checked,
      image: uploadedImage || imageUrlInput.value.trim(),
    };

    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) banners[idx] = banner;
    else banners.push(banner);

    saveBanners(banners);
    resetForm();
    renderBanners();
  });

  imageUrlInput.addEventListener('input', () => {
    uploadedImage = '';
    updatePreview(imageUrlInput.value.trim());
  });

  imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) { alert('La imagen supera el máximo de 5MB.'); imageFileInput.value = ''; return; }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      uploadedImage = reader.result;
      imageUrlInput.value = '';
      updatePreview(uploadedImage);
    });
    reader.readAsDataURL(file);
  });

  cardGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const banners = getBanners();
    const banner = banners.find(b => b.id === btn.dataset.id);
    if (!banner) return;

    if (btn.dataset.action === 'edit') fillForm(banner);
    if (btn.dataset.action === 'delete' && confirm(`Eliminar banner "${banner.title}"?`)) {
      saveBanners(banners.filter(b => b.id !== banner.id));
      renderBanners();
    }
  });

  document.getElementById('clear-form').addEventListener('click', resetForm);
  document.getElementById('new-banner-button').addEventListener('click', () => { resetForm(); titleInput.focus(); });
  searchInput.addEventListener('input', renderBanners);

  resetForm();
  renderBanners();
  window.addEventListener('store-synced', renderBanners);
})();
