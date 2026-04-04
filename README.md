# Entrega Final - API de Productos y Carritos (MongoDB)

Proyecto Node.js + Express + Handlebars + Socket.IO con persistencia en MongoDB (Mongoose).

## Stack

- Node.js (ES Modules)
- Express
- express-handlebars
- socket.io
- mongoose
- mongoose-paginate-v2
- dotenv

## Configuracion

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo `.env` en la raiz (o copiar de `.env.example`):

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/electroproducts
```

3. Levantar servidor:

```bash
npm run dev
```

Tambien:

```bash
npm start
```

Servidor: `http://localhost:8080`

## Persistencia

La persistencia principal es MongoDB.

Modelos:

- `Product`
- `Cart` con `products.product` referenciando `Product`

## Rutas API

### Productos - `/api/products`

- `GET /api/products`
  - Query params opcionales:
    - `limit` (default `10`)
    - `page` (default `1`)
    - `sort=asc|desc` (ordena por `price`)
    - `query`
      - `true` / `false` filtra por `status`
      - cualquier otro valor filtra por `category`

  Respuesta:

```json
{
  "status": "success",
  "payload": [],
  "totalPages": 0,
  "prevPage": null,
  "nextPage": null,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevLink": null,
  "nextLink": null
}
```

- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`

### Carritos - `/api/carts`

- `POST /api/carts`
- `GET /api/carts/:cid` (con `populate` de productos)
- `POST /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
  - Reemplaza todo el arreglo `products`
- `PUT /api/carts/:cid/products/:pid`
  - Actualiza solo `quantity`
- `DELETE /api/carts/:cid`
  - Vacia el carrito

## Ejemplos de body

### Crear producto - `POST /api/products`

```json
{
  "title": "Notebook Lenovo",
  "description": "Notebook 15 pulgadas",
  "code": "LEN-15-I5",
  "price": 1500,
  "stock": 8,
  "category": "notebooks",
  "status": true,
  "thumbnails": ["https://example.com/lenovo-front.jpg"]
}
```

### Reemplazar productos del carrito - `PUT /api/carts/:cid`

```json
{
  "products": [
    {
      "product": "66f0aabbccddeeff00112233",
      "quantity": 2
    }
  ]
}
```

### Actualizar cantidad de un producto en carrito - `PUT /api/carts/:cid/products/:pid`

```json
{
  "quantity": 3
}
```

## Vistas

- `GET /products`: listado con paginacion, filtro y orden
- `GET /products/:pid`: detalle + boton para agregar al carrito
- `GET /carts/:cid`: productos del carrito seleccionado
- `GET /realtimeproducts`: alta/baja en tiempo real con Socket.IO

## Notas

- Los IDs son `ObjectId` de MongoDB (string), no numericos.
- Para usar Mongo local, asegurate de tener el servicio levantado.
