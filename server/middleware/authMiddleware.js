import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" });
    }
    next();
};