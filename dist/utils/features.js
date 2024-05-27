"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventories = exports.calculatePercentage = exports.reduceStock = exports.invalidateCache = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../app");
const product_1 = require("../models/product");
const connectDB = (uri) => {
    mongoose_1.default.connect(uri, {
        dbName: "Ecommerce2024"
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log("error not connected"));
};
exports.connectDB = connectDB;
const invalidateCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        app_1.myCache.del(productKeys);
    }
    if (order) {
        const ordersKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        app_1.myCache.del(ordersKeys);
    }
    // if (admin) {
    //   myCache.del([
    //     "admin-stats",
    //     "admin-pie-charts",
    //     "admin-bar-charts",
    //     "admin-line-charts",
    //   ]);
    // }
};
exports.invalidateCache = invalidateCache;
const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await product_1.Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
exports.reduceStock = reduceStock;
const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
exports.calculatePercentage = calculatePercentage;
const getInventories = async ({ categories, productsCount, }) => {
    const categoriesCountPromise = categories.map((category) => product_1.Product.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        });
    });
    return categoryCount;
};
exports.getInventories = getInventories;
