import { Router } from "express";
import { cartController } from "../controllers/cart-controller.js";

const cartRouter = Router();

cartRouter.post("/", cartController.create);
cartRouter.get("/:cid", cartController.getById);
cartRouter.post("/:cid/products/:pid", cartController.addProduct);
cartRouter.delete("/:cid/products/:pid", cartController.removeProduct);
cartRouter.put("/:cid", cartController.replaceProducts);
cartRouter.put("/:cid/products/:pid", cartController.updateProductQuantity);
cartRouter.delete("/:cid", cartController.clear);

export { cartRouter };
