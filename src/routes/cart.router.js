import { Router } from "express"
import { getCartById, createCart, addProductToCart, deleteProductFromCart, deleteCart, updateCart, updateProductQuantity, emptyCart } from "../controllers/cart.controller.js"

const cartRouter = Router();

cartRouter.post("/", createCart);
cartRouter.get("/:cid", getCartById);
cartRouter.post ("/:cid/products/:pid", addProductToCart);
cartRouter.put ("/:cid", updateCart);
cartRouter.put('/:cid/products/:pid', updateProductQuantity);
cartRouter.delete('/:cid/products/:pid', deleteProductFromCart);
cartRouter.delete('/:cid/empty', emptyCart)
cartRouter.delete('/:cid', deleteCart)

export default cartRouter