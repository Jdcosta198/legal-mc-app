# Legal Martínez & Cortés · App del despacho (versión 2)

App privada para expedientes, documentos PDF, agenda de plazos y honorarios del Arancel.
Funciona **en la web, como app instalable en iPhone y Android, y como app nativa** (Android .apk / iPhone por TestFlight).
Usa la **misma base de datos de Supabase que la versión publicada**: no se pierde nada.

## Qué cambia respecto de la versión publicada

| | Antes | Ahora |
|---|---|---|
| Imagen de la Dama de la Justicia | Acercamiento lento (zoom) | **Movimiento real**: niebla que fluye, balanza que se mece, destellos dorados, partículas y luz sobre el mármol; responde a la inclinación del teléfono |
| Descarga | Botón con instrucciones en texto | Botón **Descargar la app** con guía animada para iPhone, Android y PC, QR, perfil para iPhone, pantallas de arranque, aviso si se abre desde Facebook/Instagram |
| Apps nativas | — | Proyecto **Android** (.apk y .aab para Google Play) e **iPhone** (TestFlight/App Store) con compilación automática |
| Inicio | — | Resumen del día: plazos vencidos, próximos 7 días, PDF recientes, accesos rápidos |
| Agenda | Lista simple | Agrupada por **vencidos / hoy / 7 días / más adelante**, exportación al calendario con avisos, marcar como hecho* |
| Expedientes | Título, referencia, estado | Ficha con PDF y plazos, filtro activos/cerrados, **cliente, materia y notas*** |
| Documentos | Solo descargar | **Ver sin descargar**, búsqueda, barra de progreso, arrastrar y soltar |
| Calculadora | Referencias básicas; timbres a mano | **Calculadora Jurídica CR completa**: 160 actuaciones, 280 trabajos por materia, timbres e impuestos notariales, mínimo del Arancel, proforma A4, WhatsApp, historial |
| Plazos | Cálculo a mano | **Calculadora de vencimientos**: días hábiles de Costa Rica, feriados (incluye Semana Santa calculada), notificación electrónica (art. 38 Ley 8687), cierres opcionales, fecha recomendada y paso directo a la agenda |
| Búsqueda | Por sección | **Búsqueda global** en expedientes, clientes, PDF y plazos (sin importar tildes) |
| Documentos en papel | — | **Escanear con la cámara** varias páginas y convertirlas en PDF dentro del teléfono |
| Seguridad | Solo contraseña | **Bloqueo con Face ID, Touch ID o huella** al abrir la app y tras 5 minutos sin usarla |
| Sesión | Se cerraba al cerrar el navegador | Opción **Mantener la sesión** (activada por defecto en la app instalada) |
| Sincronización | Redibujaba todo cada 20 s | Solo cuando hay cambios: no se pierde lo que se está escribiendo |

\* Requiere ejecutar una vez `db/mejoras-despacho.sql`. Sin ese paso todo lo demás funciona igual.

## 1. Publicar la web (Vercel)

La forma más simple y automática: **GitHub + Vercel**.

1. Subí esta carpeta a un repositorio privado de GitHub (por ejemplo `legal-mc-app`).
2. En Vercel, abrí el proyecto **bufete-martinez-legal-pwa** → *Settings → Git → Connect Git Repository* y elegí ese repositorio.
3. *Settings → General*: **Framework Preset: Other**, **Root Directory: `./`**, sin comando de compilación.
4. Cada cambio que se suba a GitHub se publica solo en `https://bufete-martinez-legal-pwa.vercel.app`.

## 2. Mejora opcional de la base de datos

Supabase → proyecto `ebjpgzgymopbnpzevwbm` → **SQL Editor** → pegá y ejecutá `db/mejoras-despacho.sql`.
Activa: plazos "hechos", cliente/materia/notas en expedientes y cotizaciones compartidas en la nube.
Probado en PostgreSQL 16 (`tests/sql/test_mejoras.py`, 16 pruebas de permisos).

## 3. Instalar en los teléfonos

**iPhone / iPad:** abrir la web en **Safari** → *Descargar la app* → seguir la guía (Compartir → Agregar a pantalla de inicio).
Alternativa: *¿Preferís un archivo de instalación?* → perfil `Legal-MC.mobileconfig` (Ajustes → Perfil descargado → Instalar).

