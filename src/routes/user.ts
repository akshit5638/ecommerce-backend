import express from 'express'
import { deleteUser, getAllUsers, getUser, newUser } from '../controllers/user';
import { adminOnly } from '../middlewares/auth';
const app = express.Router();
// api/v1/user
app.post("/new", newUser)
app.get("/all", adminOnly, getAllUsers)
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
// these 2 lines below are written as one
// app.get("/:id", getUser)
// app.delete("/:id",deleteUser)
// in req.params.id in getuser controller id will be replace by word which is written after :
export default app;