(function () {
  'use strict';

  const KEY = 'hypercix-admin-brands';
  const THEME_KEY = 'hypercix-admin-theme';

  const defaultBrands = [
    { id: 'hikvision', name: 'Hikvision', description: 'Seguridad electrónica profesional', image: '', color: '#C62828' },
    { id: 'dahua', name: 'Dahua', description: 'Soluciones de videovigilancia', image: '', color: '#003087' },
    { id: 'ezviz', name: 'Ezviz', description: 'Smart home y seguridad', image: '', color: '#1BA0D7' },
    { id: 'ubiquiti', name: 'Ubiquiti', description: 'Redes y conectividad', image: '', color: '#0559C9' },
    { id: 'generica', name: 'Generica', description: 'Productos genéricos', image: '', color: '#6B7280' },
    { id: 'servicio', name: 'Servicio', description: 'Servicios técnicos', image: '', color: '#10B981' },
  ];

  function readJSON(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeBrand(item, index) {
    if (typeof item === 'string') {
      return { id: `brand-${index}-${Date.now()}`, name: item, description: '', image: '', color: '' };
    }
    return {
      id: item.id || `brand-${index}-${Date.now()}`,
      name: item.name || item.nombre || 'Sin nombre',
      description: item.description || item.descripcion || '',
      image: item.image || item.logo || item.img || '',
      color: item.color || '',
    };
  }

  function getBrands() {
    const raw = readJSON(KEY, null);
    if (!raw) return [];
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeBrand);
  }

  function saveBrands(brands) {
    writeJSON(KEY, brands);
  }

  let brandImages = [];
  let editingId = null;
  let currentBrands = [];

  const form = document.getElementById('brand-form');
  const editingIdInput = document.getElementById('editing-id');
  const nameInput = document.getElementById('brand-name');
  const descInput = document.getElementById('brand-description');
  const imageUrlInput = document.getElementById('brand-image-url');
  const addImageBtn = document.getElementById('add-brand-image');
  const imageFileInput = document.getElementById('brand-image-file');
  const previewEl = document.getElementById('brand-image-preview');
  const colorInput = document.getElementById('brand-color');
  const colorTextInput = document.getElementById('brand-color-text');
  const submitBtn = document.getElementById('submit-brand');
  const clearBtn = document.getElementById('clear-form');
  const gridEl = document.getElementById('brand-grid');
  const searchInput = document.getElementById('brand-search');

  function renderPreview() {
    previewEl.innerHTML = brandImages.map((url, i) =>
      `<div style="position:relative;display:inline-block">
        <img src="${url}" style="height:48px;width:48px;object-fit:contain;border-radius:6px;border:1px solid var(--admin-border)" />
        <button type="button" data-idx="${i}" class="del-img" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;border:0;background:#c0392b;color:#fff;font-size:11px;line-height:18px;text-align:center;cursor:pointer;padding:0">&times;</button>
      </div>`
    ).join('');
    previewEl.querySelectorAll('.del-img').forEach(btn => {
      btn.addEventListener('click', function () {
        brandImages.splice(Number(this.dataset.idx), 1);
        renderPreview();
      });
    });
  }

  function addImage() {
    const value = imageUrlInput.value.trim();
    if (!value) return;
    brandImages.push(value);
    imageUrlInput.value = '';
    renderPreview();
  }

  addImageBtn.addEventListener('click', addImage);
  imageUrlInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); addImage(); }
  });

  imageFileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      if (typeof window.HCToast === 'function') HCToast('La imagen no puede superar 2 MB', 'warn');
      this.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      brandImages.push(e.target.result);
      renderPreview();
    };
    reader.readAsDataURL(file);
    this.value = '';
  });

  colorInput.addEventListener('input', function () { colorTextInput.value = this.value; });
  colorTextInput.addEventListener('input', function () {
    if (/^#[0-9a-f]{6}$/i.test(this.value)) colorInput.value = this.value;
  });

  function resetForm() {
    editingId = null;
    editingIdInput.value = '';
    form.querySelector('h2').textContent = 'Nueva marca';
    submitBtn.textContent = 'Guardar marca';
    nameInput.value = '';
    descInput.value = '';
    brandImages = [];
    renderPreview();
    colorInput.value = '#C62828';
    colorTextInput.value = '#C62828';
  }

  clearBtn.addEventListener('click', resetForm);

  function renderGrid(list) {
    if (!gridEl) return;
    const data = list || currentBrands;
    if (!data.length) {
      gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--admin-muted)">No hay marcas registradas.</div>';
      return;
    }
    gridEl.innerHTML = data.map((b, idx) => {
      const logoHtml = b.image
        ? `<img src="${b.image}" alt="${b.name}" style="height:52px;max-width:100%;object-fit:contain;margin-bottom:0.6rem" onerror="this.style.display='none'" />`
        : `<div style="width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;margin:0 auto 0.6rem;background:${b.color || '#374151'};color:#fff">${b.name.charAt(0).toUpperCase()}</div>`;
      const colorDot = b.color
        ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${b.color};margin-right:6px;vertical-align:middle;border:1px solid rgba(255,255,255,.12)"></span>`
        : '';
      return `<div class="brand-card card-item" data-idx="${idx}">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding: .25rem 0">
          ${logoHtml}
          <h3 style="margin:0 0 .15rem;font-size:1rem">${colorDot}${b.name}</h3>
          ${b.description ? `<p style="margin:0 0 .6rem;font-size:.78rem;color:var(--admin-muted)">${b.description}</p>` : ''}
          <span style="font-size:.7rem;color:var(--admin-muted);font-family:monospace">${b.id}</span>
        </div>
        <div class="row-actions" style="margin-top:.6rem">
          <button class="btn-icon edit-brand" data-id="${b.id}" title="Editar"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" style="width:14px;height:14px"><path d="M11 2l3 3-8 8H3v-3z"/></svg></button>
          <button class="btn-icon delete-brand" data-id="${b.id}" title="Eliminar"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" style="width:14px;height:14px"><path d="M2 4h12M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M13 4l-.7 9.1a1 1 0 01-1 .9H4.7a1 1 0 01-1-.9L3 4"/></svg></button>
        </div>
      </div>`;
    }).join('');

    gridEl.querySelectorAll('.edit-brand').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        const brand = currentBrands.find(b => b.id === id);
        if (brand) populateForm(brand);
      });
    });
    gridEl.querySelectorAll('.delete-brand').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        if (typeof HCConfirm === 'function') {
          HCConfirm('¿Eliminar esta marca?', { description: 'Los productos asociados conservarán el nombre de la marca.', confirmText: 'Eliminar', danger: true }).then(ok => {
            if (ok) deleteBrand(id);
          });
        } else if (confirm('¿Eliminar esta marca?')) {
          deleteBrand(id);
        }
      });
    });
  }

  function populateForm(brand) {
    editingId = brand.id;
    editingIdInput.value = brand.id;
    form.querySelector('h2').textContent = 'Editar marca';
    submitBtn.textContent = 'Actualizar marca';
    nameInput.value = brand.name || '';
    descInput.value = brand.description || '';
    brandImages = brand.image ? [brand.image] : [];
    renderPreview();
    if (brand.color) {
      colorInput.value = brand.color;
      colorTextInput.value = brand.color;
    } else {
      colorInput.value = '#C62828';
      colorTextInput.value = '#C62828';
    }
    form.scrollIntoView({ behavior: 'smooth' });
  }

  function deleteBrand(id) {
    currentBrands = currentBrands.filter(b => b.id !== id);
    saveBrands(currentBrands);
    renderGrid();
    applyFilter();
    if (typeof window.HCToast === 'function') HCToast('Marca eliminada', 'ok');
  }

  function applyFilter() {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const filtered = term
      ? currentBrands.filter(b => b.name.toLowerCase().includes(term) || b.description.toLowerCase().includes(term))
      : currentBrands;
    renderGrid(filtered);
  }

  searchInput?.addEventListener('input', applyFilter);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      if (typeof HCToast === 'function') HCToast('El nombre es obligatorio', 'warn');
      return;
    }
    const brand = {
      id: editingId || `brand-${Date.now()}`,
      name,
      description: descInput.value.trim(),
      image: brandImages[0] || '',
      color: (colorTextInput.value || '#C62828').trim(),
    };
    if (editingId) {
      const idx = currentBrands.findIndex(b => b.id === editingId);
      if (idx >= 0) currentBrands[idx] = brand;
    } else {
      currentBrands.unshift(brand);
    }
    saveBrands(currentBrands);
    resetForm();
    renderGrid();
    applyFilter();
    if (typeof window.HCToast === 'function') HCToast(editingId ? 'Marca actualizada' : 'Marca creada', 'ok');
  });

  function init() {
    if (localStorage.getItem(THEME_KEY) === 'light') document.body.classList.add('light-admin');
    currentBrands = getBrands();
    renderGrid();
  }

  init();
  window.addEventListener('store-synced', function () {
    currentBrands = getBrands();
    renderGrid();
    applyFilter();
  });
})();
