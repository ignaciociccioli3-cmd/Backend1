import mongoose from "mongoose";
import { productRepository } from "../repositories/product-repository.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class ProductService {
  constructor(repository) {
    this.repository = repository;
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

    if (normalizedQuery === "true" || normalizedQuery === "available") {
      return { status: true };
    }

    if (normalizedQuery === "false" || normalizedQuery === "unavailable") {
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

  getAll = async () => {
    return this.repository.getAll();
  };

  getPaginated = async ({ limit, page, sort, query, baseUrl }) => {
    const parsedLimit = Number.parseInt(limit, 10);
    const parsedPage = Number.parseInt(page, 10);

    const normalizedLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
    const normalizedPage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const filter = this.normalizeQueryFilter(query);
    const sortOption = this.normalizeSort(sort);

    const options = {
      limit: normalizedLimit,
      page: normalizedPage,
      lean: true,
    };

    if (sortOption) {
      options.sort = sortOption;
    }

    const result = await this.repository.paginate(filter, options);

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
  };

  getById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.repository.getById(id);
  };

  addProduct = async (body) => {
    this.validateRequiredFields(body);

    const price = this.normalizeNumericField(body.price, "price");
    const stock = this.normalizeNumericField(body.stock, "stock");

    if (body.status !== undefined && typeof body.status !== "boolean") {
      throw createError(400, "status must be a boolean");
    }

    if (body.thumbnails !== undefined && !Array.isArray(body.thumbnails)) {
      throw createError(400, "thumbnails must be an array of strings");
    }

    const duplicatedCode = await this.repository.existsByCode(body.code);
    if (duplicatedCode) {
      throw createError(400, "Code already exists");
    }

    const created = await this.repository.create({
      title: body.title,
      description: body.description,
      code: body.code,
      price,
      status: typeof body.status === "boolean" ? body.status : true,
      stock,
      category: body.category,
      thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : [],
    });

    return created.toObject();
  };

  updateProduct = async (id, fields) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const updates = { ...fields };
    delete updates.id;
    delete updates._id;

    if (updates.code !== undefined) {
      const duplicatedCode = await this.repository.existsByCodeAndDifferentId(
        id,
        updates.code
      );

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

    return this.repository.update(id, updates);
  };

  deleteProduct = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.repository.delete(id);
    return result.deletedCount > 0;
  };
}

export const productService = new ProductService(productRepository);
