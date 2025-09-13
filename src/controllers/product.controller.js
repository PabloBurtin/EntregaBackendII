import Product from "../models/product.model.js";

const getAllProducts =  async (req, res) =>{
    try { 
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = query
            ?{$or:[{category: query}, {status: query === 'true' }]} : {};

            const sortOption = sort === 'asc' ? {price: 1} : sort === 'desc' ? { price: -1 } : {};

            const options = {
                page: parseInt (page),
                limit: parseInt (limit),
                sort: sortOption,
                lean: true
            };

            const products = await Product.paginate (filter, options);

            res.status(200).json ({
                status: 'success',
                payload: products,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `?page=${products.prevPage}&limit=${limit}` : null,
                nextLink: products.hasNextPage ? `?page=${products.nextPage}&limit=${limit}` : null,
            })

    }catch(error){
        res.status(500).json({message: error.message})
    }
}

const getProductById = async (req,res) => {
        try{
            const { id } = req.params;
            const product = await Product.findById (id).lean();
            if (!product) return res.status(404).json ({status: 'error', message: 'Producto no encontrado' });
            res.status(200).json({status:'success', payload: {...product.toObject()}});
        }catch(error){
            res.status(500).json({status:'error', message: error.message})
        }
}

const createProduct = async (req, res) =>{
    try{
        const { file } = req;
        const newProduct = {...req.body,
            thumbnail: file ? `/Imagenes/${file.filename}` : 'default.jpg',
        };
        const product = new Product (newProduct)
        await product.save ();
        res.status(201).json({status: "success", payload: product});
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

const updatedProduct = async (req, res) => {
    try{
        const pid = req.params.pid;
        const updateData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, { new: true, runValidators: true, lean: true });
        if (!updatedProduct) return res.status(404).json({status: "error", message: "Producto no encontrado"})

        res.status(200).json({status: "success", payload: updatedProduct})

    }catch (error){
        res.status(500).json ({ status: "error", message: "Error al actualizar el producto" })
    }
}

const deleteProduct = async (req, res) => {
     try{
        const pid = req.params.pid;
        
        const deletedProduct = await Product.findByIdAndDelete(pid);
        if (!deletedProduct) return res.status(404).json({status: "error", message: "Producto no encontrado"})

        res.status(200).json({status: "success", payload: deletedProduct})
        
    }catch (error){
        res.status(500).json ({ status: "error", message: "Error al borrar el producto" })
    }
}

export {getAllProducts, getProductById, createProduct, updatedProduct, deleteProduct}
