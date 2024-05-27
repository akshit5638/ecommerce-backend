"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.newProduct = exports.getlatestProducts = exports.getSingleProduct = exports.getAllProducts = exports.getAllCategories = exports.getAdminProducts = exports.deleteProduct = void 0;
const error_1 = require("../middlewares/error");
const utility_class_1 = __importDefault(require("../utils/utility-class"));
const product_1 = require("../models/product");
const fs_1 = require("fs");
const app_1 = require("../app");
const features_1 = require("../utils/features");
exports.deleteProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const product = await product_1.Product.findById(req.params.id);
    if (!product)
        return next(new utility_class_1.default("Product Not Found", 404));
    (0, fs_1.rm)(product.photo, () => {
        console.log("Product Photo Deleted");
    });
    await product.deleteOne();
    (0, features_1.invalidateCache)({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});
exports.getAdminProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    // const products = await Product.find({});
    let products;
    if (app_1.myCache.has("all-products"))
        products = JSON.parse(app_1.myCache.get("all-products"));
    else {
        products = await product_1.Product.find({});
        app_1.myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
exports.getAllCategories = (0, error_1.TryCatch)(async (req, res, next) => {
    let categories;
    if (app_1.myCache.has("categories"))
        categories = JSON.parse(app_1.myCache.get("categories"));
    else {
        categories = await product_1.Product.distinct("category");
        app_1.myCache.set("categories", JSON.stringify(categories));
    }
    // const categories = await Product.distinct("category");
    // distinct(field) gives all distinct values of field present
    return res.status(200).json({
        success: true,
        categories,
    });
});
exports.getAllProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    // const products = await Product.find({
    // name: {
    //     $regex: search,
    //     $options: "i",
    // },
    // price: {
    //     $lte: Number(price),
    // },
    //     category, // key value are same so we can pass it like this
    // })
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    // const products = await Product.find(baseQuery).sort(sort && { price: sort === "asc" ? 1 : -1 })
    //     .limit(limit)
    //     .skip(skip);
    //     // as this will show product equal to limit so to get all product run following
    // const filteredOnlyProduct = await Product.find(baseQuery)
    // i put {baseQuery} and faced error for 30 min
    // .find() expect an object not nested object wrapping
    // all this can be done by promise as first await will run and after it is done second await will run but in promise both run parallely
    const productsPromise = product_1.Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const [products, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        product_1.Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
});
exports.getSingleProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    // const product = await Product.findById(req.params.id);
    let product;
    const id = req.params.id;
    if (app_1.myCache.has(`product-${id}`))
        product = JSON.parse(app_1.myCache.get(`product-${id}`));
    else {
        product = await product_1.Product.findById(id);
        if (!product)
            return next(new utility_class_1.default("Product Not Found", 404));
        app_1.myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});
exports.getlatestProducts = (0, error_1.TryCatch)(async (req, res, next) => {
    let products;
    if (app_1.myCache.has("latest-products"))
        products = JSON.parse(app_1.myCache.get("latest-products"));
    else {
        products = await product_1.Product.find({}).sort({ createdAt: -1 }).limit(5);
        app_1.myCache.set("latest-products", JSON.stringify(products));
    }
    // const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // -1 means desending order and limit means how many product to show so by above line we will get latest 5 product
    return res.status(200).json({
        success: true,
        products,
    });
});
exports.newProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new utility_class_1.default("Please add Photo", 400));
    if (!name || !price || !stock || !category) {
        // delete the photo as it is created when we asked for it in const photo
        (0, fs_1.rm)(photo.path, () => {
            console.log("Deleted");
        });
        return next(new utility_class_1.default("Please enter All Fields", 400));
    }
    // i accidently created upload folder in src and it took 1 hour to find the mistake and photo validation error was occuring
    // console.log(1);
    await product_1.Product.create({
        name,
        photo: photo.path,
        price,
        stock,
        category: category.toLowerCase(),
    });
    // console.log(3);
    // invalidateCache({ product: true, admin: true });
    (0, features_1.invalidateCache)({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
exports.updateProduct = (0, error_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await product_1.Product.findById(id);
    if (!product)
        return next(new utility_class_1.default("Product Not Found", 404));
    if (photo) {
        (0, fs_1.rm)(product.photo, () => {
            console.log("Old Photo Deleted");
        });
        // product.photo!. This is TypeScript syntax, specifically the "non-null assertion operator" (!), which tells the TypeScript compiler to treat the expression as definitely not being null or undefined.
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    (0, features_1.invalidateCache)({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});
