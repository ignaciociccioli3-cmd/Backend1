import { Cart } from "../models/cart-model.js";

class CartRepository {
  constructor(model) {
    this.model = model;
  }

  create = async (body = { products: [] }) => {
    return this.model.create(body);
  };

  getById = async (id) => {
    return this.model.findById(id).lean();
  };

  getByIdPopulated = async (id) => {
    return this.model.findById(id).populate("products.product").lean();
  };

  getDocumentById = async (id) => {
    return this.model.findById(id);
  };

  save = async (document) => {
    await document.save();
    return document;
  };

  populateProducts = async (document) => {
    await document.populate("products.product");
    return document;
  };
}

export const cartRepository = new CartRepository(Cart);
