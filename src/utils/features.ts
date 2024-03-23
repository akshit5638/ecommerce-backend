import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect("mongodb://127.0.0.1:27017", { // took two hours figuring out that replace localhost by 127.0.0.1
        dbName: "Ecommerce2024"
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log("error not connected"));
}