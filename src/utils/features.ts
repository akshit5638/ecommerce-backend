import mongoose from "mongoose";
import { myCache } from "../app";
import { InvalidateCacheProps, OrderItemType } from "../types/types";
import { Product } from "../models/product";

export const connectDB = (uri: string) => {
    mongoose.connect(uri, { // took two hours figuring out that replace localhost by 127.0.0.1
        dbName: "Ecommerce2024"
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log("error not connected"));
}
export const invalidateCache = ({
    product,
    order,
    admin,
    userId,
    orderId,
    productId,
}: InvalidateCacheProps) => {
    if (product) {
        const productKeys: string[] = [
            "latest-products",
            "categories",
            "all-products",
        ];

        if (typeof productId === "string") productKeys.push(`product-${productId}`);

        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));

        myCache.del(productKeys);
    }
    if (order) {
        const ordersKeys: string[] = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];

        myCache.del(ordersKeys);
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
export const reduceStock = async (orderItems: OrderItemType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};

export const getInventories = async ({
    categories,
    productsCount,
}: {
    categories: string[];
    productsCount: number;
}) => {
    const categoriesCountPromise = categories.map((category) =>
        Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        });
    });

    return categoryCount;
};