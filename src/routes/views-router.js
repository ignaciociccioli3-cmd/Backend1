import { Router } from "express";
import { productManager } from "../managers/product-manager.js";

const viewsRouter = Router();

viewsRouter.get("/", async (_req, res) => {
  try {
    const products = await productManager.getAll();
    return res.render("home", {
      title: "Home",
      pageTitle: "Listado de productos",
      products,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

viewsRouter.get("/realtimeproducts", async (_req, res) => {
  try {
    const products = await productManager.getAll();
    return res.render("realTimeProducts", {
      title: "Real Time Products",
      pageTitle: "Productos en tiempo real",
      products,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export { viewsRouter };
