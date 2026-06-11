(() => {
  const STORAGE_KEY = 'hypercix-admin-products';
  const CATEGORY_KEY = 'hypercix-admin-categories';
  const BRAND_KEY = 'hypercix-admin-brands';
  const THEME_KEY = 'hypercix-admin-theme';
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const defaultCategories = ['General', 'Camaras', 'Seguridad', 'Redes', 'Servicios', 'Alarmas', 'Accesorios'];
  const defaultBrands = ['Sin marca', 'Hikvision', 'Dahua', 'Ezviz', 'Ubiquiti', 'Generica', 'Servicio'];
  const defaultProducts = [
    { id: 'demo-1', code: 'CAM-001', description: 'Camara CCTV domo 2MP', category: 'Camaras', brand: 'Hikvision', price: 180, stock: 12, taxType: 'gravado', image: '', color: '#111827' },
    { id: 'demo-2', code: 'CAM-002', description: 'Camara IP bullet 4MP', category: 'Camaras', brand: 'Dahua', price: 320, stock: 8, taxType: 'gravado', image: '', color: '#1f2937' },
    { id: 'demo-3', code: 'DVR-004', description: 'DVR 8 canales HD', category: 'Seguridad', brand: 'Hikvision', price: 620, stock: 5, taxType: 'gravado', image: '', color: '#b40f2e' },
    { id: 'demo-4', code: 'RED-001', description: 'Cable UTP Cat 6 por metro', category: 'Redes', brand: 'Generica', price: 2.8, stock: 500, taxType: 'gravado', image: '', color: '#2563eb' },
    { id: 'demo-5', code: 'SRV-001', description: 'Instalacion y configuracion tecnica', category: 'Servicios', brand: 'Servicio', price: 150, stock: 99, taxType: 'gravado', image: '', color: '#10b981' },
  ];

  const form = document.getElementById('product-form');
  const editingIdInput = document.getElementById('editing-id');
  const codeInput = document.getElementById('product-code');
  const descriptionInput = document.getElementById('product-description');
  const detailsInput = document.getElementById('product-details');
  const categorySelect = document.getElementById('product-category');
  const brandSelect = document.getElementById('product-brand');
  const priceInput = document.getElementById('product-price');
  const stockInput = document.getElementById('product-stock');
  const taxSelect = document.getElementById('product-tax');
  const imageUrlInput = document.getElementById('product-image-url');
  const addImageUrlButton = document.getElementById('add-image-url-button');
  const imageFileInput = document.getElementById('product-image-file');
  const galleryEl = document.getElementById('image-gallery');
  const submitButton = document.getElementById('submit-product');
  const tableBody = document.getElementById('products-table-body');
  const searchInput = document.getElementById('product-search');
  const globalSearchInput = document.getElementById('global-search');
  const categoryFilter = document.getElementById('category-filter');
  const brandFilter = document.getElementById('brand-filter');
  const csvInput = document.getElementById('csv-input');
  let productImages = [];

  function readJSON(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function colorFromCode(code) {
    const palette = ['#111827', '#b40f2e', '#2563eb', '#10b981', '#7c3aed', '#f59e0b'];
    const total = String(code).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[total % palette.length];
  }

  function normalizeProduct(product, index) {
    const code = product.code || product.sku || `PROD-${String(index + 1).padStart(3, '0')}`;
    const images = (Array.isArray(product.images) ? product.images : []).filter(Boolean);
    if (!images.length && product.image) images.push(product.image);
    return {
      id: product.id || `legacy-${code}-${index}`,
      code,
      description: product.description || product.name || 'Producto sin descripcion',
      details: product.details || product.longDescription || '',
      category: product.category || 'General',
      brand: product.brand || 'Sin marca',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      taxType: product.taxType || product.tax || 'gravado',
      image: product.image || images[0] || '',
      images,
      color: product.color || colorFromCode(code),
    };
  }

  function getProducts() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      writeJSON(STORAGE_KEY, defaultProducts);
    }
    return readJSON(STORAGE_KEY, []).map(normalizeProduct);
  }

  function saveProducts(products) {
    writeJSON(STORAGE_KEY, products.map(normalizeProduct));
  }

  function extractNames(items) {
    return items.map(item => typeof item === 'string' ? item : (item.name || ''));
  }

  function getOptions(key, defaults) {
    let saved = readJSON(key, []);
    if (key === BRAND_KEY) saved = extractNames(saved);
    const productValues = getProducts().map((product) => key === CATEGORY_KEY ? product.category : product.brand);
    return [...new Set([...defaults, ...saved, ...productValues].filter(Boolean))];
  }

  function saveOption(key, value) {
    let current = readJSON(key, []);
    if (key === BRAND_KEY) {
      const names = extractNames(current);
      if (!names.includes(value)) {
        current.push({ id: `brand-${Date.now()}`, name: value, description: '', image: '', color: '' });
        writeJSON(key, current);
      }
    } else {
      if (!current.includes(value)) {
        writeJSON(key, [...current, value]);
      }
    }
  }

  function fillSelect(select, options, allLabel) {
    select.innerHTML = '';
    if (allLabel) {
      select.append(new Option(allLabel, ''));
    }
    options.forEach((option) => select.append(new Option(option, option)));
  }

  function refreshOptions() {
    fillSelect(categorySelect, getOptions(CATEGORY_KEY, defaultCategories));
    fillSelect(brandSelect, getOptions(BRAND_KEY, defaultBrands));
    fillSelect(categoryFilter, getOptions(CATEGORY_KEY, defaultCategories), 'Todas las categorias');
    fillSelect(brandFilter, getOptions(BRAND_KEY, defaultBrands), 'Todas las marcas');
  }

  function formatMoney(value) {
    return `S/ ${Number(value || 0).toFixed(2)}`;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function productImage(product) {
    const count = product.images ? product.images.length : (product.image ? 1 : 0);
    const badge = count > 1 ? `<span class="thumb-count">${count}</span>` : '';

    if (product.image) {
      return `<div class="product-thumb-wrap">${badge}<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.description)}" /></div>`;
    }

    return `
      <div class="product-thumb-wrap">${badge}<div class="product-thumb generated" style="--thumb-color: ${escapeHTML(product.color || colorFromCode(product.code))}">
        <span></span>
        <strong>${escapeHTML(product.code)}</strong>
      </div></div>`;
  }

  function renderGallery() {
    if (!productImages.length) {
      galleryEl.classList.remove('has-images');
      galleryEl.innerHTML = 'Sin imagenes';
      return;
    }

    galleryEl.classList.add('has-images');
    galleryEl.innerHTML = productImages.map((src, index) => `
      <div class="gallery-item">
        <img src="${escapeHTML(src)}" alt="Imagen ${index + 1}" />
        ${index === 0
          ? '<span class="gallery-cover-badge">Portada</span>'
          : `<button type="button" class="gallery-cover-button" data-index="${index}" title="Usar como portada">&#9733;</button>`}
        <button type="button" class="gallery-remove" data-index="${index}" title="Quitar imagen">&times;</button>
      </div>`).join('');
  }

  function filteredProducts() {
    const query = (searchInput.value || globalSearchInput.value || '').toLowerCase().trim();
    const category = categoryFilter.value;
    const brand = brandFilter.value;

    return getProducts().filter((product) => {
      const text = `${product.code} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
      return (!query || text.includes(query)) &&
        (!category || product.category === category) &&
        (!brand || product.brand === brand);
    });
  }

  function renderProducts() {
    const products = filteredProducts();
    if (!products.length) {
      tableBody.innerHTML = '<tr><td colspan="7" class="empty-row">No hay productos para mostrar.</td></tr>';
      return;
    }

    tableBody.innerHTML = products.map((product) => `
      <tr>
        <td>${productImage(product)}</td>
        <td><strong>${escapeHTML(product.code)}</strong></td>
        <td>
          <div class="product-description">${escapeHTML(product.description)}</div>
          <small>${escapeHTML(product.category)}</small>
        </td>
        <td>${escapeHTML(product.brand)}</td>
        <td>${formatMoney(product.price)}</td>
        <td><strong class="${product.stock <= 5 ? 'low-stock' : ''}">${product.stock}</strong></td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn-secondary btn-small" data-action="edit" data-id="${escapeHTML(product.id)}">Editar</button>
            <button type="button" class="btn-danger btn-small" data-action="delete" data-id="${escapeHTML(product.id)}">Eliminar</button>
          </div>
        </td>
      </tr>`).join('');
  }

  function resetForm() {
    form.reset();
    editingIdInput.value = '';
    productImages = [];
    stockInput.value = 0;
    submitButton.textContent = 'Guardar producto';
    document.getElementById('product-form-title').textContent = 'Nuevo producto';
    renderGallery();
  }

  function fillForm(product) {
    editingIdInput.value = product.id;
    codeInput.value = product.code;
    descriptionInput.value = product.description;
    detailsInput.value = product.details || '';
    categorySelect.value = product.category;
    brandSelect.value = product.brand;
    priceInput.value = product.price;
    stockInput.value = product.stock;
    taxSelect.value = product.taxType;

    productImages = product.images && product.images.length
      ? product.images.slice()
      : (product.image ? [product.image] : []);
    renderGallery();

    submitButton.textContent = 'Actualizar producto';
    document.getElementById('product-form-title').textContent = 'Editar producto';
    codeInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addOption(type) {
    const isCategory = type === 'category';
    const value = prompt(isCategory ? 'Nueva categoria' : 'Nueva marca');
    const cleanValue = value ? value.trim() : '';
    if (!cleanValue) return;

    saveOption(isCategory ? CATEGORY_KEY : BRAND_KEY, cleanValue);
    refreshOptions();
    (isCategory ? categorySelect : brandSelect).value = cleanValue;
  }

  function detectDelimiter(line) {
    const candidates = [',', ';', '\t'];
    return candidates
      .map((delimiter) => ({ delimiter, count: line.split(delimiter).length }))
      .sort((a, b) => b.count - a.count)[0].delimiter;
  }

  function parseCSVLine(line, delimiter) {
    const values = [];
    let current = '';
    let quoted = false;

    for (const char of line) {
      if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values.map((value) => value.replace(/^"|"$/g, ''));
  }

  function importCSV(text) {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return 0;

    const delimiter = detectDelimiter(lines[0]);
    const headers = parseCSVLine(lines[0], delimiter).map((header) => header.toLowerCase().trim());
    const products = getProducts();

    lines.slice(1).forEach((line, index) => {
      const row = parseCSVLine(line, delimiter);
      const field = (...names) => {
        const foundIndex = names.map((name) => headers.indexOf(name)).find((position) => position >= 0);
        return foundIndex >= 0 ? row[foundIndex] : '';
      };

      const code = field('codigo', 'c\u00f3digo', 'code', 'sku') || row[0] || `CSV-${index + 1}`;
      const product = normalizeProduct({
        id: `csv-${Date.now()}-${index}`,
        code,
        description: field('descripcion', 'descripci\u00f3n', 'description', 'nombre', 'name') || row[1] || 'Producto importado',
        details: field('detalles', 'descripcion larga', 'descripci\u00f3n larga', 'details') || '',
        category: field('categoria', 'categor\u00eda', 'category') || row[2] || 'General',
        brand: field('marca', 'brand') || row[3] || 'Sin marca',
        price: Number(field('precio', 'price') || row[4] || 0),
        stock: Number(field('stock') || row[5] || 0),
        taxType: field('igv', 'tipo igv', 'tax') || 'gravado',
        image: field('imagen', 'image', 'url') || '',
        color: colorFromCode(code),
      }, products.length + index);

      saveOption(CATEGORY_KEY, product.category);
      saveOption(BRAND_KEY, product.brand);
      products.push(product);
    });

    saveProducts(products);
    return lines.length - 1;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const product = normalizeProduct({
      id: editingIdInput.value || `${Date.now()}`,
      code: codeInput.value.trim(),
      description: descriptionInput.value.trim(),
      details: detailsInput.value.trim(),
      category: categorySelect.value,
      brand: brandSelect.value,
      price: Number(priceInput.value),
      stock: Number(stockInput.value),
      taxType: taxSelect.value,
      images: productImages.slice(),
      image: productImages[0] || '',
      color: colorFromCode(codeInput.value.trim()),
    }, 0);

    const products = getProducts();
    const existingIndex = products.findIndex((item) => item.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }

    saveOption(CATEGORY_KEY, product.category);
    saveOption(BRAND_KEY, product.brand);
    saveProducts(products);
    resetForm();
    refreshOptions();
    renderProducts();
  });

  function addImageFromUrl() {
    const value = imageUrlInput.value.trim();
    if (!value) return;
    productImages.push(value);
    imageUrlInput.value = '';
    renderGallery();
  }

  addImageUrlButton.addEventListener('click', addImageFromUrl);
  imageUrlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addImageFromUrl();
    }
  });

  imageFileInput.addEventListener('change', () => {
    const files = Array.from(imageFileInput.files || []);
    if (!files.length) return;

    const oversize = files.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversize) {
      alert(`La imagen "${oversize.name}" supera el maximo de 5MB.`);
      imageFileInput.value = '';
      return;
    }

    Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', reject);
      reader.readAsDataURL(file);
    }))).then((results) => {
      productImages.push(...results);
      renderGallery();
      imageFileInput.value = '';
    });
  });

  galleryEl.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.gallery-remove');
    const coverButton = event.target.closest('.gallery-cover-button');

    if (removeButton) {
      productImages.splice(Number(removeButton.dataset.index), 1);
      renderGallery();
    } else if (coverButton) {
      const index = Number(coverButton.dataset.index);
      const [image] = productImages.splice(index, 1);
      productImages.unshift(image);
      renderGallery();
    }
  });

  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const products = getProducts();
    const product = products.find((item) => item.id === button.dataset.id);
    if (!product) return;

    if (button.dataset.action === 'edit') {
      fillForm(product);
    }

    if (button.dataset.action === 'delete' && confirm(`Eliminar ${product.code}?`)) {
      saveProducts(products.filter((item) => item.id !== product.id));
      refreshOptions();
      renderProducts();
    }
  });

  document.getElementById('new-product-button').addEventListener('click', () => {
    resetForm();
    codeInput.focus();
  });

  document.getElementById('clear-form').addEventListener('click', resetForm);
  document.getElementById('add-category-button').addEventListener('click', () => addOption('category'));
  document.getElementById('add-brand-button').addEventListener('click', () => addOption('brand'));

  document.getElementById('import-csv-button').addEventListener('click', () => csvInput.click());
  csvInput.addEventListener('change', () => {
    const file = csvInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imported = importCSV(reader.result);
      refreshOptions();
      renderProducts();
      alert(`${imported} producto(s) importado(s).`);
      csvInput.value = '';
    });
    reader.readAsText(file);
  });

  [searchInput, globalSearchInput, categoryFilter, brandFilter].forEach((control) => {
    control.addEventListener('input', renderProducts);
    control.addEventListener('change', renderProducts);
  });

  if (localStorage.getItem(THEME_KEY) === 'light') {
    document.body.classList.add('light-admin');
  }

  refreshOptions();
  resetForm();
  renderProducts();
})();
