# CineApp — Prueba Técnica IS

CRUD de gestión de películas con autenticación JWT, desarrollado como prueba técnica de aplicaciones multiplataforma. Corre como web app con Docker y como app Android con Capacitor.

---

## Stack tecnológico

### Backend — .NET Core 10

- **ASP.NET Core 10** — API REST con controllers
- **Entity Framework Core 10 + SQLite** — persistencia de datos con migraciones automáticas al iniciar
- **JWT (JSON Web Tokens)** — autenticación stateless. El token se genera al hacer login y se envía en cada request protegido vía header `Authorization: Bearer <token>`
- **SignalR** — hub WebSocket en `/hubs/movies` que emite eventos `MovieCreated`, `MovieUpdated` y `MovieDeleted` a todos los clientes conectados tras cada mutación. El JWT se acepta vía query param `?access_token=` para el handshake WebSocket (los WebSockets no permiten headers personalizados). La serialización de SignalR está configurada con `JsonStringEnumConverter` para que los enums lleguen como strings
- **CORS** — configurado para permitir cualquier origen, soportando tanto el frontend web como la app Android (Capacitor)
- **Patrón Repository + Service Layer** — separación de responsabilidades en tres capas: Controllers (HTTP), Services (lógica de negocio) y Repositories (acceso a datos). Esto desacopla la lógica de negocio del ORM, facilitando pruebas y mantenimiento

### Frontend — Angular 21

- **Angular 21 standalone** — componentes standalone sin NgModules, usando la nueva API de signals para estado reactivo
- **Lazy loading** — las rutas cargan sus componentes bajo demanda con `loadComponent`
- **HTTP Interceptor funcional** — inyecta automáticamente el JWT en cada request autenticado
- **Auth Guard funcional** — protege la ruta `/movies` redirigiendo a `/login` si no hay token
- **Reactive Forms** — formularios con validación para el CRUD de películas, incluyendo validación numérica para el campo de recaudación
- **DatePipe y CurrencyPipe** — pipes nativos de Angular para formatear fechas (`dd/MM/yyyy`) y recaudación (`USD`) directamente en la plantilla, sin librerías externas
- **Paginación con signals** — la tabla muestra 6 películas por página; el buscador filtra sobre el total y la paginación se aplica sobre el resultado filtrado
- **Actualizaciones en tiempo real con SignalR** — `RealtimeService` mantiene una conexión WebSocket con el backend. Cuando cualquier cliente (web o Android) crea, edita o elimina una película, el signal `movies` se actualiza localmente de forma inmediata: inserta al inicio, reemplaza por id o filtra por id, sin recargar toda la lista vía HTTP. La conexión usa `skipNegotiation: true` para conectar directamente por WebSocket, evitando el paso de negotiate que el WebView de Android no maneja correctamente en conexiones cross-origin
- **Manejo de errores** — banner dismissible que aparece cuando falla cualquier operación HTTP (carga, creación, edición o eliminación); el login muestra el mensaje de error inline en el formulario
- **CSS artesanal** — sin librerías de estilos externas, dark theme completo con variables CSS
- **Iconify** — iconos vía script CDN con etiquetas HTML (`<span class="iconify">`)

### Mobile — Capacitor 8

- **Capacitor 8** — envuelve el build de Angular para generar la app Android nativa
- **`androidScheme: http`** — permite tráfico HTTP hacia el backend (necesario en Android 9+)
- **`cleartext: true`** — habilita `android:usesCleartextTraffic` en el manifest de Android
- El build para Android usa `environment.android.ts`, que apunta al backend en `http://10.0.2.2:5000` y al hub en `http://10.0.2.2:5000/hubs/movies` (así el emulador Android alcanza el `localhost` del host)

### Infraestructura — Docker

- **Docker Compose** — orquesta backend y frontend en dos contenedores
- **nginx** — sirve el build de Angular y hace proxy reverso de `/api/*` y `/hubs/*` hacia el backend; el bloque `/hubs/` incluye los headers `Upgrade` y `Connection` necesarios para el handshake WebSocket
- **Volume Docker** — persiste el archivo SQLite entre reinicios del contenedor

---

## Funcionalidades

- Login con JWT (usuario único hardcodeado)
- **Sincronización en tiempo real** — cualquier cambio (crear, editar, eliminar) se refleja instantáneamente en todos los clientes conectados (web y Android) sin necesidad de recargar, gracias a SignalR WebSockets
- CRUD completo de películas con los campos:
  - **Nombre** — texto requerido
  - **Categoría** — texto requerido
  - **Descripción** — texto requerido
  - **Estado** — enum con 4 valores: Disponible, No Disponible, Próximamente, Archivada
  - **Fecha de estreno** — date picker opcional, formateado con `DatePipe`
  - **Recaudación (USD)** — número opcional con validación (debe ser positivo), formateado con `CurrencyPipe`
- Buscador en tiempo real por nombre, categoría o descripción (busca sobre el total)
- Paginación de 6 películas por página con navegación inteligente (ventana deslizante + elipsis)
- Manejo de errores con banner dismissible para operaciones fallidas y mensaje inline en el login

---

## Credenciales de acceso

| Campo    | Valor      |
| -------- | ---------- |
| Usuario  | `admin`    |
| Password | `admin123` |

---

## Opción A — Probar como web app (Docker)

**Requisitos:** Docker Desktop instalado y corriendo.

```bash
git clone <url-del-repositorio>
cd IS-Crud-App

docker compose up --build
```

Una vez levantado, abrir el navegador en:

```
http://localhost
```

El backend también queda expuesto en `http://localhost:5000` (necesario para la app Android).

Para detener:

```bash
docker compose down
```

