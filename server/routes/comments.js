import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";

const router = express.Router();

// Post a comment (Subscribed users only)
router.post("/:blogId", authMiddleware, async (req, res) => {
    const { blogId } = req.params;
    const { content } = req.body;

    try {
        if (!req.user.isSubscribed && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "You need to subscribe to comment on this blog" });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        const comment = new Comment({ content, blog: blogId, user: req.user._id });
        await comment.save();
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: "Error posting comment" });
    }
});

// Get all comments for a blog
router.get("/:blogId", async (req, res) => {
    const { blogId } = req.params;

    try {
        const comments = await Comment.find({ blog: blogId })
            .populate("user", "username")
            .populate("blog", "title");
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" });
    }
});

// Delete a comment (Admin only)
router.delete("/:commentId", authMiddleware, adminMiddleware, async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment" });
    }
});

export default router;
