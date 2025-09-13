import express from "express"
import handlebars from "express-handlebars"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import passport from "passport"
import http from "http"
import { Server } from "socket.io"

//Codigos importados
import connectDB from "./src/config/db.js"
import userRouter from "./src/routes/user.router.js"
import productRouter from "./src/routes/product.router.js"
import cartRouter from "./src/routes/cart.router.js"
import viewsRouter from "./src/routes/view.router.js"
import sessionRouter from "./src/routes/session.router.js"
import initializePassport from "./src/config/passport.config.js"

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server (server)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('public'));

//Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', 'views');

initializePassport();
app.use(passport.initialize())

//Rutas
app.use("/", viewsRouter);
app.use("/api/users", userRouter);
app.use("/api/session", sessionRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

io.on("connection", (socket)=> {
  // console.log("Nuevo usuario conectado");

  socket.on("newProduct", async(productData)=> {
    try {
      const newProduct = new  Product (productData);
      await newProduct.save()
    
      const products = await Product.find().lean();
      io.emit("productAdded", newProduct);
    } catch (error) {
      socket.emit('Error', {message: error.message});
    }
  });

    socket.on('delete-product', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const products = await Product.find().lean();
      io.emit('products', products);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });


  socket.on('request-products', async () => {
    try {
      const products = await Product.find().lean();
      socket.emit('products', products);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

});

const PORT = process.env.PORT || 8080
connectDB().then(()=>{
    server.listen(PORT, ()=>{
        console.log(`Aplicación corriento en el puerto: ${PORT}`)
    })
}).catch((error) =>{
    console.error ({error: error.message})
    process.exit(1)
})