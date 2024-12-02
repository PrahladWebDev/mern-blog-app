import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config.js';  // Add .js extension
import authRoutes from './routes/auth.js';  // Ensure other imports are similarly updated
import blogRoutes from './routes/blogs.js';
import commentRoutes from './routes/comments.js';
import path from 'path';

dotenv.config();  // Load environment variables
// Database Connection
connectDB();

const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
    origin: process.env.URL,
    credentials: true
}
app.use(cors(corsOptions));

const __dirname = path.resolve();
console.log(__dirname);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);



app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
})


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
