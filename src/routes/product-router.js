import { Router } from "express";
import { productController } from "../controllers/product-controller.js";

const productRouter = Router();

productRouter.get("/", productController.getAll);
productRouter.get("/:pid", productController.getById);
productRouter.post("/", productController.create);
productRouter.put("/:pid", productController.update);
productRouter.delete("/:pid", productController.delete);

export { productRouter };
