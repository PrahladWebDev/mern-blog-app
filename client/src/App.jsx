import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/auth/authSlice";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import Navbar from "./components/Navbar";

const App = () => {
    const { isAuthenticated, role, isSubscribed, subscriptionExpiry } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
      const checkSubscription = () => {
          if (isSubscribed && subscriptionExpiry) {
              const now = new Date().getTime();
              const expiryTime = new Date(subscriptionExpiry).getTime();
  
              if (now >= expiryTime) {
                  // Dispatch an action to clear subscription state only
                  alert("Your subscription has expired. Please subscribe again.");
                  dispatch(logout()); // Use only if you want the user to log out completely
              }
          }
      };
  
      const intervalId = setInterval(checkSubscription, 1000); // Check every second
  
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [isSubscribed, subscriptionExpiry, dispatch]);
  

    const RequireAuth = ({ children }) => {
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    const RequireAdmin = ({ children }) => {
        if (role !== "admin") {
            return <Navigate to="/blogs" replace />;
        }
        return children;
    };

    return (
        <Router>
            {/* Navbar should be outside Routes so it appears on all pages */}
            <Navbar />

            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/blogs"
                    element={
                        <RequireAuth>
                            <Blogs />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/blogs/:id"
                    element={
                        <RequireAuth>
                            <BlogDetail />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <RequireAuth>
                            <RequireAdmin>
                                <Dashboard />
                            </RequireAdmin>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin/dashboard/:blogId"
                    element={
                        <RequireAuth>
                            <RequireAdmin>
                                <Dashboard />
                            </RequireAdmin>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/subscribe"
                    element={
                        <RequireAuth>
                            <Subscription />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/blogs" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