> **Nota:** si se realizan cambios en el esquema de la base de datos y se requiere recrearla, usar `docker compose down -v` en lugar de `docker compose down`. El flag `-v` elimina el volumen con el archivo SQLite, permitiendo que el backend lo recree con el esquema actualizado al volver a iniciar.

---

## Opción B — Probar como app Android (Capacitor + Emulador)

**Requisitos:**

- Android Studio instalado
- Emulador configurado — se recomienda **Android 16 (API 36)**, que es la versión estable soportada por Capacitor v8
- Docker corriendo (el emulador consume el backend en `10.0.2.2:5000`)

### Pasos

1. Levantar el backend con Docker (si no está corriendo ya):

```bash
docker compose up --build -d
```

2. Abrir Android Studio con el proyecto Android:

```bash
cd apps/frontend
npx cap open android
```

3. En Android Studio:
   - Esperar a que termine el **Gradle sync**
   - Seleccionar el emulador (API 36 recomendado) en el dropdown de dispositivos
   - Presionar **Run ▶**

> La app Android ya viene con el build sincronizado. Si se realizan cambios en el código fuente y se quiere regenerar el APK manualmente, ver la sección de desarrollo.

---

## Desarrollo local

### Backend

```bash
cd apps/backend
dotnet run
# Corre en http://localhost:5101
```

### Frontend

```bash
cd apps/frontend
npm install
npm start
# Corre en http://localhost:4200
```

### Regenerar build para Android tras cambios

```bash
cd apps/frontend
npm run build -- --configuration android
npx cap sync android
npx cap open android
```

---

## Testing

### Backend — xUnit + Moq

Tests unitarios sobre la capa de servicio (`MovieService`), aislando el repositorio con mocks para no depender de la base de datos.

```bash
dotnet test apps/backend.Tests
```

| Test                                                | Qué valida                                                   |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `GetAllAsync_RetornaTodosLosDtosMapeados`           | Los datos del repositorio se mapean correctamente a DTOs     |
| `CreateAsync_LlamaAlRepositorioYRetornaDto`         | Se invoca el repositorio una vez y se retorna el DTO creado  |
| `UpdateAsync_CuandoNoExisteLaPelicula_RetornaNull`  | Retorna `null` cuando el repositorio no encuentra la entidad |
| `DeleteAsync_CuandoExisteLaPelicula_RetornaTrue`    | Retorna `true` al eliminar una entidad existente             |
| `DeleteAsync_CuandoNoExisteLaPelicula_RetornaFalse` | Retorna `false` al intentar eliminar una entidad inexistente |

### Frontend — Vitest (Angular 21)

Tests unitarios sobre los servicios usando `TestBed` con `HttpTestingController` para interceptar y verificar llamadas HTTP sin realizar requests reales.

```bash
cd apps/frontend
npm test
```

**AuthService** (5 tests)

| Test                   | Qué valida                                            |
| ---------------------- | ----------------------------------------------------- |
| Creación               | El servicio se instancia correctamente                |
| `getToken` sin sesión  | Retorna `null` cuando no hay token almacenado         |
| `isLoggedIn` sin token | Retorna `false` cuando localStorage está vacío        |
| `isLoggedIn` con token | Retorna `true` cuando existe un token en localStorage |
| `logout`               | Elimina el token y `isLoggedIn` pasa a `false`        |

**MovieService** (5 tests)

| Test     | Qué valida                                                 |
| -------- | ---------------------------------------------------------- |
| Creación | El servicio se instancia correctamente                     |
| `getAll` | Realiza `GET /api/movies` y retorna la lista deserializada |
| `create` | Realiza `POST /api/movies` con el body correcto            |
| `update` | Realiza `PUT /api/movies/:id` con los datos actualizados   |
| `delete` | Realiza `DELETE /api/movies/:id`                           |

### Android — JUnit

Tests unitarios sobre lógica de paginación y búsqueda en la capa nativa. Se ejecutan desde Android Studio haciendo clic derecho sobre `ExampleUnitTest.java` → **Run tests**.

| Test                                        | Qué valida                                             |
| ------------------------------------------- | ------------------------------------------------------ |
| `paginacion_totalPaginas_calculaCorrecto`   | 14 películas con página de 6 → 3 páginas totales       |
| `paginacion_offsetPrimeraPagina_esZero`     | El offset de la página 1 es 0                          |
| `paginacion_offsetSegundaPagina_esSeis`     | El offset de la página 2 es 6                          |
| `busqueda_nombreContieneQuery_devuelveTrue` | La búsqueda es case-insensitive y encuentra subcadenas |
| `busqueda_queryVacio_siempreCoincide`       | Un query vacío no filtra resultados                    |

---

## Estructura del proyecto

```
IS-Crud-App/
├── apps/
│   ├── backend/
│   │   ├── Controllers/       # AuthController, MoviesController
│   │   ├── Hubs/              # MovieHub (SignalR)
│   │   ├── Services/          # IMovieService, MovieService
│   │   ├── Repositories/      # IMovieRepository, MovieRepository
│   │   ├── Models/            # Movie, MovieStatus
│   │   ├── DTOs/              # LoginDto, MovieDto
│   │   ├── Data/              # AppDbContext (EF Core)
│   │   └── Dockerfile
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/      # Services (MovieService, AuthService, RealtimeService), Guards, Interceptors, Models
│       │   │   └── features/  # Login, Movies (list + form modal)
│       │   └── environments/  # environment.ts / .prod.ts / .android.ts (cada uno con apiUrl y hubUrl)
│       ├── android/           # Proyecto Android generado por Capacitor
│       ├── nginx.conf
│       ├── capacitor.config.ts
│       └── Dockerfile
└── docker-compose.yml
```
