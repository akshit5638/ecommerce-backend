"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const auth_1 = require("../middlewares/auth");
const app = express_1.default.Router();
// api/v1/user
app.post("/new", user_1.newUser);
app.get("/all", auth_1.adminOnly, user_1.getAllUsers);
app.route("/:id").get(user_1.getUser).delete(auth_1.adminOnly, user_1.deleteUser);
// these 2 lines below are written as one
// app.get("/:id", getUser)
// app.delete("/:id",deleteUser)
// in req.params.id in getuser controller id will be replace by word which is written after :
exports.default = app;
