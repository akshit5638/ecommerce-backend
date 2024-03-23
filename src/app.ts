
import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./utils/features";

//importing user
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-backend');

//importing user
import userRoute from './routes/user'
import productRoute from './routes/product'
import { errorMiddleware } from "./middlewares/error";


connectDB();

const port = 4000;
const app = express();


//using routes
app.use(express.json());// This middleware is responsible for parsing incoming request bodies in JSON format. ITS postion is important as it is middleware and should be used before all routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute)
app.get('/', (req, res) => {
    res.send('hello man whats up');
})
app.use('/uploads', express.static('uploads'));// used for multer stuff
app.use(errorMiddleware)
app.listen(port, () => {
    console.log(`server is  working on ${port}`)
})

