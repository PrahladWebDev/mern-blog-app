import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useFetchBlogByIdQuery,
    usePostCommentMutation,
    useFetchCommentsQuery,
    useDeleteCommentMutation, // Import the deleteComment mutation
    useLikeBlogMutation, // Import mutation to handle likes
    useDislikeBlogMutation, // Import mutation to handle dislikes
} from "../app/apiSlice";
import "./BlogDetail.css"; // Import the CSS file

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: blog, isLoading, error } = useFetchBlogByIdQuery(id);
    const { data: comments, isLoading: commentsLoading, error: commentsError } = useFetchCommentsQuery(id);
    const { isSubscribed, role } = useSelector((state) => state.auth); // Check role and subscription status
    const [comment, setComment] = useState("");
    const [postComment] = usePostCommentMutation();
    const [deleteComment] = useDeleteCommentMutation(); // Hook for deleting comments
    const [likeBlog] = useLikeBlogMutation(); // Hook for liking the blog
    const [dislikeBlog] = useDislikeBlogMutation(); // Hook for disliking the blog

    if (isLoading) return <p>Loading blog...</p>;
    if (error) return <p className="subscribe-message">
    You need to subscribe to read the full content and post comments.
    <button onClick={() => navigate("/subscribe")}>
        Subscribe
    </button>
</p>;

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await postComment({ blogId: id, content: comment }).unwrap();
            setComment(""); // Clear the comment input after submission
            alert("Comment posted!");
        } catch (err) {
            console.error("Failed to post comment:", err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId).unwrap();
            alert("Comment deleted successfully!");
        } catch (err) {
            console.error("Failed to delete comment:", err.message);
        }
    };

    const handleLike = async () => {
        try {
            await likeBlog(id).unwrap();
            alert("You liked this blog!");
        } catch (err) {
            console.error("Failed to like blog:", err.message);
        }
    };

    const handleDislike = async () => {
        try {
            await dislikeBlog(id).unwrap();
            alert("You disliked this blog!");
        } catch (err) {
            console.error("Failed to dislike blog:", err.message);
        }
    };

    const canViewContent = role === "admin" || isSubscribed;

    return (
        <div className="blog-container">
            <h1 className="blog-title">{blog.title}</h1>
            {canViewContent ? (
                <>
                    <p className="blog-content">{blog.content}</p>
                    <div className="blog-actions">
                        <button className="like-button" onClick={handleLike}>
                            Like ({blog.likeCount})
                        </button>
                        <button className="dislike-button" onClick={handleDislike}>
                            Dislike ({blog.dislikeCount})
                        </button>
                    </div>
                    <div className="comment-section">
                        <h3>Comments</h3>
                        {commentsLoading ? (
                            <p>Loading comments...</p>
                        ) : commentsError ? (
                            <p>Failed to load comments.</p>
                        ) : (
                            <ul className="comment-list">
                                {comments?.length > 0 ? (
                                    comments.map((c) => (
                                        <li key={c._id} className="comment-item">
                                            <span>{c.content}</span>
                                            {role === "admin" && (
                                                <button
                                                    className="delete-comment-button"
                                                    onClick={() => handleDeleteComment(c._id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <p>No comments yet.</p>
                                )}
                            </ul>
                        )}
                        <form className="comment-form" onSubmit={handleCommentSubmit}>
                            <input
                                className="comment-input"
                                type="text"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button className="comment-button" type="submit">
                                Post Comment
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <p className="subscribe-message">
                    You need to subscribe to read the full content and post comments.
                    <button onClick={() => navigate("/subscribe")}>
                        Subscribe
                    </button>
                </p>
            )}
        </div>
    );
};

export default BlogDetail;
