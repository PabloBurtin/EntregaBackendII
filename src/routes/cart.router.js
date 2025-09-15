import { Router } from "express"
import { getCartById, createCart, addProductToCart, deleteProductFromCart, deleteCart, updateCart, updateProductQuantity, emptyCart } from "../controllers/cart.controller.js"
import { passportAuth } from "../middlewares/passportAuth.js";

const cartRouter = Router();

cartRouter.post("/", passportAuth('jwt'), createCart);
cartRouter.get("/:cid", passportAuth('jwt'), getCartById);
cartRouter.put("/:cid", passportAuth('jwt'), updateCart);
cartRouter.delete('/:cid/empty', passportAuth('jwt'), emptyCart);
cartRouter.delete('/:cid', passportAuth('jwt'), deleteCart);

cartRouter.delete('/:cid/products/:pid', passportAuth('jwt'), deleteProductFromCart);
cartRouter.post("/:cid/products/:pid", passportAuth('jwt'), addProductToCart);
cartRouter.put('/:cid/products/:pid', passportAuth('jwt'), updateProductQuantity);



export default cartRouter