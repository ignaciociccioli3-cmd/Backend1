# Backend 1 - Entrega final

Hola, este repo es mi entrega final de Backend.

La app esta hecha con Express + Handlebars + Socket.IO y ahora guarda todo en MongoDB (ya no en archivos JSON como persistencia principal).

## Lo importante que tiene

- CRUD de productos
- Carritos con todas las rutas pedidas
- Relacion cart -> products con `ref` y `populate`
- Paginacion/filtro/orden en productos
- Vistas:
  - `/products`
  - `/products/:pid`
  - `/carts/:cid`
  - `/realtimeproducts`

## Stack

- Node.js
- Express
- Mongoose
- express-handlebars
- Socket.IO

## Como levantarlo

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` (si queres, copiar de `.env.example`):

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/electroproducts
```

3. Correr:

```bash
npm run dev
```

Tambien funciona con:

```bash
npm start
```

## Estructura (tipo clase 8/9)

Quedo organizada por capas:

`DB -> Repository -> Service -> Controller -> Router`

Carpetas principales:

- `src/config`
- `src/models`
- `src/repositories`
- `src/services`
- `src/controllers`
- `src/routes`
- `src/views`
- `src/public`

## Rutas de API

### Productos

- `GET /api/products` (acepta `limit`, `page`, `sort`, `query`)
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`

### Carritos

- `POST /api/carts`
- `GET /api/carts/:cid`
- `POST /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
- `PUT /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`

## Vistas

- `GET /products`
- `GET /products/:pid`
- `GET /carts/:cid`
- `GET /realtimeproducts`

## Nota

- Los IDs ahora son `ObjectId` de Mongo.
- Si usas Atlas, revisa que tu `MONGO_URI` apunte a la DB correcta (`electroproducts`).
