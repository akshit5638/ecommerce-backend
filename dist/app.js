"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCache = void 0;
const express_1 = __importDefault(require("express"));
const features_1 = require("./utils/features");
const node_cache_1 = __importDefault(require("node-cache"));
//importing user
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce-backend');
//importing user
const user_1 = __importDefault(require("./routes/user"));
const product_1 = __importDefault(require("./routes/product"));
const payment_js_1 = __importDefault(require("./routes/payment.js"));
const order_js_1 = __importDefault(require("./routes/order.js"));
const stats_js_1 = __importDefault(require("./routes/stats.js"));
const error_1 = require("./middlewares/error");
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)({
    path: "./.env",
});
const mongoURI = process.env.MONGO_URI || "";
(0, features_1.connectDB)(mongoURI);
exports.myCache = new node_cache_1.default();
const port = process.env.PORT || 4000;
const app = (0, express_1.default)();
//using routes
app.use(express_1.default.json()); // This middleware is responsible for parsing incoming request bodies in JSON format. ITS postion is important as it is middleware and should be used before all routes
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use('/api/v1/user', user_1.default);
app.use('/api/v1/product', product_1.default);
app.use('/api/v1/order', order_js_1.default);
app.use('/api/v1/payment', payment_js_1.default);
app.use('/api/v1/dashboard', stats_js_1.default);
app.get('/', (req, res) => {
    res.send('hello man whats up');
});
app.use('/uploads', express_1.default.static('uploads')); // used for multer stuff
app.use(error_1.errorMiddleware);
app.listen(port, () => {
    console.log(`server is  working on ${port}`);
});
