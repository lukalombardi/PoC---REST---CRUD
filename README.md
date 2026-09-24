# PoC REST — CRUD de Clientes

Implementación de la PoC de **API REST** para Desarrollo de Software (UTN).
Se compara contra las implementaciones de **GraphQL** y **JSON-RPC** de los otros grupos.

## Modelo

```
CLIENTES(id, nombre, apellido, dni, email)
CP -> id
```

`dni` y `email` tienen restricción `UNIQUE` (permite demostrar el manejo de conflictos con `409 Conflict`).

## Stack

| Capa          | Elección                | Por qué                                                                       |
| ------------- | ----------------------- | ----------------------------------------------------------------------------- |
| Runtime       | Node.js 20              | Igual al de los otros grupos                                                   |
| Servidor/API  | Express 4               | Framework de referencia; el enrutamiento por recurso + verbo es la expresión directa de REST |
| ORM           | Prisma 6                | Igual al de los otros grupos                                                   |
| Base de datos | SQLite (archivo local)  | Cero setup; se cambia a Postgres tocando una línea del schema                  |
| Validación    | Zod                     | Igual al de los otros grupos                                                   |
| Entorno       | Docker + Docker Compose | El proyecto se levanta con un solo comando, sin instalar Node en la máquina    |

> **Regla de la PoC:** lo único que puede diferir entre los tres proyectos es la
> capa de API. Runtime, ORM, base y librería de validación tienen que ser
> idénticos, o la comparación mide el stack en vez de medir la tecnología.

## Cómo levantarlo (Docker)

Único requisito: tener **Docker Desktop** corriendo. No hace falta instalar Node ni Prisma.

```bash
docker compose up --build   # construye la imagen y levanta la API
```

La API queda en **http://localhost:3000**.

No hay que crear las tablas a mano: al arrancar el contenedor, el `docker-entrypoint.sh`
ejecuta `prisma migrate deploy`, que aplica las migraciones versionadas en el repo y crea
la base SQLite con la estructura correcta.

Para frenar todo:

```bash
docker compose down
```

## Variables de entorno

El `.env` define:

```
DATABASE_URL="file:./dev.db"
PORT=3000
```

## Estructura

```
prisma/schema.prisma                        Modelo de datos (idéntico en los 3 proyectos)
prisma/migrations/                          Migraciones — recrean la base al levantar
src/clientes/cliente.routes.js              Endpoints (recurso + verbo)
src/clientes/cliente.controller.js          Lógica del CRUD y mapeo de errores a códigos HTTP
src/clientes/cliente.schema.js              Reglas de validación con Zod
src/middlewares/validarDatos.middleware.js  Valida el body contra el schema antes del controller
src/db.js                                   Instancia única de Prisma Client
src/index.js                                Arranque del servidor Express
Dockerfile                                  Imagen multi-stage (dev / producción)
docker-compose.yml                          Servicio base
docker-compose.override.yml                 Config de desarrollo (hot reload)
docker-entrypoint.sh                        Aplica migraciones antes de arrancar
```

## API

Un endpoint por recurso; el **verbo HTTP** expresa la operación y el **código de estado**
comunica el resultado.

| Operación            | Endpoint               | Éxito | Errores posibles           |
| -------------------- | ---------------------- | ----- | -------------------------- |
| Listar clientes      | `GET /clientes`        | `200` | `500`                      |
| Traer uno por ID     | `GET /clientes/:id`    | `200` | `404`, `500`               |
| Crear cliente        | `POST /clientes`       | `201` | `400`, `409`, `500`        |
| Actualizar (parcial) | `PATCH /clientes/:id`  | `200` | `400`, `404`, `409`, `500` |
| Eliminar cliente     | `DELETE /clientes/:id` | `200` | `404`, `500`               |

**Cuerpo de ejemplo (POST / PATCH):**

```json
{
  "nombre": "Lucía",
  "apellido": "Fernández",
  "dni": "38412765",
  "email": "lucia.fernandez@mail.com"
}
```

## Manejo de errores con códigos HTTP

El uso de los códigos de estado es la característica central de REST que demuestra esta PoC:
el servidor comunica *qué* pasó con el status, sin meter el error en el cuerpo de la respuesta.

| Código               | Situación                                       | De dónde sale                         |
| -------------------- | ----------------------------------------------- | ------------------------------------- |
| `200 OK`             | Lectura, actualización o borrado exitoso        | GET, PATCH, DELETE                    |
| `201 Created`        | Recurso creado                                  | POST                                  |
| `400 Bad Request`    | Body inválido (falta un campo, formato erróneo) | Middleware de Zod                     |
| `404 Not Found`      | El recurso no existe                            | Chequeo manual / Prisma `P2025`       |
| `409 Conflict`       | DNI o email duplicado                           | Prisma `P2002` (restricción `UNIQUE`) |
| `500 Internal Error` | Falla inesperada del servidor                   | Cualquier `catch`                     |

## Guion sugerido para la demo

Se puede correr con Postman, Thunder Client o `curl`:

1. **Crear un cliente** — `POST /clientes` con un body válido → **201 Created**.
2. **Provocar un conflicto** — `POST /clientes` de nuevo con el mismo `dni` → **409 Conflict**.
   Es el momento estrella: muestra cómo REST usa el status para comunicar el resultado,
   frente a GraphQL, que responde `200` y mete el error en el body.
3. **Validación** — `POST /clientes` sin `nombre` → **400 Bad Request** con la lista de
   errores que arma Zod.
4. **Listar** — `GET /clientes` → **200** con todos los clientes.
5. **Buscar inexistente** — `GET /clientes/999` → **404 Not Found**.
6. **Actualizar y borrar** — `PATCH /clientes/:id` → **200**, luego `DELETE /clientes/:id` → **200**.

## Estado de verificación

El CRUD y el manejo de errores fueron probados con el servidor Express real corriendo en
Docker: create, read (lista y por ID), update parcial, delete, validación con Zod (400) y
conflicto por DNI/email duplicado (409). Las migraciones de Prisma se aplican solas al
levantar el contenedor mediante `prisma migrate deploy` en el entrypoint.
