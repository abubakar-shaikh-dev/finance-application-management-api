//Models
import User from "../models/User.model.js";

//Services
import * as jwtService from "../services/jwt.service.js";

//Utils
import { hashPassword, comparePassword } from "../utils/password.util.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });

    if (user) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwtService.generateAccessToken(newUser._id);

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data: { token },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email or password" });
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email or password" });
    }

    const token = jwtService.generateAccessToken(user._id);

    return res.status(200).json({
      status: true,
      message: "User logged in successfully",
      data: { token },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};