import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { apiSlice } from "../app/apiSlice";
import { logout } from "../features/auth/authSlice";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
    const { isAuthenticated, role, user } = useSelector((state) => state.auth); // Get username from Redux state
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(apiSlice.util.resetApiState());
        dispatch(logout());
        navigate("/login");
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">My-Blog</Link>
                </div>
                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle Menu"
                >
                    ☰
                </button>
                <ul className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
                    {!isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    Register
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/blogs" onClick={() => setIsMobileMenuOpen(false)}>
                                    Blogs
                                </Link>
                            </li>
                            {role === "admin" && (
                                <li>
                                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        Create Post
                                    </Link>
                                </li>
                            )}
                            {role !== "admin" && (
                                <li>
                                    <Link to="/subscribe" onClick={() => setIsMobileMenuOpen(false)}>
                                        Subscription
                                    </Link>
                                </li>
                            )}
                            {/* Display username */}
                            {user && (
                                <li className="username-display">
                                    <span>Welcome, {user.username}!</span>
                                </li>
                            )}
                            <li>
                                <button className="logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
