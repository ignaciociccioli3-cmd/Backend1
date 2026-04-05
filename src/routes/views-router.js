import { Router } from "express";
import { viewController } from "../controllers/view-controller.js";

const viewsRouter = Router();

viewsRouter.get("/", viewController.redirectToProducts);
viewsRouter.get("/products", viewController.renderProducts);
viewsRouter.get("/products/:pid", viewController.renderProductDetail);
viewsRouter.get("/carts/:cid", viewController.renderCart);
viewsRouter.get("/realtimeproducts", viewController.renderRealtimeProducts);

export { viewsRouter };
