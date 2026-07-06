import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const handleSignup = async (req, res) => {
  try {
    let { Name, Email, Password } = req.body;

    Name = Name?.trim();
    Email = Email?.trim().toLowerCase();
    Password = Password?.trim();

    if (!Name || !Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (Name.length < 3 || Name.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 3 and 30 characters",
      });
    }

    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!passwordRegex.test(Password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      });
    }

    const existingUser = await User.findOne({ Email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = await User.create({
      Name,
      Email,
      Password: hashedPassword,
    });

    const { Password: _, ...userData } = user.toObject();

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: userData,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const handleLogin = async (req, res) => {
  try {
    let { Email, Password } = req.body;

    Email = Email?.trim().toLowerCase();
    Password = Password?.trim();

    // Required fields
    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      Password,
      user.Password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: user.Role,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { handleSignup, handleLogin };