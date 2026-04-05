import { cartService } from "../services/cart-service.js";

class CartController {
  constructor(service) {
    this.service = service;
  }

  create = async (_req, res, next) => {
    try {
      const response = await this.service.createCart();
      res.status(201).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const response = await this.service.getById(cid);

      if (!response) {
        const notFoundError = new Error("Cart not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  addProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const response = await this.service.addProductToCart(cid, pid);
      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  removeProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const response = await this.service.removeProductFromCart(cid, pid);
      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  replaceProducts = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const productsArray = Array.isArray(req.body) ? req.body : req.body.products;
      const response = await this.service.updateCartProducts(cid, productsArray);
      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  updateProductQuantity = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      const response = await this.service.updateProductQuantity(cid, pid, quantity);
      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };

  clear = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const response = await this.service.clearCart(cid);
      res.status(200).json({ status: "success", payload: response });
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController(cartService);
