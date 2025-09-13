import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const getCartById = async (req, res) => {
    try{
        console.log ("Accediendo a carrito ID", req.params.cid)

        const cart = await Cart.findById(req.params.cid).populate({
            path: 'products.product',
            model: 'Product',
            select: 'title price thumbnail'}).lean();
        if(!cart) {
            console.log('Carrito no encontrado');
            return res.status(404).json({status: 'error', message: "No se encontro el carrito"});
        }
        
        const validatedProducts = cart.products.map(item =>{
            if(!item.product?.price || isNaN(item.product.price)){
                console.warn('Producto sin precio valido:', item.product?._id);
                item.product.price = 0;
            }
            return item
        })

        const cartWithTotal = {
            ...cart,
            products: validatedProducts.map(item =>({
                ...item,
                itemTotal: Number(item.product.price) * item.quantity
            })),
            cartTotal: validatedProducts.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0)
        };

           console.log('Totales calculados:', cartWithTotal.cartTotal);

        res.render('cart', { cart: cartWithTotal })
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const createCart = async (req, res) => {
      try{
        if (!req.user){
            return res.status(401).json ({status: 'error', message: 'No autenticado'})
        }
        //verifica si el usuario tiene ya un carrito
        const existingCart = await Cart.findOne({ user: req.user.id})
        if (existingCart) {
            return res.status(400).json({
                status: "error",
                message: 'El usuario ya tiene un carrito activo'
            })
        }

        const newCart = await Cart.create ({
            user: req.user.id,
            products: []})

            await User.findByIdAndUpdate(req.user._id, {cartId: newCart._id})

        res.status(201).json({status: 'success', payload: newCart, cartId: newCart._id})
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const addProductToCart = async (req, res) =>{
    const {cid, pid} = req.params;
    const { quantity } = req.body;

    try{
        const cart = await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) 
            {return res.status(404).json({status: 'error', message: 'El carrito no existe'})};
         
        const product = await Product.findById(pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        const productIndex = cart.products.findIndex(
            (item) => item.product.toString() === pid
        );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += parseInt(quantity) || 1;
    } else {
      cart.products.push({ product: pid, quantity: parseInt (quantity) || 1 });
    }

    await cart.save();

    res.status(200).json({ status: "success", payload: cart, message: `Producto agregado al carrito (${quantity} unidad(es))` });
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const deleteProductFromCart = async (req, res)=>{
    const {cid, pid}=req.params
    try{
        const cart =await Cart.findById(cid);
        if(!cart) return res.status(404).json({status: 'error', message: 'El carrito no existe'});

        cart.products = cart.products.filter(p => p.product.toString() !==pid);
        await cart.save();
        res.status(200).json({status: 'success', message: 'Producto retirado'})
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const updateCart = async (req,res) =>{
       const {cid}=req.params
    try{
        const cart =await Cart.findById(cid);
        if(!cart) return res.status(404).json({status: 'error', message: 'El carrito no existe'});

        cart.products = req.body.product;
        await cart.save();
        res.status(200).json({status: 'success', payload: cart})
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const updateProductQuantity = async (req, res) => {
       const {cid, pid}=req.params
       const {quantity} = req.body
    try{
        const cart =await Cart.findById(cid);
        if(!cart) return res.status(404).json({status: 'error', message: 'El carrito no existe'});

        const product = cart.products.find (p => p.product.toString() === pid)
        if (!product) return res.status(404).json({status: 'error', message: 'El producto no existe en el carrito'})
        product.quantity = quantity
        await cart.save();
        res.status(200).json({status: 'success', payload: cart})
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const emptyCart = async (req, res) => {
    try{
        const cart =await Cart.findById(req.params.cid);
        if(!cart) return res.status(404).json({status: 'error', message: 'El carrito no existe'});

        cart.products = []
        await cart.save();
        res.status(200).json({status: 'success', message:'Se vacio el carrito'})
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const deleteCart = async (req, res) =>{
    try{
        const { cid } = req.params;

        const cart = await Cart.findOne({ _id: cid} );
        if(!cart){
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado'});
        }

            await Cart.findByIdAndDelete(cid);

        // Opcional: Limpiar cartId del usuario (si existe)
        await User.updateOne(
            { cartId: cid },
            { $unset: { cartId: 1 } })

        res.status(200).json({
            status: 'success',
            message: 'Carrito elmininado permanentemente'
        })
    }catch(error){
        res.status(500).json({ status: 'error', message: error.message });
    }
}

export {getCartById, createCart, addProductToCart, deleteProductFromCart, updateCart, updateProductQuantity, emptyCart, deleteCart }