import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../app/apiSlice";
import { setCredentials } from "../../features/auth/authSlice";
import "./Login.css"; // Import the CSS file for styling

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [login] = useLoginMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { token } = await login({ email, password }).unwrap();
            dispatch(setCredentials({ token }));
    
            // Navigate to different routes based on user role
            navigate(decodedToken.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
        } catch (err) {
            setError("Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
