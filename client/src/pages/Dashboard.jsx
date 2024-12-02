import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useFetchBlogByIdQuery,
} from "../app/apiSlice";
import "./Dashboard.css";

const Dashboard = () => {
    const { blogId } = useParams(); // Get blogId from the URL
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null); // State for the image file
    const { data: blog, isFetching, isError } = useFetchBlogByIdQuery(blogId, {
        skip: !blogId, // Skip fetching if no blogId
    });
    const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
    const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();

    useEffect(() => {
        if (blog) {
            setTitle(blog.title);
            setContent(blog.content);
            setImage(blog.image); // If updating, set the existing image
        } else if (!isFetching && blogId && isError) {
            alert("Failed to fetch blog data. Please try again.");
            navigate("/blogs"); // Redirect if fetching fails
        }
    }, [blog, isFetching, isError, blogId, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Update image state
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if blogId is defined (for update)
        if (!title || !content) {
            alert("Title and Content are required!");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);

        if (image) {
            formData.append("image", image); // Add the image to form data
        }

        try {
            console.log("Submitting blog:", { id: blogId, title, content, image });

            if (blogId) {
                // Update blog with image
                const updatedBlog = await updateBlog({ id: blogId, blog: formData }).unwrap();
                console.log("Updated blog:", updatedBlog);
                alert("Blog updated successfully!");
            } else {
                // Create blog with image
                const newBlog = await createBlog(formData).unwrap();
                console.log("Created blog:", newBlog);
                alert("Blog created successfully!");
            }

            // After successful update/creation, navigate to the blogs page
            navigate("/blogs");
        } catch (err) {
            console.error("Failed to submit blog:", err.message);
            alert("There was an error. Please try again.");
        }
    };

    if (isFetching) return <p>Loading...</p>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">
                {blogId ? "Edit Blog" : "Create Blog"}
            </h1>
            <form className="dashboard-form" onSubmit={handleSubmit}>
                <input
                    className="dashboard-input"
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="dashboard-textarea"
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    className="dashboard-file-input"
                    type="file"
                    onChange={handleImageChange} // Handle image selection
                />
                {image && (
                    typeof image === "string" ? (
                        <img src={image} alt="Preview" className="image-preview" />
                    ) : (
                        image instanceof Blob && <img src={URL.createObjectURL(image)} alt="Preview" className="image-preview" />
                    )
                )}
                <button
                    className="dashboard-button"
                    type="submit"
                    disabled={isCreating || isUpdating}
                >
                    {isCreating || isUpdating
                        ? "Submitting..."
                        : blogId
                        ? "Update Blog"
                        : "Create Blog"}
                </button>
            </form>
        </div>
    );
};

export default Dashboard;
