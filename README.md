# Food Store

Sistema de pedidos de comida para el Trabajo Práctico Integrador de Programación 4.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas con Unit of Work y autenticación JWT en cookie HttpOnly.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, con TanStack Query, Form y Table, Zustand y Axios.

**Repositorio:** https://github.com/patorinaldi/TPI_FoodStore

## Funcionalidades

**Cliente (rol `user`):** registro e inicio de sesión, catálogo paginado con búsqueda y filtro por categoría, carrito que persiste al recargar, checkout con dirección de entrega y forma de pago (efectivo o transferencia), y "Mis pedidos" con el detalle de cada pedido y la cancelación mientras está pendiente.

**Administrador (rol `admin`):** resumen con indicadores del negocio, ABM de categorías y productos, control de stock y disponibilidad, gestión de pedidos según la máquina de estados (pendiente → en preparación → entregado, o cancelado) y activación o desactivación de usuarios.

**Reglas del sistema:** un pedido se crea completo o no se crea; el stock se descuenta en la misma transacción que crea el pedido y se restituye al cancelarlo; cada línea guarda una copia del nombre y del precio, así el pedido no cambia aunque después se edite el producto.

## Estructura

```
backend/             API REST (FastAPI)
frontend/            Aplicación web (React)
docker-compose.yml   PostgreSQL para desarrollo
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (si no está instalado: `corepack enable` o `npm install -g pnpm`) |
| Docker + Docker Compose | Opcional, para levantar PostgreSQL. Sin Docker se puede usar SQLite |

## Puesta en marcha rápida

Con Docker, Python y pnpm instalados, desde la raíz del repositorio y en dos terminales:

```bash
# Terminal 1: base de datos y backend
docker compose up -d
cd backend
python3 -m venv venv            # Windows: python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

```bash
# Terminal 2: frontend
cd frontend
pnpm install
cp .env.example .env            # Windows: copy .env.example .env
pnpm dev
```

Abrir http://localhost:5173 e ingresar con alguno de los [usuarios del seed](#4-datos-iniciales). Cada paso está explicado en las secciones siguientes.

## Backend

Todos los comandos se ejecutan desde la carpeta `backend/`, salvo el de Docker.

### 1. Base de datos

**Opción A: PostgreSQL con Docker (recomendada).** Desde la raíz del repositorio:

```bash
docker compose up -d
```

Levanta PostgreSQL 16 en `localhost:5432` con la base `foodstore_db` (usuario y contraseña `foodstore`), que es la que usa `.env.example`.

**Opción B: SQLite.** No hace falta instalar nada: en el paso 3, cambiar `DATABASE_URL` por `sqlite:///./foodstore.db`.

### 2. Entorno virtual y dependencias

```bash
cd backend
python3 -m venv venv            # Windows: python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Variables de entorno

```bash
cp .env.example .env            # Windows: copy .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://foodstore:foodstore@localhost:5432/foodstore_db` o `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

### 4. Datos iniciales

```bash
python -m app.db.seed
```

Crea las tablas y carga los usuarios, 4 categorías y 10 productos con stock. Se puede correr varias veces: no duplica registros.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

### 5. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

Para probar endpoints protegidos desde `/docs`, ejecutar primero `POST /api/v1/auth/token` con el usuario y la contraseña: el navegador guarda la cookie de sesión y la manda en las siguientes peticiones.

## Frontend

Todos los comandos se ejecutan desde la carpeta `frontend/`. El backend tiene que estar corriendo.

### 1. Dependencias

```bash
cd frontend
pnpm install
```

Las versiones están fijadas en `package.json` y `pnpm-lock.yaml`.

### 2. Variables de entorno

