import { Router } from "express"
import { getAllProducts, getProductById, createProduct, updatedProduct, deleteProduct } from "../controllers/product.controller.js"
import uploader from "../utils/uploader.js"

const productRouter = Router ();

productRouter.get ("/", getAllProducts);

productRouter.get("/:pid", getProductById);
    
productRouter.post("/", uploader.single('thumbnail'), createProduct);
    
productRouter.put("/:pid", updatedProduct);
    
productRouter.delete("/:pid", deleteProduct);

export default productRouter