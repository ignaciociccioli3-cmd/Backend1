import { Router } from "express";
import { cartManager } from "../managers/cart-manager.js";

const cartRouter = Router();

const handleError = (res, error) => {
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  return res.status(status).json({ error: message });
};

cartRouter.post("/", async (_req, res) => {
  try {
    const newCart = await cartManager.createCart();
    return res.status(201).json({ status: "success", payload: newCart });
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

    return res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const productsArray = Array.isArray(req.body) ? req.body : req.body.products;

    const updatedCart = await cartManager.updateCartProducts(cid, productsArray);
    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    return handleError(res, error);
  }
});

cartRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cartManager.clearCart(cid);
    return res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    return handleError(res, error);
  }
});

export { cartRouter };