```bash
cp .env.example .env            # Windows: copy .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 3. Ejecución

```bash
pnpm dev
```

La aplicación queda en http://localhost:5173.

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Verifica los tipos con `tsc` y genera la versión de producción en `dist/` |
| `pnpm preview` | Sirve el contenido de `dist/` para probar el build |
| `pnpm lint` | Corre ESLint (incluye la regla que prohíbe `any`) |

> La sesión viaja en una cookie HttpOnly. Usar siempre `localhost` (no `127.0.0.1`) tanto para el backend como para el frontend, así el navegador comparte la cookie entre los dos.

## Arquitectura

### Backend

Cada dominio (`usuarios`, `categorias`, `productos`, `pedidos`) es un paquete en `app/modules/` con la misma cadena de capas; `auth` solo tiene router, service y schemas porque usa el modelo `Usuario`.

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Router | `router.py` | Recibe la petición, resuelve sesión y rol con `Depends`, obtiene el service con `Depends(get_<modulo>_service)` y traduce las excepciones de dominio a `HTTPException` |
| Service | `service.py` | Reglas de negocio dentro de `with self.uow as uow:`; devuelve el schema de salida dentro del bloque |
| Unit of Work | `unit_of_work.py` | Abre la sesión y expone los repositorios; hace `commit` o `rollback` en `__exit__`. Es el único lugar con `commit()` |
| Repository | `repository.py` | Consultas con `select`, heredando de `BaseRepository[T]` |
| Model / Schemas | `models.py`, `schemas.py` | Tablas SQLModel y modelos de entrada y salida (nunca se devuelve una tabla) |

La infraestructura compartida (configuración, base de datos, seguridad, dependencias de sesión y rol, Unit of Work y repositorio base) vive en `app/core/`.

### Frontend

Organizado por features que espejan los módulos del backend (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`), cada una con `pages/`, `components/`, `hooks/`, `api/` y `types/`. Lo transversal está en `shared/`, el estado global en `store/` y las rutas en `routes/`.

- **Estado del servidor:** TanStack Query (`useQuery` y `useMutation` con invalidación de las queries afectadas).
- **Estado del cliente:** Zustand con `persist`: `authStore` guarda solo el usuario (nunca el token) y `cartStore` el carrito.
- **HTTP:** una instancia de Axios con `withCredentials` y un interceptor que limpia la sesión ante un 401 o una cuenta desactivada.
- **Rutas:** `ProtectedRoute` redirige a `/login` sin sesión y a `/unauthorized` si el rol no alcanza. Las pantallas del panel se cargan de forma diferida.

## Endpoints

Todos bajo `/api/v1`. El detalle de cada uno (cuerpos, respuestas y errores) está en `/docs`.

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/auth/register`, `/auth/token`, `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` | admin |
| POST | `/admin/usuarios/{id}/activar`, `/admin/usuarios/{id}/desactivar` | admin |
| GET | `/categorias`, `/categorias/{id}` | Público |
| POST, PUT, DELETE | `/categorias`, `/categorias/{id}` | admin |
| GET | `/productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`), `/productos/{id}` | Público |
| POST, PUT, DELETE | `/productos`, `/productos/{id}` | admin |
| PATCH | `/productos/{id}/stock` | admin |
| POST | `/pedidos` | Sesión |
| GET | `/pedidos` (`skip`, `limit`, `estado`) | Sesión (el cliente ve los suyos, el admin todos) |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño |

## Problemas comunes

- **El login funciona pero después todo da 401:** el frontend y el backend se abrieron con hosts distintos (`localhost` y `127.0.0.1`). Usar `localhost` en los dos.
- **`docker compose up` falla porque el puerto 5432 está ocupado:** hay otro PostgreSQL corriendo en la máquina. Detenerlo o usar la opción SQLite.
- **`pip install` falla con Python 3.14:** SQLModel 0.0.22 no lo soporta; crear el entorno virtual con Python 3.11, 3.12 o 3.13.
- **Para empezar con la base limpia:** `docker compose down -v` borra el volumen de PostgreSQL (o borrar `backend/foodstore.db` con SQLite) y después correr de nuevo el seed.
