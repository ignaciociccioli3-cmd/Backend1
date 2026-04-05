import mongoose from "mongoose";
import { cartRepository } from "../repositories/cart-repository.js";
import { productRepository } from "../repositories/product-repository.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class CartService {
  constructor(repository, productsRepo) {
    this.repository = repository;
    this.productsRepo = productsRepo;
  }

  validateObjectId(id, resourceName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `Invalid ${resourceName} id`);
    }
  }

  getCartOrThrow = async (id) => {
    this.validateObjectId(id, "cart");

    const cart = await this.repository.getDocumentById(id);

    if (!cart) {
      throw createError(404, "Cart not found");
    }

    return cart;
  };

  ensureProductExists = async (id) => {
    this.validateObjectId(id, "product");

    const product = await this.productsRepo.getById(id);

    if (!product) {
      throw createError(404, "Product not found");
    }

    return product;
  };

  createCart = async () => {
    const cart = await this.repository.create({ products: [] });
    return cart.toObject();
  };

  getById = async (id) => {
    this.validateObjectId(id, "cart");
    return this.repository.getByIdPopulated(id);
  };

  addProductToCart = async (cartId, productId) => {
    const cart = await this.getCartOrThrow(cartId);
    await this.ensureProductExists(productId);

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.repository.save(cart);
    await this.repository.populateProducts(cart);

    return cart.toObject();
  };

  removeProductFromCart = async (cartId, productId) => {
    const cart = await this.getCartOrThrow(cartId);
    await this.ensureProductExists(productId);

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      throw createError(404, "Product not found in cart");
    }

    cart.products.splice(productIndex, 1);

    await this.repository.save(cart);
    await this.repository.populateProducts(cart);

    return cart.toObject();
  };

  updateCartProducts = async (cartId, products) => {
    if (!Array.isArray(products)) {
      throw createError(400, "products must be an array");
    }

    const cart = await this.getCartOrThrow(cartId);

    const normalizedProducts = products.map((item) => {
      if (!item || typeof item !== "object") {
        throw createError(400, "Each product entry must be an object");
      }

      const { product, quantity } = item;

      this.validateObjectId(product, "product");

      const parsedQuantity = Number(quantity);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        throw createError(
          400,
          "quantity must be an integer greater than or equal to 1"
        );
      }

      return {
        product,
        quantity: parsedQuantity,
      };
    });

    const uniqueProductIds = [
      ...new Set(normalizedProducts.map((item) => item.product)),
    ];

    const existingProductsCount = await this.productsRepo.getExistingIdsCount(
      uniqueProductIds
    );

    if (existingProductsCount !== uniqueProductIds.length) {
      throw createError(404, "One or more products do not exist");
    }

    cart.products = normalizedProducts;

    await this.repository.save(cart);
    await this.repository.populateProducts(cart);

    return cart.toObject();
  };

  updateProductQuantity = async (cartId, productId, quantity) => {
    const cart = await this.getCartOrThrow(cartId);
    await this.ensureProductExists(productId);

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      throw createError(
        400,
        "quantity must be an integer greater than or equal to 1"
      );
    }

    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (!productInCart) {
      throw createError(404, "Product not found in cart");
    }

    productInCart.quantity = parsedQuantity;

    await this.repository.save(cart);
    await this.repository.populateProducts(cart);

    return cart.toObject();
  };

  clearCart = async (id) => {
    const cart = await this.getCartOrThrow(id);

    cart.products = [];

    await this.repository.save(cart);
    await this.repository.populateProducts(cart);

    return cart.toObject();
  };
}

export const cartService = new CartService(cartRepository, productRepository);
