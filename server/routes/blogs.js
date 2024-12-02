import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import Blog from "../models/Blog.js";
import cloudinary from "cloudinary";
import upload from "../utils/multerConfig.js";

const router = express.Router();

// Create a new blog post with image (Admin only)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
    const { title, content } = req.body;

    try {
        const blog = new Blog({
            title,
            content,
            author: req.user._id,
            image: req.file ? req.file.path : undefined, // Cloudinary image URL
        });
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error creating blog post" });
    }
});

// Get list of blogs (visible to all users)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "username")
            .populate("likes", "username")
            .populate("dislikes", "username");

        const blogsWithCounts = blogs.map(blog => ({
            ...blog._doc,
            likeCount: blog.likes.length,
            dislikeCount: blog.dislikes.length,
        }));

        res.status(200).json(blogsWithCounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs" });
    }
});

// Get blogs created by the logged-in admin (Admin only)
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id })
            .populate("author", "username")
            .populate("likes", "username")
            .populate("dislikes", "username");

        const blogsWithCounts = blogs.map(blog => ({
            ...blog._doc,
            likeCount: blog.likes.length,
            dislikeCount: blog.dislikes.length,
        }));

        res.status(200).json(blogsWithCounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs" });
    }
});

// Like a blog
router.post("/:id/like", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "You already liked this blog" });
        }

        blog.dislikes = blog.dislikes.filter(userId => userId.toString() !== req.user._id.toString());
        blog.likes.push(req.user._id);
        await blog.save();

        res.status(200).json({ message: "Blog liked successfully", likes: blog.likes.length });
    } catch (error) {
        res.status(500).json({ message: "Error liking blog" });
    }
});

// Dislike a blog
router.post("/:id/dislike", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.dislikes.includes(req.user._id)) {
            return res.status(400).json({ message: "You already disliked this blog" });
        }

        blog.likes = blog.likes.filter(userId => userId.toString() !== req.user._id.toString());
        blog.dislikes.push(req.user._id);
        await blog.save();

        res.status(200).json({ message: "Blog disliked successfully", dislikes: blog.dislikes.length });
    } catch (error) {
        res.status(500).json({ message: "Error disliking blog" });
    }
});

// Get full content of a blog (Subscribed users or Admins only)
router.get("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id)
            .populate("author", "username")
            .populate("likes", "username")
            .populate("dislikes", "username");

        if (!blog) return res.status(404).json({ message: "Blog not found" });

        const blogWithCounts = {
            ...blog._doc,
            likeCount: blog.likes.length,
            dislikeCount: blog.dislikes.length,
        };

        if (!req.user.isSubscribed && req.user.role !== "admin") {
            return res.status(403).json({ message: "You need to subscribe to read the full content" });
        }

        res.status(200).json(blogWithCounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog" });
    }
});

// Update a blog (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (req.file && blog.image) {
            const publicId = blog.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            blog.image = result.secure_url;
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        await blog.save();

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error updating blog post" });
    }
});

// Delete a blog (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findByIdAndDelete(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting blog post" });
    }
});

export default router;
