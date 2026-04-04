import { Router } from "express";
import { productManager } from "../managers/product-manager.js";

const productRouter = Router();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  return res.status(status).json({ error: message });
};

productRouter.get("/", async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const result = await productManager.getPaginated({
      limit,
      page,
      sort,
      query,
      baseUrl,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.post("/", async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    return res.status(201).json(newProduct);
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedProduct = await productManager.updateProduct(pid, req.body);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return handleError(res, error);
  }
});

productRouter.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const wasDeleted = await productManager.deleteProduct(pid);

    if (!wasDeleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ status: "success", message: "Product deleted" });
  } catch (error) {
    return handleError(res, error);
  }
});

export { productRouter };
