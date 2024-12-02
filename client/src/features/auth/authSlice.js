import { createSlice } from "@reduxjs/toolkit";

// Utility function to decode JWT manually
const decodeToken = (token) => {
    try {
        const payload = token.split(".")[1]; // Get the payload part
        const decodedPayload = atob(payload); // Decode Base64
        return JSON.parse(decodedPayload); // Parse JSON
    } catch (error) {
        console.error("Invalid token format:", error);
        return null;
    }
};

// Function to check if subscription is expired
const isSubscriptionExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const currentTime = new Date();
    return new Date(expiryDate) < currentTime;
};

// Retrieve token from localStorage on page load
const token = localStorage.getItem("token");
let decodedToken = null;
if (token) {
    decodedToken = decodeToken(token);
}

// Initial state
const initialState = {
    user: decodedToken ? decodedToken : null,
    token: token || null,
    isAuthenticated: !!token,
    role: decodedToken ? decodedToken.role : null,
    isSubscribed: decodedToken ? decodedToken.isSubscribed && !isSubscriptionExpired(decodedToken.subscriptionExpiry) : false,
    subscriptionExpiry: decodedToken ? decodedToken.subscriptionExpiry : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Set user credentials
        setCredentials: (state, action) => {
            const { token } = action.payload;
            const decodedToken = decodeToken(token);

            if (decodedToken) {
                state.token = token;
                state.user = decodedToken;
                state.role = decodedToken.role;
                state.isSubscribed = decodedToken.isSubscribed && !isSubscriptionExpired(decodedToken.subscriptionExpiry);
                state.subscriptionExpiry = decodedToken.subscriptionExpiry;
                state.isAuthenticated = true;
                localStorage.setItem("token", token);
                  // Log user ID and details
        console.log("User ID:", decodedToken.id);
        console.log("Current User Details:", decodedToken);
            } else {
                console.error("Failed to decode token.");
            }
        },

        // Logout user and clear state
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.role = null;
            state.isSubscribed = false;
            state.subscriptionExpiry = null;
            localStorage.removeItem("token");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
