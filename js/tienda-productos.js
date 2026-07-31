(() => {
  const STORE_PRODUCTS_KEY = 'hypercix-admin-products';
  const storeGrid = document.getElementById('store-products');

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function getProducts() {
    try {
      const saved = localStorage.getItem(STORE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }

  function normalize(p, i) {
    const images = (Array.isArray(p.images) ? p.images : []).filter(Boolean);
    if (!images.length && p.image) images.push(p.image);
    return {
      id: p.id || '',
      code: p.code || p.sku || `PROD-${String(i + 1).padStart(3, '0')}`,
      description: p.description || p.name || 'Producto disponible',
      details: p.details || p.longDescription || '',
      category: p.category || 'General',
      brand: p.brand || 'Sin marca',
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
      image: p.image || images[0] || '',
      images,
      taxType: p.taxType || 'gravado',
    };
  }

  function productMatchesSearch(product, q) {
    if (!q) return true;
    const term = q.toLowerCase();
    return product.description.toLowerCase().includes(term)
      || product.code.toLowerCase().includes(term)
      || product.brand.toLowerCase().includes(term)
      || product.category.toLowerCase().includes(term);
  }

  function getExchangeRate() {
    try {
      const saved = localStorage.getItem('hypercix-admin-exchange-rate');
      if (saved) { const r = JSON.parse(saved); return Number(r.rate) || 3.75; }
    } catch {}
    return 3.75;
  }

  function render() {
    const skeleton = document.getElementById('store-skeleton');
    if (skeleton) skeleton.style.display = 'none';

    let products = getProducts().map(normalize);

    if (!products.length) {
      storeGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:52px;height:52px;opacity:0.4"><path d="M4 4h6l6 24h22L42 12H12"/><circle cx="22" cy="42" r="4"/><circle cx="36" cy="42" r="4"/></svg></div>
          <p>No hay productos disponibles en este momento.</p>
          <p style="font-size:0.9rem;margin-top:0.5rem;">Agrega productos desde el panel de administraci&oacute;n.</p>
        </div>`;
      return;
    }

    const searchInput = document.getElementById('store-search');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const activeFilter = document.querySelector('#store-filters .active');
    const activeCategory = activeFilter ? activeFilter.dataset.filter : 'all';

    const filtered = products.filter(p => {
      if (!productMatchesSearch(p, searchTerm)) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      return true;
    });

    if (!filtered.length) {
      storeGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" style="width:52px;height:52px;opacity:0.4"><circle cx="21" cy="21" r="14"/><path d="M32 32L44 44"/></svg></div>
          <p>No se encontraron productos</p>
          <p style="font-size:0.9rem;margin-top:0.5rem;color:var(--muted);">Intenta con otros t&eacute;rminos de b&uacute;squeda.</p>
        </div>`;
      return;
    }

    const rate = getExchangeRate();

    storeGrid.innerHTML = filtered.map(p => {
      const igv = p.taxType === 'gravado' ? 1.18 : 1;
      const priceIgv = p.price * igv;
      const priceUsd = p.price / rate;
      const badgeClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock';
      const badgeText = p.stock <= 0 ? 'Consultar stock' : p.stock <= 5 ? `${p.stock} uds` : `${p.stock} uds`;

      return `
      <article class="product-card" data-category="${esc(p.category)}" data-code="${esc(p.code)}" data-brand="${esc(p.brand)}" data-name="${esc(p.description)}" data-price="${p.price}" data-stock="${p.stock}">
        <span class="product-badge ${badgeClass}">${badgeText}</span>
        ${p.images.length > 1 ? `<span class="product-image-count"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px"><rect x="1" y="3.5" width="10.5" height="9" rx="1.5"/><path d="M4.5 1.5h8.5A1.5 1.5 0 0114.5 3v8.5"/></svg> ${p.images.length}</span>` : ''}
        ${p.image
          ? `<img class="product-image" src="${esc(p.image)}" alt="${esc(p.description)}" />`
          : `<div class="product-image placeholder" style="display:grid;place-items:center;"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:40px;height:40px;opacity:0.3"><rect x="4" y="14" width="32" height="22" rx="4"/><circle cx="20" cy="25" r="7"/><path d="M36 19l8-4v18l-8-4z"/></svg></div>`}
        <span class="brand-tag">${esc(p.brand)}</span>
        <h2>${esc(p.description)}</h2>
        <p class="sku"><span>${esc(p.code)}</span> &middot; ${esc(p.category)}</p>
        <div class="price-block">
          <p class="price-base">Precio base ${p.taxType === 'exonerado' ? '(exonerado)' : ''}</p>
          <p class="price-final">S/ ${p.price.toFixed(2)}</p>
          <p class="price-usd">USD ${priceUsd.toFixed(2)}</p>
          ${p.taxType === 'gravado' ? `<p class="price-tax">Precio con IGV (18%): S/ ${priceIgv.toFixed(2)}</p>` : ''}
          ${p.taxType === 'inafecto' ? `<p class="price-tax">Operaci&oacute;n inafecta</p>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn-small btn-quote btn-details" type="button" data-id="${esc(p.id || p.code)}" data-code="${esc(p.code)}">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;vertical-align:middle"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg> Ver detalles
          </button>
          <button class="btn-small btn-buy" data-id="${esc(p.id || p.code)}" data-code="${esc(p.code)}" ${p.stock <= 0 ? 'disabled' : ''}>
            ${p.stock <= 0 ? 'Sin stock' : '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;vertical-align:middle"><path d="M1 1h2l2 7h6L12 4H4"/><circle cx="6" cy="12" r="1"/><circle cx="10" cy="12" r="1"/></svg> Cotizar'}
          </button>
        </div>
      </article>`;
    }).join('');

    window.__storeProducts = products;
    setupFilters();
    setupCategoryPills();
    setupSearch();
    setupQuickView(filtered);
  }

  function setupSearch() {
    const input = document.getElementById('store-search');
    if (!input) return;
    input.removeEventListener('input', render);
    input.addEventListener('input', render);
  }

  function setupCategoryPills() {
    const pills = document.querySelectorAll('#store-filters .category-pill');
    pills.forEach(btn => {
      btn.removeEventListener('click', onPillClick);
      btn.addEventListener('click', onPillClick);
    });
  }

  function onPillClick() {
    const pills = document.querySelectorAll('#store-filters .category-pill');
    pills.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    render();
  }

  function setupFilters() {
    const categories = new Set();
    document.querySelectorAll('#store-products .product-card').forEach(card => {
      if (card.dataset.category) categories.add(card.dataset.category);
    });
    const container = document.getElementById('store-filters');
    if (container) {
      container.querySelectorAll('.category-pill').forEach(p => {
        const cat = p.dataset.filter;
        p.style.display = (cat === 'all' || categories.has(cat)) ? '' : 'none';
      });
    }
  }

  function setupQuickView(products) {
    const cards = document.querySelectorAll('#store-products .product-card');
    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-actions')) return;
        const p = products[i];
        if (p) openModal(p);
      });
      const detailsBtn = card.querySelector('.btn-details');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const p = products[i];
          if (p) openModal(p);
        });
      }
    });
  }

  function setModalImage(src, alt) {
    const imageEl = document.getElementById('modal-image');
    if (src) {
      imageEl.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(alt) + '" />';
    } else {
      imageEl.innerHTML = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:64px;height:64px;opacity:0.25"><rect x="4" y="18" width="44" height="28" rx="5"/><circle cx="26" cy="32" r="9"/><path d="M48 25l12-5v24l-12-5z"/></svg>';
    }
  }

  function renderModalThumbs(images, alt) {
    const thumbsEl = document.getElementById('modal-thumbs');
    if (!thumbsEl) return;

    if (images.length <= 1) {
      thumbsEl.style.display = 'none';
      thumbsEl.innerHTML = '';
      return;
    }

    thumbsEl.style.display = 'flex';
    thumbsEl.innerHTML = images.map((src, idx) =>
      '<button type="button" class="modal-thumb' + (idx === 0 ? ' active' : '') + '" data-index="' + idx + '"><img src="' + esc(src) + '" alt="' + esc(alt) + ' ' + (idx + 1) + '" /></button>'
    ).join('');

    thumbsEl.querySelectorAll('.modal-thumb').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        thumbsEl.querySelectorAll('.modal-thumb').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setModalImage(images[idx], alt);
      });
    });
  }

  function openModal(p) {
    const overlay = document.getElementById('quick-modal');
    if (!overlay) return;
    const igv = p.taxType === 'gravado' ? 1.18 : 1;
    const priceIgv = p.price * igv;
    const rate = getExchangeRate();
    const priceUsd = p.price / rate;

    document.getElementById('modal-title').textContent = p.description;
    document.getElementById('modal-brand').textContent = p.brand;
    document.getElementById('modal-sku').textContent = p.code + ' \u00b7 ' + p.category;

    const images = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    setModalImage(images[0], p.description);
    renderModalThumbs(images, p.description);

    const descEl = document.getElementById('modal-description');
    if (descEl) {
      if (p.details) {
        descEl.textContent = p.details;
        descEl.style.display = '';
      } else {
        descEl.textContent = '';
        descEl.style.display = 'none';
      }
    }

    document.getElementById('modal-price').innerHTML = 'S/ ' + p.price.toFixed(2) + ' <span style="font-size:0.8rem;font-weight:400;color:var(--accent-light);">USD ' + priceUsd.toFixed(2) + '</span>';
    document.getElementById('modal-tax').textContent = p.taxType === 'gravado'
      ? 'Precio con IGV (18%): S/ ' + priceIgv.toFixed(2)
      : p.taxType === 'exonerado' ? 'Precio exonerado' : 'Operaci\u00f3n inafecta';

    const stockEl = document.getElementById('modal-stock');
    var warnIcon = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:12px;height:12px;vertical-align:middle;flex-shrink:0"><path d="M7 1L1 12h12z"/><line x1="7" y1="6" x2="7" y2="9"/><circle cx="7" cy="11" r="0.4" fill="currentColor"/></svg> ';
    var checkIcon = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:12px;height:12px;vertical-align:middle;flex-shrink:0"><polyline points="2,7 6,11 12,3"/></svg> ';
    if (p.stock <= 0) {
      stockEl.innerHTML = '<span style="color:var(--warning);display:inline-flex;align-items:center;gap:4px">' + warnIcon + 'Consultar disponibilidad</span>';
    } else if (p.stock <= 5) {
      stockEl.innerHTML = '<span style="color:var(--warning);display:inline-flex;align-items:center;gap:4px">' + warnIcon + 'Stock bajo: ' + p.stock + ' unidades</span>';
    } else {
      stockEl.innerHTML = '<span style="color:var(--success);display:inline-flex;align-items:center;gap:4px">' + checkIcon + 'Stock disponible: ' + p.stock + ' unidades</span>';
    }

    const buyBtn = document.getElementById('modal-buy');
    buyBtn.dataset.code = p.code;
    buyBtn.dataset.id = p.id || p.code;
    buyBtn.disabled = p.stock <= 0;
    buyBtn.textContent = p.stock <= 0 ? 'Consultar' : '\u{1F4E6} Cotizar';

    const qtyInput = document.getElementById('modal-qty');
    if (qtyInput) {
      qtyInput.value = 1;
      if (p.stock > 0) qtyInput.setAttribute('max', p.stock);
      else qtyInput.removeAttribute('max');
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('quick-modal');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#quick-modal .modal-window')) return;
    if (e.target.closest('#quick-modal')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.querySelectorAll('.modal-close-btn').forEach(b => {
    b.addEventListener('click', closeModal);
  });

  render();
  window.addEventListener('store-synced', function () { render(); });
})();