import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js"
import User from "../models/user.model.js";
import { passportAuth } from "../middlewares/passportAuth.js";
import { ProductService } from "../utils/product.service.js";

const viewsRouter = Router();


//Pagina principal
viewsRouter.get('/', (req, res)=>{
  res.render('index')
})

//Login
viewsRouter.get('/login', (req, res)=>{
  if (req.signedCookies.currentUser){
    return res.redirect('current')
  }

  const errorMessage = req.query.error === 'invalid_credentials'
  ? 'Usuario o contraseña incorrectos': null;

  res.render('login', {error: errorMessage})
})

//Registro
viewsRouter.get('/register', (req, res)=>{
  if (req.signedCookies.currentUser){
    return res.redirect('current')
  }
  res.render('register')
})

//Perfil
viewsRouter.get('/profile', passportAuth('jwt'), (req, res)=>{
  const {firts_name, last_name, age, role } = req.user;
  res.render("profile", {firts_name, last_name, age, role})
})

//Current
viewsRouter.get('/current', passportAuth('jwt'), async (req, res)=>{
  try{
    const user = await User.findById(req.user.id).lean();
    res.render('current', {user})
  }catch(error){
    res.status(500).json({status: 'error', message:'Error al ingresar'})
    res.redirect('/failed')
  }
})

//Logout
viewsRouter.get('/logout', (req, res)=>{
  res.clearCookie('currentUser', {
        httpOnly: true,
        signed: true
    })
  res.render('index')
})

//Pagina de error
viewsRouter.get('/failed', (req, res)=>{
  res.render('failed', {message})
})

//Productos
viewsRouter.get('/products', async (req, res)=>{
  try{
    const result = await ProductService.getPaginatedProducts(req.query);
    const links = await ProductService.buildPaginationLinks(
      result, req.query.limit, req.query.sort, req.query.query, '/products'
    );

    let userWithCart = null

    if(req.user){
      userWithCart = await User.findById(req.user._id).populate('cartId').lean()
    }
    res.render('products', {
      products: result.docs,
      user: userWithCart ? {
        _id: userWithCart._id,
        cartId: userWithCart.cartId ? userWithCart.cartId._id : null
      } : null,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: links.prevLink,
      nextLink: links.nextLink
    })
  }catch(error){
    res.status(500).json({status: 'error', message: 'Error en la carga de productos'})
  }
})

// Detalle de producto
viewsRouter.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await Product.findById(pid).lean();
        
        if (!product) {
            return res.status(404).send('El producto no fue encontrado o no existe');
        }
        
        res.render('productDetail', { product });
    } catch(error) {
        console.error('Error loading product:', error);
        res.status(500).send('Error al cargar el producto');
    }
});

// Carrito
viewsRouter.get('/carts/:cid', passportAuth('jwt'), async (req, res) => {
    try {
        const { cid } = req.params;
        
        // Primero verificar que el carrito pertenezca al usuario
        const cart = await Cart.findOne({ 
            _id: cid, 
            user: req.user._id 
        }).populate({
            path: 'products.product',
            model: 'Product',
            select: 'title price thumbnail stock'
        }).lean();
        
        if (!cart) {
            return res.status(404).render('error', { message: 'El carrito no fue encontrado o no tienes permisos' });
        }

        const validatedProducts = cart.products.map(item => {
            if (!item.product?.price || isNaN(item.product.price)) {
                item.product.price = 0;
            }
            return item;
        });

        const cartWithTotal = {
            ...cart,
            products: validatedProducts.map(item => ({
                ...item,
                itemTotal: Number(item.product.price) * item.quantity
            })),
            cartTotal: validatedProducts.reduce(
                (total, item) => total + (Number(item.product.price) * item.quantity), 
                0
            )
        };

        // AQUÍ SÍ HACEMOS RENDER
        res.render('cart', { cart: cartWithTotal });
        
    } catch(error) {
        console.error('Error loading cart:', error);
        res.status(500).render('error', { message: 'Error al cargar el carrito' });
    }
});

// Productos en tiempo real
viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await Product.find().lean();
        res.render("realTimeProducts", { products });
    } catch(error) {
        console.error('Error loading realtime products:', error);
        res.status(500).send({ message: error.message });
    }
});

export default viewsRouter;
