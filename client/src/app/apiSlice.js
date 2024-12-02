import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://mern-blog-app-k0ua.onrender.com/api",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Blog', 'Blogs', 'Comment'], // Define tag types for cache invalidation

    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (user) => ({
                url: "/auth/register",
                method: "POST",
                body: user,
            }),
        }),
        fetchBlogs: builder.query({
            query: () => "/blogs",
            providesTags: ['Blogs'], // Provide the 'Blogs' tag to this query
        }),
        fetchBlogById: builder.query({
            query: (id) => `/blogs/${id}`,
            providesTags: (result, error, id) => [{ type: 'Blog', id }], // Provide a specific 'Blog' tag with the id
        }),
        createBlog: builder.mutation({
            query: (blog) => ({
                url: "/blogs",
                method: "POST",
                body: blog,
            }),
            invalidatesTags: ['Blogs'], // Invalidate 'Blogs' tag to trigger refetch
        }),
        updateBlog: builder.mutation({
            query: ({ id, blog }) => ({
                url: `/blogs/${id}`,
                method: "PUT",
                body: blog,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blogs'], // Invalidate specific 'Blog' tag and 'Blogs' tag
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/blogs/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Blog', id }, 'Blogs'], // Invalidate specific 'Blog' tag and 'Blogs' tag
        }),
        postComment: builder.mutation({
            query: ({ blogId, content }) => ({
                url: `comments/${blogId}`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: (result, error, { blogId }) => [{ type: 'Blog', id: blogId }, 'Comments'], // Invalidate 'Blog' and 'Comments' tags
        }),
        fetchComments: builder.query({
            query: (blogId) => `/comments/${blogId}`,
            providesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }, 'Comments'], // Provide 'Comments' tag and blog-specific tag
        }),
        deleteComment: builder.mutation({
            query: (commentId) => ({
                url: `/comments/${commentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { commentId }) => [{ type: 'Comment', id: commentId }, 'Comments'], // Invalidate specific 'Comment' tag
        }),
        subscribe: builder.mutation({
            query: () => ({
                url: "/auth/subscribe",
                method: "POST",
            }),
        }),
        likeBlog: builder.mutation({
            query: (id) => ({
                url: `/blogs/${id}/like`,
                method: "POST",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blogs'], // Invalidate 'Blog' tag and 'Blogs' tag
        }),
        dislikeBlog: builder.mutation({
            query: (id) => ({
                url: `/blogs/${id}/dislike`,
                method: "POST",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blogs'], // Invalidate 'Blog' tag and 'Blogs' tag
        }),
        fetchAdminBlogs: builder.query({
            query: () => "/blogs/admin",
            providesTags: ['Blogs'], // Provide the 'Blogs' tag to this query
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useFetchBlogsQuery,
    useFetchBlogByIdQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
    usePostCommentMutation,
    useFetchCommentsQuery,
    useDeleteCommentMutation,
    useSubscribeMutation,
    useLikeBlogMutation,
    useDislikeBlogMutation,
    useFetchAdminBlogsQuery,
} = apiSlice;
