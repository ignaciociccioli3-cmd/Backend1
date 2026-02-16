import { access, readFile, writeFile } from "fs/promises";
import { constants } from "fs";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class ProductManager {
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

  async readProducts() {
    await this.ensureFile();
    const fileContent = await readFile(this.path, "utf-8");

    if (!fileContent.trim()) {
      return [];
    }

    const parsedContent = JSON.parse(fileContent);
    return Array.isArray(parsedContent) ? parsedContent : [];
  }

  async saveProducts(products) {
    await writeFile(this.path, JSON.stringify(products, null, 2));
  }

  getNextId(products) {
    // ID autoincremental: max existente + 1.
    if (products.length === 0) {
      return 1;
    }

    const maxId = Math.max(...products.map((product) => Number(product.id) || 0));
    return maxId + 1;
  }

  validateRequiredFields(data) {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missingFields.length > 0) {
      throw createError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }
  }

  async getAll() {
    return this.readProducts();
  }

  async getById(pid) {
    const id = Number(pid);
    const products = await this.readProducts();
    return products.find((product) => Number(product.id) === id) || null;
  }

  async addProduct(data) {
    this.validateRequiredFields(data);

    const price = Number(data.price);
    const stock = Number(data.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      throw createError(400, "price and stock must be numbers");
    }

    const products = await this.readProducts();

    const duplicatedCode = products.some((product) => product.code === data.code);
    if (duplicatedCode) {
      throw createError(400, "Code already exists");
    }

    const newProduct = {
      id: this.getNextId(products),
      title: data.title,
      description: data.description,
      code: data.code,
      price,
      status: typeof data.status === "boolean" ? data.status : true,
      stock,
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    };

    products.push(newProduct);
    await this.saveProducts(products);

    return newProduct;
  }

  async updateProduct(pid, fields) {
    const id = Number(pid);
    const products = await this.readProducts();
    const productIndex = products.findIndex(
      (product) => Number(product.id) === id
    );

    if (productIndex === -1) {
      return null;
    }

    const updates = { ...fields };
    // Nunca permitimos modificar el id desde el body.
    delete updates.id;

    if (updates.code !== undefined) {
      const duplicatedCode = products.some(
        (product) => product.code === updates.code && Number(product.id) !== id
      );
      if (duplicatedCode) {
        throw createError(400, "Code already exists");
      }
    }

    if (updates.price !== undefined) {
      const parsedPrice = Number(updates.price);
      if (Number.isNaN(parsedPrice)) {
        throw createError(400, "price must be a number");
      }
      updates.price = parsedPrice;
    }

    if (updates.stock !== undefined) {
      const parsedStock = Number(updates.stock);
      if (Number.isNaN(parsedStock)) {
        throw createError(400, "stock must be a number");
      }
      updates.stock = parsedStock;
    }

    if (updates.status !== undefined && typeof updates.status !== "boolean") {
      throw createError(400, "status must be a boolean");
    }

    if (updates.thumbnails !== undefined && !Array.isArray(updates.thumbnails)) {
      throw createError(400, "thumbnails must be an array of strings");
    }

    const updatedProduct = {
      ...products[productIndex],
      ...updates,
      id: products[productIndex].id,
    };

    products[productIndex] = updatedProduct;
    await this.saveProducts(products);

    return updatedProduct;
  }

  async deleteProduct(pid) {
    const id = Number(pid);
    const products = await this.readProducts();
    const filteredProducts = products.filter(
      (product) => Number(product.id) !== id
    );

    if (filteredProducts.length === products.length) {
      return false;
    }

    await this.saveProducts(filteredProducts);
    return true;
  }
}

export const productManager = new ProductManager("./products.json");
