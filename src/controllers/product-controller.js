import { productService } from "../services/product-service.js";

class ProductController {
  constructor(service) {
    this.service = service;
  }

  getAll = async (req, res, next) => {
    try {
      const { limit, page, sort, query } = req.query;
      const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

      const response = await this.service.getPaginated({
        limit,
        page,
        sort,
        query,
        baseUrl,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const response = await this.service.getById(pid);

      if (!response) {
        const notFoundError = new Error("Product not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const response = await this.service.addProduct(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const response = await this.service.updateProduct(pid, req.body);

      if (!response) {
        const notFoundError = new Error("Product not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const deleted = await this.service.deleteProduct(pid);

      if (!deleted) {
        const notFoundError = new Error("Product not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.status(200).json({ status: "success", message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController(productService);
