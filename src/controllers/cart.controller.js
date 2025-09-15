import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const getCartById = async (req, res) => {
    try{
        console.log ("Accediendo a carrito ID", req.params.cid)
        console.log("Usuario autenticado:", req.user._id)

        const cart = await Cart.findOne({
            _id:req.params.cid,
            user: req.user._id
        }).populate({
            path: 'products.product',
            model: 'Product',
            select: 'title price thumbnail stock'}).lean();
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

        res.status(200).json({status: 'success', payload: cartWithTotal})
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
        const existingCart = await Cart.findOne({ user: req.user._id})
        if (existingCart) {
          if (req.body.redirect === 'true' || req.query.redirect === 'true') {
                return res.redirect('/products?error=Ya+tienes+un+carrito+activo');
            }
            return res.status(400).json({
                status: "error",
                message: 'El usuario ya tiene un carrito activo'
            });
        }

        const newCart = await Cart.create ({
            user: req.user._id,
            products: []})

            await User.findByIdAndUpdate(req.user._id, {cartId: newCart._id})
            if (req.body.redirect === 'true' || req.query.redirect === 'true') {
            return res.redirect('/products?success=Carrito+creado+exitosamente');
        }
            res.status(201).json({status: 'success', payload: newCart, cartId: newCart._id})
    }catch(error){
        if (req.query.redirect) {
            return res.redirect('/products?error=Error+al+crear+carrito');
        }
        res.status(500).json({status: 'error', message: error.message});
    }
}

const addProductToCart = async (req, res) =>{
    const {cid, pid} = req.params;
    const { quantity } = req.body;
    try{
        const cart = await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) {
            if (req.query.redirect) {
                return res.redirect('/products?error=Carrito+no+encontrado');
            }
            return res.status(404).json({status: 'error', message: 'El carrito no existe'})};
         
        const product = await Product.findById(pid);
        if (!product) {
             if (req.query.redirect) {
                return res.redirect('/products?error=Producto+no+encontrado');
            }
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });}

        if(product.stock < (parseInt(quantity)|| 1)){
             if (req.query.redirect) {
                return res.redirect('/products?error=Stock+insuficiente');
            }
            return res.status(400).json({status: 'error', message: 'Stock insuficiente'})
        }

        const productIndex = cart.products.findIndex(
            (item) => item.product.toString() === pid
        );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += parseInt(quantity) || 1;
    } else {
      cart.products.push({ product: pid, quantity: parseInt (quantity) || 1 });
    }

    await cart.save();

    if (req.query.redirect) {
            return res.redirect('/products?success=Producto+agregado+al+carrito');
        }

    res.status(200).json({ status: "success", payload: cart, message: `Producto agregado al carrito (${quantity} unidad(es))` });
    }catch(error){
          if (req.query.redirect) {
            return res.redirect('/products?error=Error+al+agregar+producto');
        }
        res.status(500).json({status: 'error', message: error.message});
    }
}

const deleteProductFromCart = async (req, res)=>{
    const {cid, pid}=req.params
    try{
        const cart =await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) {
            if (req.query.redirect === 'true') {
                return res.redirect('/carts/' + cid + '?error=Carrito+no+encontrado');
            }
            return res.status(404).json({status: 'error', message: 'El carrito no existe'})
        };

        cart.products = cart.products.filter(p => p.product.toString() !== pid);
        await cart.save();

        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?success=Producto+eliminado');
        }

        res.status(200).json({status: 'success', payload: cart, message: 'Producto retirado'})
    }catch(error){
        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?error=Error+al+eliminar+producto');
        }
        res.status(500).json({status: 'error', message: error.message});
    }
}

const updateCart = async (req,res) =>{
    const {cid}=req.params;
    try{
        const cart = await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) return res.status(404).json({status: 'error', message: 'El carrito no existe o no tienes permisos'});

        cart.products = req.body.products;
        await cart.save();
        
        // DEVOLVER JSON CON EL CARRITO ACTUALIZADO
        res.status(200).json({status: 'success', payload: cart});
        
    }catch(error){
        res.status(500).json({status: 'error', message: error.message});
    }
}

const updateProductQuantity = async (req, res) => {
    const {cid, pid}=req.params;
    const {quantity} = req.body;
    try{
        const cart = await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) {
            if (req.query.redirect === 'true') {
                return res.redirect('/carts/' + cid + '?error=Carrito+no+encontrado');
            }
            return res.status(404).json({status: 'error', message: 'El carrito no existe o no tienes permisos'});
        }

        const product = cart.products.find(p => p.product.toString() === pid);
        if (!product) {
            if (req.query.redirect === 'true') {
                return res.redirect('/carts/' + cid + '?error=Producto+no+encontrado+en+el+carrito');
            }
            return res.status(404).json({status: 'error', message: 'El producto no existe en el carrito'});
        }
        
        product.quantity = quantity;
        await cart.save();

        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?success=Cantidad+actualizada');
        }
        
        res.status(200).json({status: 'success', payload: cart});
        
    }catch(error){
        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?error=Error+al+actualizar+cantidad');
        }
        res.status(500).json({status: 'error', message: error.message});
    }
}

const emptyCart = async (req, res) => {
    try{
        const { cid } = req.params;
        
        const cart = await Cart.findOne({_id: cid, user: req.user._id});
        if(!cart) {
            if (req.query.redirect === 'true') {
                return res.redirect('/carts/' + cid + '?error=Carrito+no+encontrado');
            }
            return res.status(404).json({status: 'error', message: 'El carrito no existe o no tienes permisos'});
        }

        cart.products = [];
        await cart.save();
        
        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?success=Carrito+vaciado');
        }
        
        res.status(200).json({status: 'success', payload: cart});
        
    }catch(error){
        if (req.query.redirect === 'true') {
            return res.redirect('/carts/' + cid + '?error=Error+al+vaciar+carrito');
        }
        res.status(500).json({status: 'error', message: error.message});
    }
}


const deleteCart = async (req, res) =>{
    try{
        const { cid } = req.params;

        const cart = await Cart.findOne({ _id: cid, user: req.user._id });
        if(!cart){
            if (req.query.redirect === 'true') {
                return res.redirect('/products?error=Carrito+no+encontrado');
            }
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado o no autorizado'});
        }

        await Cart.findByIdAndDelete(cid);

        await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { cartId: 1 } }
        );

        if (req.query.redirect === 'true') {
            return res.redirect('/products?success=Carrito+eliminado');
        }

        res.status(200).json({status: 'success', message: 'Carrito eliminado'});
        
    }catch(error){
        if (req.query.redirect === 'true') {
            return res.redirect('/products?error=Error+al+eliminar+carrito');
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

export {getCartById, createCart, addProductToCart, deleteProductFromCart, updateCart, updateProductQuantity, emptyCart, deleteCart }