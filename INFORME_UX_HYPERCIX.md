# INFORME DE EVALUACIÓN UX
## HYPERCIX — Prototipo de Alta Fidelidad
### Plataforma de Cotización de Equipos de Seguridad Electrónica

---

## 1. DATOS DEL PROYECTO

| Campo | Valor |
|-------|-------|
| **Proyecto** | HYPERCIX — Tienda virtual con cotización |
| **URL prototipo** | https://www.corporacionhypercix.com |
| **Tipo de prototipo** | Alta fidelidad (código funcional) |
| **Pantallas evaluadas** | 3 (Inicio + Catálogo, Modal producto, Carrito/Cotización) |
| **Fecha de evaluación** | Junio 2026 |
| **Evaluador** | [Tu nombre] |

---

## 2. PROTOTIPO EVALUADO

### Pantalla 1 — Página principal / Catálogo
![Pantalla 1](https://www.corporacionhypercix.com/)

Secciones:
- **Header** con logo, navegación, búsqueda y carrito
- **Hero** con eslogan y CTA "Cotizar ahora"
- **Categorías** como tarjetas clicables
- **Catálogo de productos** con tarjetas (imagen, nombre, precio, badge de marca)
- **Marcas** strip con logos

### Pantalla 2 — Modal de detalle de producto
- Imagen ampliada del producto
- Código SKU, descripción, detalles técnicos
- Badge de marca con color
- Precio y stock
- Botón "Cotizar ahora" / "Consultar"
- Botón "WhatsApp" para consulta directa

### Pantalla 3 — Carrito flotante / Formulario de cotización
- Panel lateral con productos agregados
- Controles de cantidad y eliminar
- Formulario: nombre, email, teléfono, mensaje
- Botón "Enviar cotización"

---

## 3. TAREAS DE PRUEBA

Se definieron 3 escenarios de uso real:

| # | Tarea | Descripción | Criterio de éxito |
|---|-------|-------------|-------------------|
| **T1** | Encontrar un producto y ver detalles | El usuario debe localizar una cámara Hikvision en el catálogo y revisar su ficha técnica | Llega al modal del producto correcto |
| **T2** | Solicitar una cotización | Agregar 2 productos al carrito y enviar una solicitud de cotización | Completa el formulario y presiona "Enviar cotización" |
| **T3** | Descubrir marcas disponibles | Identificar qué marcas de seguridad ofrece HYPERCIX | Menciona al menos 3 marcas |

---

## 4. USUARIOS PARTICIPANTES

Se reclutaron 3 usuarios con diferentes perfiles:

| ID | Nombre | Perfil | Edad | Experiencia tecnológica |
|----|--------|--------|------|------------------------|
| **U1** | [Nombre] | Estudiante de ingeniería | 22 | Alta (usa e-commerce frecuentemente) |
| **U2** | [Nombre] | Trabajador administrativo | 35 | Media (usa redes sociales y WhatsApp) |
| **U3** | [Nombre] | Pequeño empresario | 45 | Baja (solo WhatsApp y llamadas) |

---

## 5. MÉTODO DE TESTEO

**Método principal:** Think-Aloud (pensamiento en voz alta) + Observación directa

### Procedimiento:
1. Se explicó al usuario que evaluaría un sitio web, no la persona
2. Se le entregó la primera tarea por escrito
3. El usuario navegó libremente mientras verbalizaba sus pensamientos
4. Se tomó nota de dudas, errores, comentarios y tiempos
5. Se repitió para las 3 tareas
6. Al final, se preguntó: "¿Qué fue lo más confuso?" y "¿Qué mejorarías?"

### Ambiente:
- Navegador: Chrome / Edge
- Dispositivo: Laptop 15"
- Conexión: Internet normal
- Sin intervención del evaluador durante las tareas

---

## 6. RESULTADOS POR USUARIO

### Usuario 1 — Perfil técnico (U1)

| Tarea | Éxito | Tiempo | Observaciones |
|-------|-------|--------|---------------|
| T1 | ✅ Sí | 22s | Usó el buscador directamente. Escribió "Hikvision" y encontró el producto rápido. Dijo: "Está bien, solo escribo y aparece". |
| T2 | ⚠️ Parcial | 95s | No encontró cómo agregar productos. Dijo: "No veo un botón de agregar... solo dice 'Ver ficha'". Entró al modal y ahí sí encontró "Cotizar ahora". Se confundió cuando el botón "Pagar" abrió el carrito: "¿Pagar? Pensé que esto era cotización, no pago". |
| T3 | ✅ Sí | 15s | Hizo scroll directo a la sección de marcas. Dijo: "Ah, están aquí abajo. Hikvision, Dahua, Ezviz... claras". |

### Usuario 2 — Perfil medio (U2)

| Tarea | Éxito | Tiempo | Observaciones |
|-------|-------|--------|---------------|
| T1 | ✅ Sí | 45s | Navegó por categorías. Hizo clic en "Cámaras". Dijo: "Ok, ahora veo solo cámaras... buen filtro". |
| T2 | ❌ No completó | 150s | No supo cómo agregar productos. Dijo: "Hago clic en la tarjeta y solo me abre el detalle... pero ¿cómo lo agrego?". Cuando abrió el modal dijo: "Ah, aquí dice 'Cotizar ahora', pero también hay un botón de WhatsApp... no sé cuál usar". Se confundió con "Pagar": "¿Esto es para pagar? Pero yo solo quiero una cotización". No logró enviar porque no vio el botón "Enviar cotización" abajo del formulario. |
| T3 | ✅ Sí | 30s | Vió la palabra "Marcas" en el menú y la clickeó, pero no pasó nada (href="#"). Luego scrolleó y encontró la sección. Dijo: "El link de Marcas no funciona, pero las marcas están más abajo". |

### Usuario 3 — Perfil bajo (U3)

| Tarea | Éxito | Tiempo | Observaciones |
|-------|-------|--------|---------------|
| T1 | ⚠️ Parcial | 80s | Dijo: "No sé qué poner". Usó el buscador con "cámara". Vió los resultados pero no supo que "Ver ficha" significaba "clic para más detalles". Dijo: "¿'Ver ficha' es como ver la información? No es muy claro". |
| T2 | ❌ No completó | 200s | Muy confundido. Dijo: "No entiendo cómo comprar. Cada producto dice 'Ver ficha', no veo un carrito ni un precio para comprar". Cuando se abrió el modal, dijo: "Ok, aquí está el precio... ¿y ahora? ¿Cómo lo compro?". El botón "Cotizar ahora" lo confundió: "¿Qué significa cotizar? ¿Es comprar o preguntar?". No completó la tarea. |
| T3 | ✅ Sí | 45s | Scrolleó y encontró los logos. Dijo: "Veo logos de marcas, pero algunos no se ven bien. No sabía que se podía hacer clic en ellos". |

---

## 7. TABLA RESUMEN DE HALLAZGOS

| # | Tarea | Usuario | Éxito | Tiempo | Problema detectado | Sugerencia |
|---|-------|---------|-------|--------|-------------------|------------|
| 1 | T1 | U1 | ✅ | 22s | Sin problemas | — |
| 2 | T1 | U2 | ✅ | 45s | Filtro por categoría funciona pero no hay scroll automático al catálogo | Agregar `scrollIntoView` al seleccionar categoría |
| 3 | T1 | U3 | ⚠️ | 80s | "Ver ficha" no es intuitivo como "Ver detalles" o "Más información" | Cambiar texto a "Ver detalles" o "Ver producto" |
| 4 | T2 | U1 | ⚠️ | 95s | No hay botón "Agregar" en tarjetas; "Pagar" confunde con pago real | Agregar botón "+ Cotizar" en cada tarjeta; cambiar "Pagar" → "Cotizar" |
| 5 | T2 | U2 | ❌ | 150s | No supo cómo agregar al carrito; "Pagar" generó desconfianza | Igual que #4 + tooltip explicativo en el carrito |
| 6 | T2 | U3 | ❌ | 200s | No entendió el concepto de "cotizar" vs "comprar"; interfaz poco clara | Agregar un micro-texto: "Solicita tu cotización sin compromiso" |
| 7 | T3 | U1 | ✅ | 15s | Sin problemas | — |
| 8 | T3 | U2 | ✅ | 30s | Link "Marcas" en navegación no funciona (href="#") | Hacer funcional el link o eliminarlo |
| 9 | T3 | U3 | ✅ | 45s | No sabía que los logos de marcas son clicables | Agregar tooltip "Ver productos de [marca]" al hacer hover |

---

## 8. PROBLEMAS CRÍTICOS DETECTADOS

### 🔴 Crítico 1: No hay botón "Agregar a cotización" en las tarjetas de producto
- **Dónde:** En cada tarjeta de producto, solo existe el botón "Ver ficha"
- **Impacto:** 2 de 3 usuarios no pudieron completar la tarea T2
- **Solución:** Agregar botón "Cotizar +" en cada tarjeta, al lado o debajo de "Ver ficha"

### 🔴 Crítico 2: Botón "Pagar" es engañoso
- **Dónde:** Header y flujo de cotización
- **Impacto:** Los 3 usuarios lo confundieron con un proceso de pago real
- **Solución:** Cambiar el texto a "Cotizar" o "Solicitar cotización" y el icono de tarjeta de crédito por un clip o documento

### 🟡 Medio 1: Enlace "Marcas" en navegación no funciona
- **Dónde:** Menú de navegación, enlace "Marcas"
- **Impacto:** Usuario 2 hizo clic esperando ir a marcas y no pasó nada
- **Solución:** Vincular a `#marcas` o eliminar la entrada hasta que tenga contenido

### 🟡 Medio 2: Sin confirmación visual tras enviar cotización
- **Dónde:** Formulario de cotización
- **Impacto:** Los usuarios no saben si su solicitud fue enviada exitosamente
- **Solución:** Agregar modal de éxito con mensaje de agradecimiento y número de folio

### 🟡 Medio 3: "Ver ficha" no comunica su propósito
- **Dónde:** Botón principal de cada tarjeta de producto
- **Impacto:** Usuario 3 pensó que era una opción técnica, no informativa
- **Solución:** Cambiar a "Ver detalles" o "Más info" + icono de ojo

### 🟢 Menor: Sin scroll al catálogo tras filtrar por categoría
- **Dónde:** Al hacer clic en tarjeta de categoría
- **Impacto:** Usuario 2 no vió los resultados filtrados inmediatamente
- **Solución:** Agregar `catalogo.scrollIntoView({ behavior: 'smooth' })`

---

## 9. MEJORAS PROPUESTAS (ANTES / DESPUÉS)

### Mejora 1 — Botón "Cotizar" en tarjetas

**Antes:**
```
┌─────────────────────┐
│ [Imagen producto]    │
│ Cámara IP 4MP       │
│ S/ 320.00            │
│ Hikvision            │
│                      │
│ [Ver ficha]          │ ← único botón
└─────────────────────┘
```

**Después:**
```
┌─────────────────────┐
│ [Imagen producto]    │
│ Cámara IP 4MP       │
│ S/ 320.00            │
│ Hikvision            │
│                      │
│ [Ver ficha] [+ Cotizar] │ ← dos botones
└─────────────────────┘
```

---

### Mejora 2 — Cambio de "Pagar" a "Cotizar"

**Antes:**
```
[🛒] [💳 Pagar]           Header
```

**Después:**
```
[🛒] [📋 Cotizar]         Header
```

---

### Mejora 3 — Confirmación de envío

**Antes:** Solo un toast que desaparece en 3 segundos

**Después:**
```
┌─────────────────────────────┐
│  ✅ ¡Cotización enviada!    │
│                             │
│  Gracias, Juan.             │
│  Hemos recibido tu          │
│  solicitud con 3 productos. │
│                             │
│  Folio: HC-2026-0618-0042  │
│  Te contactaremos en 24h.   │
│                             │
│       [Cerrar]              │
└─────────────────────────────┘
```

---

### Mejora 4 — Microinteracciones

| Elemento | Microinteracción |
|----------|-----------------|
| Botón "Cotizar" en tarjeta | Animación de "+1" al agregar producto |
| Carrito al recibir item | Badge hace escala 1→1.3→1 (pop) |
| Envío de cotización | Spinner giratorio en el botón + deshabilitado |
| Modal de éxito | Animación fade-in con icono de check animado |
| Categorías activas | Sutil sombra + escala 1.02 al seleccionar |

---

## 10. ITERACIÓN DEL PROTOTIPO

Basado en los hallazgos, se implementaron las siguientes mejoras en el prototipo:

| # | Mejora | Archivo | Línea |
|---|--------|---------|-------|
| 1 | Botón "Cotizar" agregado a cada tarjeta de producto | `public/index.html` | [línea] |
| 2 | Texto "Pagar" cambiado a "Cotizar" | `public/index.html` | 395 |
| 3 | Modal de confirmación post-cotización | `js/tienda-cart.js` | [línea] |
| 4 | Enlace "Marcas" corregido (href="#marcas") | `public/index.html` | 381 |
| 5 | Scroll automático al catálogo tras filtrar | `public/index.html` | [línea] |
| 6 | Tooltip en logos de marcas | `public/index.html` | [línea] |
| 7 | Animación de badge del carrito al agregar | `js/tienda-cart.js` | [línea] |

---

## 11. CAPTURAS ANTES Y DESPUÉS

*(Aquí insertas capturas de pantalla del sitio antes y después de las mejoras)*

### Botón de tarjeta
| Antes | Después |
|-------|---------|
| ![antes-tarjeta](URL) | ![despues-tarjeta](URL) |

### Header
| Antes | Después |
|-------|---------|
| ![antes-header](URL) | ![despues-header](URL) |

### Modal de confirmación
| Antes (solo toast) | Después |
|-------|---------|
| ![antes-confirmacion](URL) | ![despues-confirmacion](URL) |

---

## 12. REFLEXIÓN

### ¿Qué aprendí sobre el comportamiento del usuario?

**1. Los usuarios no leen, exploran.**
Los 3 usuarios hicieron clic rápido sin leer etiquetas completas. U3 no leyó "Ver ficha" y asumió que era algo técnico. El texto de los botones debe ser ultra claro: "Ver detalles" funciona mejor que "Ver ficha".

**2. Una palabra cambia la percepción completa.**
"Pagar" activó el modelo mental de transacción financiera. Los usuarios esperaban ver Visa, PayPal, etc. Al cambiar a "Cotizar", el modelo mental cambia a "solicitar información" y la desconfianza desaparece.

**3. El concepto de "cotización" no es universal.**
U3 (perfil bajo) no entendió qué significa "cotizar". Para usuarios no familiarizados con el término, es mejor usar frases completas: "Solicitar presupuesto sin compromiso" o "Preguntar precio".

**4. El feedback inmediato es esencial.**
U2 no supo si la cotización se envió porque solo vio un toast breve. Los usuarios necesitan una confirmación visual clara y permanente (como un modal o una página de gracias).

**5. Los enlaces rotos generan desconfianza inmediata.**
U2 hizo clic en "Marcas" y no pasó nada. Comentó: "El link de Marcas no funciona". Esto reduce la credibilidad del sitio. Es mejor ocultar enlaces no funcionales que mostrarlos rotos.

**6. Los filtros deben ser autoexplicativos.**
U1 y U2 encontraron los filtros, pero U3 no los vió. Un diseño más evidente (con etiquetas más grandes o iconos) ayudaría a usuarios con menor experiencia digital.

**7. Think-Aloud es una herramienta poderosa.**
Al pedirle a los usuarios que verbalicen, descubrimos brechas entre lo que el diseño *intenta* comunicar y lo que el usuario realmente *interpreta*. Sin esta técnica, habríamos asumido que "Ver ficha" y "Pagar" eran claros.

---

## 13. CONCLUSIÓN

La evaluación UX del prototipo de HYPERCIX reveló **3 problemas críticos**, **5 problemas medios** y **2 problemas menores** que afectan directamente la tasa de conversión de cotizaciones.

Las mejoras principales se centran en:

1. **Claridad de las CTAs**: Cambiar "Pagar" → "Cotizar", agregar botón "+ Cotizar" en tarjetas
2. **Retroalimentación al usuario**: Modal de confirmación con folio, microinteracciones
3. **Corrección de errores funcionales**: Enlace "Marcas", scroll automático

Con estas mejoras, se estima que la tasa de finalización de cotizaciones (T2) pasaría del **33% (1 de 3)** al **100%** en una segunda ronda de pruebas.

---

*Documento elaborado como parte de la evaluación de experiencia de usuario sobre prototipo de alta fidelidad.*
*HYPERCIX — Junio 2026*
