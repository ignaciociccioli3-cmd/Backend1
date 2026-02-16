import { access, readFile, writeFile } from "fs/promises";
import { constants } from "fs";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class CartManager {
  constructor(path) {
    this.path = path;
  }

  async ensureFile() {
    // Si el archivo no existe, lo creamos con un array vacío.
    try {
      await access(this.path, constants.F_OK);
    } catch {
      await writeFile(this.path, "[]");
    }
  }

  async readCarts() {
    await this.ensureFile();
    const fileContent = await readFile(this.path, "utf-8");

    if (!fileContent.trim()) {
      return [];
    }

    const parsedContent = JSON.parse(fileContent);
    return Array.isArray(parsedContent) ? parsedContent : [];
  }

  async saveCarts(carts) {
    await writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  getNextId(carts) {
    // ID autoincremental: max existente + 1.
    if (carts.length === 0) {
      return 1;
    }

    const maxId = Math.max(...carts.map((cart) => Number(cart.id) || 0));
    return maxId + 1;
  }

  async createCart() {
    const carts = await this.readCarts();
    const newCart = {
      id: this.getNextId(carts),
      products: [],
    };

    carts.push(newCart);
    await this.saveCarts(carts);

    return newCart;
  }

  async getById(cid) {
    const id = Number(cid);
    const carts = await this.readCarts();
    return carts.find((cart) => Number(cart.id) === id) || null;
  }

  async addProductToCart(cid, pid, productManager) {
    const cartId = Number(cid);
    const productId = Number(pid);
    const carts = await this.readCarts();

    const cartIndex = carts.findIndex((cart) => Number(cart.id) === cartId);
    if (cartIndex === -1) {
      throw createError(404, "Cart not found");
    }

    const product = await productManager.getById(productId);
    if (!product) {
      throw createError(404, "Product not found");
    }

    const productInCart = carts[cartIndex].products.find(
      (item) => Number(item.product) === productId
    );

    // Si ya está el producto, sumamos 1. Si no, lo agregamos con quantity = 1.
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      carts[cartIndex].products.push({ product: productId, quantity: 1 });
    }

    await this.saveCarts(carts);

    return carts[cartIndex];
  }
}

export const cartManager = new CartManager("./carts.json");
