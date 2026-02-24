import prisma from "../../db.config.js";
import isEmail from "validator/lib/isEmail.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
const saltRounds = 12;
const usernameRegex =
  /^(?=.{3,30}$)(?!.*[.]{2})[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

export const createUser = async (req, res) => {
  try {
    let { username, email, password, collegeId } = req.body;

    if (!username || !email || !password || !collegeId) {
      return res.status(400).json({ error: "All fields are required." });
    }

    email = email.trim().toLowerCase();
    username = username.trim().toLowerCase();

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: "Invalid username format.",
        field: "username",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Invalid password format.",
        field: "password",
      });
    }

    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ error: "Invalid email format.", field: "email" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(409)
          .json({ error: "Email is already registered.", field: "email" });
      }
      if (existingUser.username === username) {
        return res
          .status(409)
          .json({ error: "Username is already taken.", field: "username" });
      }
    }

    const college = await prisma.college.findUnique({
      where: { id: BigInt(collegeId) },
    });
    if (!college) {
      return res
        .status(400)
        .json({ error: "Invalid college ID.", field: "collegeId" });
    }

    const hashedPass = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPass,
        collegeId: BigInt(collegeId),
      },
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser.id.toString(),
        username: newUser.username,
        email: newUser.email,
        collegeId: newUser.collegeId.toString(),
        createdAt: newUser.createdAt,
      },
    });
  } catch (err) {
    console.error("User creation error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password, rememberMe } = req.body;
    email = email.trim().toLowerCase();
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const checkPass = await bcrypt.compare(password, user.password);

    if (!checkPass) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    generateToken(res, { 
      id: user.id.toString(), 
      username: user.username, 
      email: user.email 
    }, rememberMe);

    return res.json({ 
      message: "Login successful",
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('jwt', { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Unable to logout' });
  }
};
