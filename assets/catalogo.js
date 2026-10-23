(async function () {
  'use strict';
  var esc = Z.esc, money = Z.money, lower = Z.lower;
  var $ = function (id) { return document.getElementById(id); };

  var data;
  try {
    var r = await fetch('data/catalogo.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
  } catch (e) {
    $('storeName').textContent = 'Catálogo';
    $('results').innerHTML = '<div class="empty"><p>No se pudo cargar el catálogo. Revisá tu conexión y recargá la página.</p></div>';
    return;
  }

  var store = Object.assign({ store_name: 'EM Distribuidora', tagline: '', whatsapp: '', address: '', logo: '' }, data.store || {});
  var brands = data.brands || [];
  var visible = (data.products || []).filter(function (p) { return p.visible; });
  var wa = String(store.whatsapp || '').replace(/\D/g, '');

  /* ----- Encabezado y pie ----- */
  document.title = store.store_name + ' · Catálogo';
  $('storeName').textContent = store.store_name;
  $('storeTag').textContent = store.tagline;
  var logoBox = $('storeLogo');
  if (store.logo) {
    var img = document.createElement('img');
    img.className = 'logo'; img.src = store.logo; img.alt = '';
    logoBox.replaceWith(img);
  } else {
    logoBox.textContent = String(store.store_name).charAt(0).toUpperCase();
  }
  $('foot').innerHTML = '<p><strong>' + esc(store.store_name) + '</strong>, catálogo en línea.</p>' +
    (store.address ? '<p>' + esc(store.address) + '</p>' : '');

  /* ----- Estado de filtros (se guarda en la dirección) ----- */
  var params = new URLSearchParams(location.search);
  var st = {
    q: params.get('q') || '', cat: params.get('cat') || '',
    orden: params.get('orden') || 'recientes', marca: params.get('marca') || ''
  };

  /* ----- Opciones de filtros ----- */
  var cats = {}, gens = {}, sizes = {};
  visible.forEach(function (p) {
    if (p.category) cats[p.category] = 1;
    (p.sizes || []).forEach(function (s) { if (+s.stock > 0) sizes[String(s.size)] = 1; });
  });
  function fill(sel, values, label) {
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = label ? label(v) : v;
      sel.appendChild(o);
    });
  }
  fill($('fCat'), Object.keys(cats).sort(Z.natCmp));

  $('fQ').value = st.q; $('fCat').value = st.cat; $('fOrden').value = st.orden;

  /* ----- Franja de marcas ----- */
  function renderBrands() {
    var strip = $('brandStrip');
    if (!brands.length) { strip.hidden = true; return; }
    strip.hidden = false;
    strip.innerHTML = brands.map(function (b) {
      var on = lower(b.name) === lower(st.marca);
      return '<button type="button" class="brand-tile' + (on ? ' is-on' : '') + '" data-brand="' + esc(b.name) + '"' +
        ' aria-pressed="' + on + '" title="' + (on ? 'Ver todas las marcas' : 'Ver solo ' + esc(b.name)) + '">' +
        (b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" loading="lazy">'
                : '<span class="brand-tile-txt">' + esc(b.name) + '</span>') +
        '</button>';
    }).join('');
  }

  /* ----- Tarjetas ----- */
  function card(p) {
    var stock = Z.stockOf(p), price = +p.price || 0, b = p.brand ? Z.brandByName(brands, p.brand) : null;
    var h = '<article class="card"><div class="card-img">';
    h += p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span class="noimg">' + Z.shoe(72) + '</span>';
    if (stock <= 0) h += '<span class="ribbon">Agotado</span>';
    h += '</div><div class="card-body"><div class="badges">';
    if (p.category) h += '<span class="badge">' + esc(p.category) + '</span>';
    if (p.contenido) h += '<span class="badge badge-soft">' + esc(p.contenido) + '</span>';
    h += '</div>';
    if (p.brand) {
      h += '<p class="card-brand">' + (b && b.logo ? '<img src="' + esc(b.logo) + '" alt="" loading="lazy">' : '') + esc(p.brand) + '</p>';
    }
    h += '<h2 class="card-title">' + esc(p.name) + '</h2>';
    var meta = [];
    if (p.sku) meta.push('SKU: ' + esc(p.sku));
    if (p.code) meta.push('Cód.: ' + esc(p.code));
    if (meta.length) h += '<p class="card-meta">' + meta.join(' · ') + '</p>';
    h += '<p class="price">' + money(price) + (p.unidad && p.unidad !== 'Unidad' ? ' <small class="per">por ' + esc(lower(p.unidad)) + '</small>' : '') + '</p>';
    if (p.price_may && p.min_may) h += '<p class="may">Por mayor: <strong>' + money(p.price_may) + '</strong> desde ' + esc(p.min_may) + ' u.</p>';
    h += '<p class="stock' + (stock <= 0 ? ' stock-out' : '') + '">' + (stock > 0 ? 'Stock: ' + stock : 'Sin stock por ahora') + '</p>';
    if (p.colors) h += '<p class="colors">Colores: ' + esc(p.colors) + '</p>';
    if (p.description) h += '<p class="desc">' + esc(p.description) + '</p>';
    if (p.sizes && p.sizes.length) {
      h += '<fieldset class="sizes"><legend>Elegí la variante</legend><div class="size-list">';
      p.sizes.forEach(function (s) {
        var out = +s.stock <= 0, chk = false;
        h += '<label class="size' + (out ? ' size-out' : '') + '" title="' + (out ? 'Sin stock' : esc(s.stock) + ' disponible(s)') + '">' +
          '<input type="radio" name="talle-' + esc(p.id) + '" value="' + esc(s.size) + '"' + (out ? ' disabled' : '') + (chk ? ' checked' : '') + '>' +
          '<span>' + esc(s.size) + '</span></label>';
      });
      h += '</div></fieldset>';
    }
    if (p.installments && p.installments.length) {
      h += '<label class="pay"><span>Cuotas disponibles</span><select class="js-cuota">';
      p.installments.forEach(function (i) {
        var l = Z.instLabel(price, +i.n, +i.amount);
        h += '<option value="' + esc(l) + '">' + esc(l) + '</option>';
      });
      var c = 'Al contado: ' + money(price);
      h += '<option value="' + esc(c) + '">' + esc(c) + '</option></select></label>';
    }
    h += '<label class="qty-row"><span>Cantidad</span><input class="qty-want" type="number" min="1" value="1" inputmode="numeric" aria-label="Cantidad"></label>';
    h += '<a class="btn btn-wa js-wa" href="#" data-name="' + esc(p.name + (p.contenido ? ' ' + p.contenido : '')) + '" data-sku="' + esc(p.sku || '') + '" data-price="' + esc(money(price)) + '">' +
      Z.WA_ICON + ' Consultar por WhatsApp</a>';
    return h + '</div></article>';
  }

  function render() {
    var words = st.q ? lower(st.q).split(/\s+/).filter(Boolean) : [];
    var list = visible.filter(function (p) {
      if (st.marca && lower(p.brand) !== lower(st.marca)) return false;
      if (words.length) {
        var hay = lower([p.name, p.sku, p.code, p.brand, p.colors, p.category].join(' '));
        for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) === -1) return false;
      }
      if (st.cat && p.category !== st.cat) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (st.orden === 'precio_asc') return (a.price || 0) - (b.price || 0);
      if (st.orden === 'precio_desc') return (b.price || 0) - (a.price || 0);
      if (st.orden === 'nombre') return Z.natCmp(a.name, b.name);
      return (b.created_at || 0) - (a.created_at || 0);
    });

    var filtering = st.q || st.cat || st.marca;
    $('count').innerHTML = '<strong>' + list.length + '</strong> ' + (list.length === 1 ? 'producto' : 'productos') +
      (st.marca ? ' de <strong>' + esc(st.marca) + '</strong>' : '') +
      (filtering ? ' <a href="#" id="clearFilters">Quitar filtros</a>' : '');

    if (!list.length) {
      $('results').innerHTML = '<div class="empty"><div class="empty-ico">' + Z.shoe(56) + '</div>' +
        (filtering ? '<p>No hay productos con esos filtros. Probá con otra categoría o marca.</p>' +
                     '<button type="button" class="btn btn-outline" id="clearFilters2">Ver todo el catálogo</button>'
                   : '<p>Todavía no hay productos cargados.</p>') + '</div>';
    } else {
      $('results').innerHTML = '<div class="grid">' + list.map(card).join('') + '</div>';
    }
    renderBrands();

    var qs = new URLSearchParams();
    Object.keys(st).forEach(function (k) { if (st[k] && !(k === 'orden' && st[k] === 'recientes')) qs.set(k, st[k]); });
    history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : ''));
  }

  function readForm() {
    st.q = $('fQ').value.trim(); st.cat = $('fCat').value;
    st.orden = $('fOrden').value;
    render();
  }
  function clearAll() {
    st.q = st.cat = st.marca = '';
    $('fQ').value = ''; $('fCat').value = '';
    render();
  }

  $('filters').addEventListener('submit', function (e) { e.preventDefault(); readForm(); });
  ['fCat', 'fOrden'].forEach(function (id) { $(id).addEventListener('change', readForm); });
  var t;
  $('fQ').addEventListener('input', function () { clearTimeout(t); t = setTimeout(readForm, 250); });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-brand]');
    if (b) {
      st.marca = lower(b.dataset.brand) === lower(st.marca) ? '' : b.dataset.brand;
      render();
      return;
    }
    if (e.target.closest('#clearFilters, #clearFilters2')) { e.preventDefault(); clearAll(); return; }

    var btn = e.target.closest('.js-wa');
    if (!btn) return;
    e.preventDefault();
    if (!wa) { alert('La tienda todavía no cargó su número de WhatsApp.'); return; }
    var c = btn.closest('.card');
    var lines = ['¡Hola! Quiero consultar por este producto:', '• ' + btn.dataset.name];
    if (c.querySelector('.qty-want')) lines.push('• Cantidad: ' + (c.querySelector('.qty-want').value || 1));
    if (btn.dataset.sku) lines.push('• SKU: ' + btn.dataset.sku);
    lines.push('• Precio: ' + btn.dataset.price);
    if (c.querySelector('.sizes')) {
      var sel = c.querySelector('.sizes input:checked');
      lines.push('• Variante: ' + (sel ? sel.value : 'a consultar'));
    }
    var cu = c.querySelector('.js-cuota');
    if (cu) lines.push('• Forma de pago: ' + cu.value);
    window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  render();
})();
