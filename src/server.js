import path from "path";
import { createServer } from "http";
import { fileURLToPath } from "url";
import express from "express";
import { engine } from "express-handlebars";
import { Server as SocketIOServer } from "socket.io";
import { productManager } from "./managers/product-manager.js";
import { productRouter } from "./routes/product-router.js";
import { cartRouter } from "./routes/cart-router.js";
import { viewsRouter } from "./routes/views-router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

const emitProducts = async () => {
  const products = await productManager.getAll();
  io.emit("productsUpdated", products);
};

io.on("connection", async (socket) => {
  try {
    const products = await productManager.getAll();
    socket.emit("productsUpdated", products);
  } catch (error) {
    socket.emit("productActionError", error.message);
  }

  socket.on("createProduct", async (productData) => {
    try {
      await productManager.addProduct(productData);
      await emitProducts();
      socket.emit("productActionSuccess", "Producto creado correctamente");
    } catch (error) {
      socket.emit("productActionError", error.message);
    }
  });

  socket.on("deleteProduct", async (pid) => {
    try {
      const wasDeleted = await productManager.deleteProduct(pid);

      if (!wasDeleted) {
        socket.emit("productActionError", "Product not found");
        return;
      }

      await emitProducts();
      socket.emit("productActionSuccess", "Producto eliminado correctamente");
    } catch (error) {
      socket.emit("productActionError", error.message);
    }
  });
});

httpServer.listen(8080, () => {
  console.log("Server running on port 8080");
});
