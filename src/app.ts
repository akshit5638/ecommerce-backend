
import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./utils/features";
import NodeCache from "node-cache";

//importing user
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-backend');

//importing user
import userRoute from './routes/user';
import productRoute from './routes/product';
import paymentRoute from "./routes/payment.js";
import orderRoute from "./routes/order.js";
import dashboardRoute from "./routes/stats.js";
import { errorMiddleware } from "./middlewares/error";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors"

config({
    path: "./.env",
});
const mongoURI = process.env.MONGO_URI || "";

connectDB(mongoURI);
export const myCache = new NodeCache();
const port = process.env.PORT || 4000;
const app = express();
//using routes

app.use(express.json());// This middleware is responsible for parsing incoming request bodies in JSON format. ITS postion is important as it is middleware and should be used before all routes
app.use(morgan("dev"));
app.use(cors());

app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/order', orderRoute)
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/dashboard', dashboardRoute)
app.get('/', (req, res) => {
    res.send('hello man whats up');
})
app.use('/uploads', express.static('uploads'));// used for multer stuff
app.use(errorMiddleware)
app.listen(port, () => {
    console.log(`server is  working on ${port}`)
})

