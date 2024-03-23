"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const user_js_1 = require("../models/user.js");
const utility_class_js_1 = __importDefault(require("../utils/utility-class.js"));
const error_js_1 = require("./error.js");
// Middleware to make sure only admin is allowed
exports.adminOnly = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new utility_class_js_1.default("Saale Login Kr phle", 401));
    const user = await user_js_1.User.findById(id);
    if (!user)
        return next(new utility_class_js_1.default("Saale Fake ID Deta Hai", 401));
    if (user.role !== "admin")
        return next(new utility_class_js_1.default("Saale Aukat Nhi Hai Teri", 403));
    next();
});
