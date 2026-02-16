import { Router } from "express";
import { cartManager } from "../managers/cart-manager.js";
import { productManager } from "../managers/product-manager.js";

const cartRouter = Router();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  return res.status(status).json({ error: message });
};

cartRouter.post("/", async (_req, res) => {
  try {
    const newCart = await cartManager.createCart();
    return res.status(201).json(newCart);
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getById(cid);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(
      cid,
      pid,
      productManager
    );

    return res.status(200).json(updatedCart);
  } catch (error) {
    return handleError(res, error);
  }
});

export { cartRouter };
