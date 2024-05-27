import { TryCatch } from "../middlewares/error";
import { adminOnly } from "../middlewares/auth";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types";
import { Request } from "express";
import ErrorHandler from "../utils/utility-class";
import { Product } from "../models/product";
import { rm } from "fs";
import { myCache } from "../app";
import { invalidateCache } from "../utils/features";

export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    rm(product.photo!, () => {
        console.log("Product Photo Deleted");
    });

    await product.deleteOne();
    invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});
export const getAdminProducts = TryCatch(async (req, res, next) => {
    // const products = await Product.find({});
    let products;
    if (myCache.has("all-products"))
        products = JSON.parse(myCache.get("all-products") as string);
    else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;

    if (myCache.has("categories"))
        categories = JSON.parse(myCache.get("categories") as string);
    else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }
    // const categories = await Product.distinct("category");

    // distinct(field) gives all distinct values of field present
    return res.status(200).json({
        success: true,
        categories,
    })
});
export const getAllProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
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
    const baseQuery: BaseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };

    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category) baseQuery.category = category;
    // const products = await Product.find(baseQuery).sort(sort && { price: sort === "asc" ? 1 : -1 })
    //     .limit(limit)
    //     .skip(skip);
    //     // as this will show product equal to limit so to get all product run following
    // const filteredOnlyProduct = await Product.find(baseQuery)
    // i put {baseQuery} and faced error for 30 min
    // .find() expect an object not nested object wrapping
    // all this can be done by promise as first await will run and after it is done second await will run but in promise both run parallely
    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
    ]);
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
        success: true,
        products,
        totalPage
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    // const product = await Product.findById(req.params.id);
    let product;
    const id = req.params.id;
    if (myCache.has(`product-${id}`))
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    else {
        product = await Product.findById(id);

        if (!product) return next(new ErrorHandler("Product Not Found", 404));

        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product,
    });

});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("latest-products"))
        products = JSON.parse(myCache.get("latest-products") as string);
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-products", JSON.stringify(products));
    }
    // const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // -1 means desending order and limit means how many product to show so by above line we will get latest 5 product
    return res.status(200).json({
        success: true,
        products,
    });
});
export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
        // delete the photo as it is created when we asked for it in const photo
        rm(photo.path, () => {
            console.log("Deleted");
        });

        return next(new ErrorHandler("Please enter All Fields", 400));
    }
    // i accidently created upload folder in src and it took 1 hour to find the mistake and photo validation error was occuring
    // console.log(1);
    await Product.create({
        name,
        photo: photo.path,
        price,
        stock,
        category: category.toLowerCase(),

    });
    // console.log(3);
    // invalidateCache({ product: true, admin: true });
    invalidateCache({ product: true, admin: true })
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    if (photo) {
        rm(product.photo!, () => {
            console.log("Old Photo Deleted");
        });
        // product.photo!. This is TypeScript syntax, specifically the "non-null assertion operator" (!), which tells the TypeScript compiler to treat the expression as definitely not being null or undefined.
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });

    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});

