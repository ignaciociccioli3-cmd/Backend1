# Entrega 1 - API de Productos y Carritos

Este proyecto implementa una API REST con Node.js y Express para administrar productos y carritos.
La información se guarda en archivos JSON (`products.json` y `carts.json`) usando filesystem.

## Ejecucion

```bash
npm install
npm run dev
```

Tambien se puede iniciar con:

```bash
npm start
```

Servidor: `http://localhost:8080`

## Rutas disponibles

### Productos - `/api/products`

- `GET /api/products`  
  Devuelve el listado completo de productos.
- `GET /api/products/:pid`  
  Devuelve un producto por ID.
- `POST /api/products`  
  Crea un producto nuevo.
- `PUT /api/products/:pid`  
  Actualiza los campos enviados de un producto existente (el `id` no se modifica).
- `DELETE /api/products/:pid`  
  Elimina un producto por ID.

### Carritos - `/api/carts`

- `POST /api/carts`  
  Crea un carrito vacio (`{ id, products: [] }`).
- `GET /api/carts/:cid`  
  Devuelve el carrito solicitado.
- `POST /api/carts/:cid/product/:pid`  
  Agrega un producto al carrito.  
  Si ya existe, incrementa `quantity` en 1.

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

### Actualizar producto - `PUT /api/products/:pid`

```json
{
  "price": 1399,
  "stock": 10,
  "status": true
}
```

### Agregar producto al carrito - `POST /api/carts/:cid/product/:pid`

No requiere body.

## Pruebas con curl

### 1) Crear producto

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Mouse Gamer",
    "description":"Mouse RGB",
    "code":"MOUSE-RGB-01",
    "price":4500,
    "stock":25,
    "category":"perifericos",
    "thumbnails":[]
  }'
```

### 2) Crear carrito

```bash
curl -X POST http://localhost:8080/api/carts
```

### 3) Agregar producto al carrito

```bash
curl -X POST http://localhost:8080/api/carts/1/product/1
```
