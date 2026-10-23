# EM Distribuidora · Catálogo y sistema de ventas

Funciona en GitHub Pages, gratis y sin servidor. El panel guarda cada cambio en tu
repositorio de GitHub. Ventas, compras y configuración se guardan **cifradas**.

## Qué incluye

**Catálogo público** (`index.html`)
- Búsqueda, filtro por categoría, franja de marcas y orden por precio o nombre.
- Cada producto muestra contenido (1 L, 5 L, 500 g…), unidad de venta, **precio mayorista**
  (desde X unidades), variantes con stock (aromas, colores, fragancias) y cuotas.
- El cliente elige variante y cantidad, y consulta por WhatsApp con todo el detalle.

**Panel** (`admin.html` o `/admin`)
- **Vender:** caja rápida con lector de código de barras o cámara, búsqueda, vuelto,
  efectivo o transferencia (banco, comprobante y quién envió), ticket o factura electrónica.
  El **precio mayorista se aplica solo** cuando la cantidad llega al mínimo.
- **Productos:** contenido, unidad de venta, precio, precio mayorista, variantes con stock,
  código de barras, foto y cuotas.
- **Ventas:** historial con paginación, PDF, WhatsApp, correo, anular, planilla CSV.
- **Compras:** a proveedores; suman stock.
- **Marcas** y **Configuración:** datos de la tienda, facturación, FactuFlex (SIFEN),
  envío automático por correo (EmailJS) y usuario y contraseña.

## Publicarlo (una sola vez)

### 1. Crear el repositorio
1. En github.com: **+ → New repository**.
2. Nombre: `em-distribuidora` · **Public** · **Create repository**.
3. **uploading an existing file** → arrastrá **todo el contenido** de esta carpeta
   (no la carpeta en sí) → **Commit changes**.

### 2. Activar GitHub Pages
**Settings → Pages** → Branch **main** y **/ (root)** → **Save**.
En 1 o 2 minutos: `https://TU-USUARIO.github.io/em-distribuidora/`

### 3. Crear el token (la llave para guardar)
1. Abrí https://github.com/settings/personal-access-tokens/new
2. *Token name*: `panel em` · *Expiration*: la más larga posible.
3. *Repository access*: **Only select repositories** → `em-distribuidora`.
4. **+ Add permissions** → **Contents** → **Read and write**.
5. **Generate token** y copialo (empieza con `github_pat_`).

### 4. Activar el panel
1. Abrí `https://TU-USUARIO.github.io/em-distribuidora/conectar.html`
2. Usuario actual `admin` · contraseña actual `admin123`.
3. Elegí tu **usuario y contraseña definitivos** (mínimo 8 caracteres).
4. Usuario de GitHub, repositorio `em-distribuidora` y el token → **Activar**.
5. Entrá a `/admin` con tus datos nuevos.

## Primeros pasos en el panel
1. **Configuración:** nombre, logo, WhatsApp y datos para facturación.
2. **Marcas:** cargá las marcas que distribuís, con logo.
3. **Productos:** cargá cada presentación como un producto propio
   (por ejemplo "Lavandina 1 L" y "Lavandina 5 L"), cada una con su código de barras.

## Usar con Git desde tu PC
Como el panel guarda en GitHub, antes de subir cambios hacé siempre:

    git add .
    git commit -m "cambios"
    git pull --rebase
    git push

## Probar en tu computadora
Dentro de esta carpeta: `python -m http.server 8000` y abrí `http://localhost:8000`.
Si el panel ya está activado, lo que guardes desde tu PC **se guarda de verdad**.

## Si olvidás la contraseña
Volvé a subir `data/acceso.json` de este zip (reemplazando el que está) y repetí el paso 4.
Los productos no se pierden, pero las ventas y compras cifradas quedan ilegibles,
porque necesitan la llave anterior. Guardá tu contraseña en un lugar seguro.
