import { Product } from "../models/product-model.js";

class ProductRepository {
  constructor(model) {
    this.model = model;
  }

  getAll = async () => {
    return this.model.find().lean();
  };

  paginate = async (filter, options) => {
    return this.model.paginate(filter, options);
  };

  getById = async (id) => {
    return this.model.findById(id).lean();
  };

  create = async (body) => {
    return this.model.create(body);
  };

  update = async (id, body) => {
    return this.model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      lean: true,
    });
  };

  delete = async (id) => {
    return this.model.deleteOne({ _id: id });
  };

  existsByCode = async (code) => {
    return this.model.exists({ code });
  };

  existsByCodeAndDifferentId = async (id, code) => {
    return this.model.exists({
      code,
      _id: { $ne: id },
    });
  };

  getExistingIdsCount = async (ids) => {
    const products = await this.model.find({ _id: { $in: ids } }).select("_id").lean();
    return products.length;
  };
}

export const productRepository = new ProductRepository(Product);
