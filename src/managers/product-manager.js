import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class ProductManager {
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

  normalizeNumericField(value, fieldName) {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw createError(400, `${fieldName} must be a number`);
    }

    return parsed;
  }

  normalizeQueryFilter(query) {
    if (query === undefined || query === null || query === "") {
      return {};
    }

    const normalizedQuery = String(query).trim();

    if (normalizedQuery === "true") {
      return { status: true };
    }

    if (normalizedQuery === "false") {
      return { status: false };
    }

    if (normalizedQuery === "available") {
      return { status: true };
    }

    if (normalizedQuery === "unavailable") {
      return { status: false };
    }

    return { category: normalizedQuery };
  }

  normalizeSort(sort) {
    if (sort === "asc") {
      return { price: 1 };
    }

    if (sort === "desc") {
      return { price: -1 };
    }

    return undefined;
  }

  buildPageLink(baseUrl, targetPage, { limit, sort, query }) {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("page", String(targetPage));

    if (sort === "asc" || sort === "desc") {
      params.set("sort", sort);
    }

    if (query !== undefined && query !== null && query !== "") {
      params.set("query", String(query));
    }

    return `${baseUrl}?${params.toString()}`;
  }

  async getAll() {
    return Product.find().lean();
  }

  async getPaginated({ limit, page, sort, query, baseUrl }) {
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedPage = Number.parseInt(page, 10);

    const normalizedLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const normalizedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const filter = this.normalizeQueryFilter(query);
    const sortOption = this.normalizeSort(sort);

    const paginateOptions = {
      limit: normalizedLimit,
      page: normalizedPage,
      lean: true,
    };

    if (sortOption) {
      paginateOptions.sort = sortOption;
    }

    const result = await Product.paginate(filter, paginateOptions);

    return {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? this.buildPageLink(baseUrl, result.prevPage, {
            limit: normalizedLimit,
            sort,
            query,
          })
        : null,
      nextLink: result.hasNextPage
        ? this.buildPageLink(baseUrl, result.nextPage, {
            limit: normalizedLimit,
            sort,
            query,
          })
        : null,
    };
  }

  async getById(pid) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return null;
    }

    return Product.findById(pid).lean();
  }

  async addProduct(data) {
    this.validateRequiredFields(data);

    const price = this.normalizeNumericField(data.price, "price");
    const stock = this.normalizeNumericField(data.stock, "stock");

    if (data.status !== undefined && typeof data.status !== "boolean") {
      throw createError(400, "status must be a boolean");
    }

    if (data.thumbnails !== undefined && !Array.isArray(data.thumbnails)) {
      throw createError(400, "thumbnails must be an array of strings");
    }

    const duplicatedCode = await Product.exists({ code: data.code });
    if (duplicatedCode) {
      throw createError(400, "Code already exists");
    }

    const newProduct = await Product.create({
      title: data.title,
      description: data.description,
      code: data.code,
      price,
      status: typeof data.status === "boolean" ? data.status : true,
      stock,
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    });

    return newProduct.toObject();
  }

  async updateProduct(pid, fields) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return null;
    }

    const updates = { ...fields };
    delete updates.id;
    delete updates._id;

    if (updates.code !== undefined) {
      const duplicatedCode = await Product.exists({
        code: updates.code,
        _id: { $ne: pid },
      });

      if (duplicatedCode) {
        throw createError(400, "Code already exists");
      }
    }

    if (updates.price !== undefined) {
      updates.price = this.normalizeNumericField(updates.price, "price");
    }

    if (updates.stock !== undefined) {
      updates.stock = this.normalizeNumericField(updates.stock, "stock");
    }

    if (updates.status !== undefined && typeof updates.status !== "boolean") {
      throw createError(400, "status must be a boolean");
    }

    if (updates.thumbnails !== undefined && !Array.isArray(updates.thumbnails)) {
      throw createError(400, "thumbnails must be an array of strings");
    }

    return Product.findByIdAndUpdate(pid, updates, {
      new: true,
      runValidators: true,
      lean: true,
    });
  }

  async deleteProduct(pid) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return false;
    }

    const result = await Product.deleteOne({ _id: pid });
    return result.deletedCount > 0;
  }
}

export const productManager = new ProductManager();
