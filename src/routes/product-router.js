import { Router } from "express";
import { productManager } from "../managers/product-manager.js";

const productRouter = Router();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  return res.status(status).json({ error: message });
};

productRouter.get("/", async (_req, res) => {
  try {
    const products = await productManager.getAll();
    return res.status(200).json(products);
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
