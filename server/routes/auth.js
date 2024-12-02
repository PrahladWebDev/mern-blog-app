import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post(
    "/register",
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["user", "admin"]),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password, role } = req.body;

        try {
            const user = new User({ username, email, password, role });
            await user.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error registering user" });
        }
    }
);

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Include role and subscription status in the token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                isSubscribed: user.isSubscribed,
                subscriptionExpiry: user.subscriptionExpiry, // Add subscription status to the payload
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user }); // Send both token and user information
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});

// Subscribe user (User only)
router.post("/subscribe", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Set subscription expiry for 2 days from now
        user.isSubscribed = true;
        user.subscriptionExpiry = new Date(Date.now() + 20 * 60 * 1000); // 2 minutes from now
        await user.save();

        // Generate a new token with the updated subscription status and expiry
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                isSubscribed: user.isSubscribed,
                subscriptionExpiry: user.subscriptionExpiry,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Subscription activated", token });
    } catch (error) {
        res.status(500).json({ message: "Error activating subscription" });
    }
});

export default router;
