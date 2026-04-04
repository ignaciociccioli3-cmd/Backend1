import { Router } from "express";
import { productManager } from "../managers/product-manager.js";
import { cartManager } from "../managers/cart-manager.js";

const viewsRouter = Router();

const renderError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  return res.status(status).send(message);
};

viewsRouter.get("/", (_req, res) => {
  return res.redirect("/products");
});

viewsRouter.get("/products", async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;

    const result = await productManager.getPaginated({
      limit,
      page,
      sort,
      query,
      baseUrl: "/products",
    });

    return res.render("home", {
      title: "Productos",
      pageTitle: "Listado de productos",
      ...result,
      queryValue: query || "",
      sortValue: sort || "",
      limitValue:
        Number.isInteger(Number.parseInt(limit, 10)) && Number.parseInt(limit, 10) > 0
          ? Number.parseInt(limit, 10)
          : 10,
    });
  } catch (error) {
    return renderError(res, error);
  }
});

viewsRouter.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    return res.render("productDetail", {
      title: product.title,
      pageTitle: "Detalle de producto",
      product,
      selectedCartId: req.query.cid || "",
    });
  } catch (error) {
    return renderError(res, error);
  }
});

viewsRouter.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);

    if (!cart) {
      return res.status(404).send("Cart not found");
    }

    return res.render("cart", {
      title: "Carrito",
      pageTitle: `Carrito ${cid}`,
      cart,
      products: cart.products,
    });
  } catch (error) {
    return renderError(res, error);
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
    return renderError(res, error);
  }
});

export { viewsRouter };
