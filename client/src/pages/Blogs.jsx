import React, { useEffect } from "react";
import { useFetchBlogsQuery, useFetchAdminBlogsQuery, useDeleteBlogMutation } from "../app/apiSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Blogs.css"; // Import CSS for styling
import { useSelector } from "react-redux"; // Import useSelector to access user role from Redux store

const Blogs = () => {
    const user = useSelector((state) => state.auth.user); // Get user details from Redux store
    const navigate = useNavigate();
    const { data: allBlogs, isLoading: isLoadingAllBlogs, error: errorAllBlogs } = useFetchBlogsQuery();
    const { data: adminBlogs, isLoading: isLoadingAdminBlogs, error: errorAdminBlogs } = useFetchAdminBlogsQuery();
    const [deleteBlog] = useDeleteBlogMutation();

    // Determine which blogs to display based on user role
    const blogs = user?.role === "admin" ? adminBlogs : allBlogs;
    const isLoading = user?.role === "admin" ? isLoadingAdminBlogs : isLoadingAllBlogs;
    const error = user?.role === "admin" ? errorAdminBlogs : errorAllBlogs;

    // Handle blog deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            try {
                await deleteBlog(id);
                alert("Blog deleted successfully.");
            } catch (err) {
                alert("Failed to delete blog. Please try again.");
            }
        }
    };

    // Render loading or error message
    if (isLoading) return <p className="loading-message">Loading blogs...</p>;
    if (error) return <p className="error-message">Failed to load blogs. Please try again later.</p>;

    return (
        <div className="blogs-container">
            <ul className="blogs-list">
                {blogs?.length ? (
                    blogs.map((blog) => (
                        <li key={blog._id} className="blog-card">
                            <h3 className="blog-title">{blog.title}</h3>
                            {blog.image && (
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="blog-image"
                                />
                            )}
                            <p className="blog-content">
                                {blog.content.substring(0, 100)}...
                            </p>
                            <p className="blog-likes-dislikes">
                                Likes: {blog.likeCount} | Dislikes: {blog.dislikeCount}
                            </p>
                            {user && (
                                <p className="user-feedback">
                                    {blog.likes.some((like) => like._id === user.id)
                                        ? "You liked this blog."
                                        : blog.dislikes.some((dislike) => dislike._id === user.id)
                                        ? "You disliked this blog."
                                        : "You haven't reacted to this blog yet."}
                                </p>
                            )}

                            <Link to={`/blogs/${blog._id}`} className="read-more-link">
                                Read More
                            </Link>

                            {/* Show Delete and Edit buttons for Admin users */}
                            {user?.role === "admin" && (
                                <>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(blog._id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="edit-button"
                                        onClick={() => navigate(`/admin/dashboard/${blog._id}`)}
                                    >
                                        Edit
                                    </button>
                                </>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="no-blogs-message">No blogs available at the moment.</p>
                )}
            </ul>
        </div>
    );
};

export default Blogs;
