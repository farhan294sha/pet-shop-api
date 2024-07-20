import express from "express";
import petRouter from "./pet";
import userRouter from "./user"

const router = express.Router();


router.use("/pet", petRouter);
router.use("/user", userRouter);



export default router 