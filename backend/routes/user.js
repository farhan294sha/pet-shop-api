import express from "express";
import z from "zod";
import { User } from "../db";
import jwt from "jsonwebtoken";
import env from "dotenv";
env.config();

const router = express.Router();

const signupValidation = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("adopter/signup", async (req, res) => {
  const result = signupValidation.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ message: "Invalid input" });
  try {
    const user = await User.findOne({ email: result.data.email });
    if (user) return res.status(400).json({ message: "User already exist" });
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
    const hashPassword = await newUser.createHash(result.data.password);
    newUser.passwordHash = hashPassword;
    await newUser.save();

    const userId = newUser._id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);

    res.json({
      message: "User create successfully",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
