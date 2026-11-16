# Food Store

Sistema de pedidos de comida para el Trabajo Práctico Integrador de Programación 4.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas con Unit of Work y autenticación JWT en cookie HttpOnly.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, con TanStack Query, Form y Table, Zustand y Axios.

**Repositorio:** https://github.com/patorinaldi/TPI_FoodStore

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
| Docker + Docker Compose | Opcional, para levantar PostgreSQL. Sin Docker se puede usar SQLite |

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
python -m venv venv
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

> La sesión viaja en una cookie HttpOnly. Usar siempre `localhost` (no `127.0.0.1`) tanto para el backend como para el frontend, así el navegador comparte la cookie entre los dos.
