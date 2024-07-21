import express from "express";
import {default as petRouter }from "./pet.js";
import {default as userRouter} from "./user.js"

const router = express.Router();


router.use("/pet", petRouter);
router.use("/user", userRouter);



export default router 