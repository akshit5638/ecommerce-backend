"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const features_1 = require("./utils/features");
//importing user
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-backend');
//importing user
const user_1 = __importDefault(require("./routes/user"));
const product_1 = __importDefault(require("./routes/product"));
const error_1 = require("./middlewares/error");
(0, features_1.connectDB)();
const port = 4000;
const app = (0, express_1.default)();
//using routes
app.use(express_1.default.json()); // This middleware is responsible for parsing incoming request bodies in JSON format. ITS postion is important as it is middleware and should be used before all routes
app.use('/api/v1/user', user_1.default);
app.use('/api/v1/product', product_1.default);
app.get('/', (req, res) => {
    res.send('hello man whats up');
});
app.use('/uploads', express_1.default.static('uploads')); // used for multer stuff
app.use(error_1.errorMiddleware);
app.listen(port, () => {
    console.log(`server is  working on ${port}`);
});