**Android:** abrir la web en **Chrome** → *Descargar la app* → *Instalar*. Chrome crea una app real en el cajón de aplicaciones.
O instalar el archivo **Legal-MC.apk** (ver punto 4).

**Computadora:** Chrome o Edge → *Descargar la app* (o el ícono de instalar en la barra de direcciones).

## 4. Apps nativas (carpeta `native/`)

Con el repositorio en GitHub, las compilaciones se hacen solas en **Actions**:

- **App Android** (`.github/workflows/android.yml`): en cada cambio genera **Legal-MC.apk** (para instalar directo) y **Legal-MC-GooglePlay.aab** (para Google Play) en *Releases*.
  Para que el teléfono acepte las actualizaciones, cargá una vez estos secretos en GitHub → *Settings → Secrets and variables → Actions*:
  `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (= `legalmc`), `ANDROID_KEY_PASSWORD`.
  La llave de firma se entrega aparte: **guardala en un lugar seguro y nunca la subas al repositorio**; sin ella no se pueden publicar actualizaciones en Google Play.
- **App iPhone** (`.github/workflows/ios.yml`): verifica que compile en una Mac de GitHub. Con una cuenta de **Apple Developer** (US$99/año) y estos secretos sube cada versión a **TestFlight**:
  `APPLE_CERTIFICATE_P12_BASE64`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_PROVISIONING_PROFILE_BASE64`, `APPLE_TEAM_ID`, `APP_STORE_CONNECT_API_KEY_P8`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`.

Compilar a mano (opcional): `cd native && npm ci && npm run sync && npx cap open android` (Android Studio) o `npx cap open ios` (Xcode en Mac).

## Consultas al Registro Nacional (sección «Registro»)

Las 39 consultas gratuitas de **rnpdigital.com** (propiedades, vehículos y otros muebles, planos, sociedades, marcas y patentes),
hechas con el **usuario de rnpdigital de cada profesional**. El resultado se guarda como PDF en el expediente.

- **App de Android:** el Registro se abre dentro de la app. El asistente (`registro-bot.js`) entra a la consulta, la llena,
  toca «Consultar», espera el resultado y lo devuelve; la app arma el PDF y lo sube al expediente elegido.
- **Computadora / iPhone (web):** el Registro se abre en otra ventana y el asistente se activa con el favorito
  «⚖ Legal M&C · Registro» (rnpdigital.com no permite cargar scripts de otros sitios; el favorito recibe el código de la app).
- **Contraseña:** se escribe solo en la página del Registro. La app no la pide, no la guarda y no la envía a ningún servidor.
- **Protección de la cuenta:** el Registro bloquea la cuenta con más de 10 consultas en 2 minutos; el asistente permite 8
  y cuenta también los clics hechos a mano. Nunca toca «Comprar».
- Las consultas se hacen desde el teléfono o la computadora de la persona (el Registro rechaza servidores externos).

Archivos: `registro-catalogo.js` (consultas, lectura de números y validación), `registro-pdf.js` (PDF),
`registro/bot.js` (asistente), `registro-ui.js` + `registro.css` (pantalla), `registro-puente.*` (favorito sin app al lado).
`registro-bot.js` se genera con `node scripts/build-bot.mjs`.

Pruebas: `npm test` (catálogo y PDF), `python3 tests/registro_bot_test.py` (asistente contra páginas simuladas del Registro,
incluido Prototype 1.6 que usa el sitio) y la sección «Registro» de `tests/e2e_despacho.py` (flujo web completo hasta el PDF en el expediente).

## 5. Pruebas

```bash
npm test                         # calculadora (4.800 cálculos idénticos a la original) y plazos procesales
python3 tests/e2e_despacho.py    # 83 comprobaciones en navegador (portada, descarga, despacho, plazos, escáner, bloqueo)
python3 tests/sql/test_mejoras.py  # 16 pruebas de permisos de la mejora de base de datos (PostgreSQL)
```

## Estructura

```
index.html        Portada pública con descarga para iPhone, Android y PC
app.html, app.js  Despacho privado (Supabase)
living-art.js     Imagen con movimiento real (WebGL)
install.js/.css   Descarga e instalación por dispositivo
native.js         Puente con las apps nativas (PDF, compartir, botón atrás)
calc/             Calculadora jurídica (motor probado + interfaz)
db/               Mejora opcional de la base de datos
native/           Proyectos Android e iOS (Capacitor 7)
splash/, icon-*   Pantallas de arranque e íconos
```
