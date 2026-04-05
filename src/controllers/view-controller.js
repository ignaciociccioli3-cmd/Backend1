import { productService } from "../services/product-service.js";
import { cartService } from "../services/cart-service.js";

class ViewController {
  constructor(productsService, cartsService) {
    this.productsService = productsService;
    this.cartsService = cartsService;
  }

  redirectToProducts = (_req, res) => {
    res.redirect("/products");
  };

  renderProducts = async (req, res, next) => {
    try {
      const { limit, page, sort, query } = req.query;

      const response = await this.productsService.getPaginated({
        limit,
        page,
        sort,
        query,
        baseUrl: "/products",
      });

      res.render("home", {
        title: "Productos",
        pageTitle: "Listado de productos",
        ...response,
        queryValue: query || "",
        sortValue: sort || "",
        limitValue:
          Number.isInteger(Number.parseInt(limit, 10)) && Number.parseInt(limit, 10) > 0
            ? Number.parseInt(limit, 10)
            : 10,
      });
    } catch (error) {
      next(error);
    }
  };

  renderProductDetail = async (req, res, next) => {
    try {
      const { pid } = req.params;
      const product = await this.productsService.getById(pid);

      if (!product) {
        const notFoundError = new Error("Product not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.render("productDetail", {
        title: product.title,
        pageTitle: "Detalle de producto",
        product,
        selectedCartId: req.query.cid || "",
      });
    } catch (error) {
      next(error);
    }
  };

  renderCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const cart = await this.cartsService.getById(cid);

      if (!cart) {
        const notFoundError = new Error("Cart not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      res.render("cart", {
        title: "Carrito",
        pageTitle: `Carrito ${cid}`,
        cart,
        products: cart.products,
      });
    } catch (error) {
      next(error);
    }
  };

  renderRealtimeProducts = async (_req, res, next) => {
    try {
      const products = await this.productsService.getAll();

      res.render("realTimeProducts", {
        title: "Real Time Products",
        pageTitle: "Productos en tiempo real",
        products,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const viewController = new ViewController(productService, cartService);
