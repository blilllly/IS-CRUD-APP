# CineApp — Prueba Técnica IS

CRUD de gestión de películas con autenticación JWT, desarrollado como prueba técnica de aplicaciones multiplataforma. Corre como web app con Docker y como app Android con Capacitor.

---

## Stack tecnológico

### Backend — .NET Core 10

- **ASP.NET Core 10** — API REST con controllers
- **Entity Framework Core 10 + SQLite** — persistencia de datos con migraciones automáticas al iniciar
- **JWT (JSON Web Tokens)** — autenticación stateless. El token se genera al hacer login y se envía en cada request protegido vía header `Authorization: Bearer <token>`
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
- **CSS artesanal** — sin librerías de estilos externas, dark theme completo con variables CSS
- **Iconify** — iconos vía script CDN con etiquetas HTML (`<span class="iconify">`)

### Mobile — Capacitor 8

- **Capacitor 8** — envuelve el build de Angular para generar la app Android nativa
- **`androidScheme: http`** — permite tráfico HTTP hacia el backend (necesario en Android 9+)
- **`cleartext: true`** — habilita `android:usesCleartextTraffic` en el manifest de Android
- El build para Android usa `environment.android.ts`, que apunta al backend en `http://10.0.2.2:5000` (así el emulador Android alcanza el `localhost` del host)

### Infraestructura — Docker

- **Docker Compose** — orquesta backend y frontend en dos contenedores
- **nginx** — sirve el build de Angular y hace proxy reverso de `/api/*` hacia el backend, eliminando CORS en el flujo web
- **Volume Docker** — persiste el archivo SQLite entre reinicios del contenedor

---

## Funcionalidades

- Login con JWT (usuario único hardcodeado)
- CRUD completo de películas con los campos:
  - **Nombre** — texto requerido
  - **Categoría** — texto requerido
  - **Descripción** — texto requerido
  - **Estado** — enum con 4 valores: Disponible, No Disponible, Próximamente, Archivada
  - **Fecha de estreno** — date picker opcional, formateado con `DatePipe`
  - **Recaudación (USD)** — número opcional con validación (debe ser positivo), formateado con `CurrencyPipe`
- Buscador en tiempo real por nombre, categoría o descripción (busca sobre el total)
- Paginación de 6 películas por página con navegación inteligente (ventana deslizante + elipsis)

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

## Estructura del proyecto

```
IS-Crud-App/
├── apps/
│   ├── backend/
│   │   ├── Controllers/       # AuthController, MoviesController
│   │   ├── Services/          # IMovieService, MovieService
│   │   ├── Repositories/      # IMovieRepository, MovieRepository
│   │   ├── Models/            # Movie, MovieStatus
│   │   ├── DTOs/              # LoginDto, MovieDto
│   │   ├── Data/              # AppDbContext (EF Core)
│   │   └── Dockerfile
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/      # Services, Guards, Interceptors, Models
│       │   │   └── features/  # Login, Movies (list + form modal)
│       │   └── environments/  # environment.ts / .prod.ts / .android.ts
│       ├── android/           # Proyecto Android generado por Capacitor
│       ├── nginx.conf
│       ├── capacitor.config.ts
│       └── Dockerfile
└── docker-compose.yml
```
