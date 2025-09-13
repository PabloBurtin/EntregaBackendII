import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js"
import User from "../models/user.model.js";
import { passportAuth } from "../middlewares/passportAuth.js";

const viewsRouter = Router();


viewsRouter.get ('/products', async (req, res) => {
  try{
    const {limit = 10, page = 1, sort, query} = req.query;

    const filter = query
    ? {$or : [{category: query}, {status: query === "true"}]}:{};

    const sortOption = sort === 'asc' ? {price: 1} : sort === 'desc' ? {price: -1}: {};

    const option = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
      lean: true
    };

    const result = await Product.paginate(filter, option);

    res.render ('products', {
      products: result.docs,
      user: req.user ? {
        _id: req.user._id,
        cartId: req.user.cartId
      } : null,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null
    });
  }catch (error){
    res.status(500).send('Error en la carga de productos.')

  }
})

viewsRouter.get('/products/:pid', async (req, res)=>{
  try{
    const { pid } = req.params;
    const product = await Product.findById(pid).lean();
    if (!product) return res.status(404).send ('El producto no fue encontrado o no existe');
    res.render ('productDetail', {product});
  }catch(error){
    res.status(500).send('Error al cargar el producto');
  }
})

viewsRouter.get('/carts/:cid', async (req,res)=>{
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate({
      path: 'products.product',
      model: 'Product',
      select: 'title price thumbnail'
    }).lean();
    
    if (!cart) return res.status(404).send('El carrito no fue encontrado o no existe');

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

    res.render('cart', { cart: cartWithTotal });
  } catch(error) {
    res.status(500).send('Error al cargar el carrito');
  }
});

viewsRouter.get("/realtimeproducts", async(req, res)=> {
  try{
    const products = await Product.find().lean();
    res.render("realTimeProducts", { products });
  }catch(error){
    res.status(500).send({ message: error.message });
  }
});

viewsRouter.get ("/", (req, res)=>{
    res.render("index")
})

viewsRouter.get ("/login", (req, res)=>{
    console.log('Cookies received:', req.signedCookies)
    if (req.signedCookies.currentUser) {
        return res.redirect('/current');
    }
    
    // Mostrar mensaje de error si existe
    const errorMessage = req.query.error === 'invalid_credentials' 
        ? 'Usuario o contraseña incorrectos' 
        : null;
    
    res.render("login", { error: errorMessage });
})

viewsRouter.get ("/register", (req, res)=>{
    res.render("register")
})
viewsRouter.get ("/profile", (req, res)=>{
    const { firts_name, last_name, age, role } = req.user
    res.render ("profile", { firts_name, last_name, age, role }) 
})
viewsRouter.get ("/failed", (req, res)=>{
    res.render("failed")
})
viewsRouter.get('/current', passportAuth('jwt'), async (req, res) => {
    const user = await User.findById (req.user.id).lean()
    res.render('current', { user })
}) 

export default viewsRouter;