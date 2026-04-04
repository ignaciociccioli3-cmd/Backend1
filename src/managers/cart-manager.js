import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class CartManager {
  validateObjectId(id, resourceName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `Invalid ${resourceName} id`);
    }
  }

  async getCartOrThrow(cid) {
    this.validateObjectId(cid, "cart");

    const cart = await Cart.findById(cid);

    if (!cart) {
      throw createError(404, "Cart not found");
    }

    return cart;
  }

  async ensureProductExists(pid) {
    this.validateObjectId(pid, "product");

    const product = await Product.findById(pid).lean();

    if (!product) {
      throw createError(404, "Product not found");
    }

    return product;
  }

  async createCart() {
    const newCart = await Cart.create({ products: [] });
    return newCart.toObject();
  }

  async getById(cid) {
    this.validateObjectId(cid, "cart");

    return Cart.findById(cid)
      .populate("products.product")
      .lean();
  }

  async addProductToCart(cid, pid) {
    const cart = await this.getCartOrThrow(cid);
    await this.ensureProductExists(pid);

    const productInCart = cart.products.find(
      (item) => item.product.toString() === pid
    );

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }

  async removeProductFromCart(cid, pid) {
    const cart = await this.getCartOrThrow(cid);
    await this.ensureProductExists(pid);

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (productIndex === -1) {
      throw createError(404, "Product not found in cart");
    }

    cart.products.splice(productIndex, 1);
    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }

  async updateCartProducts(cid, productsArray) {
    if (!Array.isArray(productsArray)) {
      throw createError(400, "products must be an array");
    }

    const cart = await this.getCartOrThrow(cid);

    const normalizedProducts = productsArray.map((item) => {
      if (!item || typeof item !== "object") {
        throw createError(400, "Each product entry must be an object");
      }

      const { product, quantity } = item;

      this.validateObjectId(product, "product");

      const parsedQuantity = Number(quantity);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        throw createError(400, "quantity must be an integer greater than or equal to 1");
      }

      return {
        product,
        quantity: parsedQuantity,
      };
    });

    const uniqueProductIds = [...new Set(normalizedProducts.map((item) => item.product))];
    const existingProducts = await Product.find({ _id: { $in: uniqueProductIds } })
      .select("_id")
      .lean();

    if (existingProducts.length !== uniqueProductIds.length) {
      throw createError(404, "One or more products do not exist");
    }

    cart.products = normalizedProducts;
    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await this.getCartOrThrow(cid);
    await this.ensureProductExists(pid);

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      throw createError(400, "quantity must be an integer greater than or equal to 1");
    }

    const productInCart = cart.products.find(
      (item) => item.product.toString() === pid
    );

    if (!productInCart) {
      throw createError(404, "Product not found in cart");
    }

    productInCart.quantity = parsedQuantity;
    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }

  async clearCart(cid) {
    const cart = await this.getCartOrThrow(cid);

    cart.products = [];
    await cart.save();
    await cart.populate("products.product");

    return cart.toObject();
  }
}

export const cartManager = new CartManager();
