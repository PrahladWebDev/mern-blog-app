import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

const useSubscriptionExpiry = () => {
    const dispatch = useDispatch();
    const { isSubscribed, subscriptionExpiry } = useSelector((state) => state.auth);

    useEffect(() => {
        // If the user is subscribed, start monitoring the expiration
        if (isSubscribed && subscriptionExpiry) {
            const interval = setInterval(() => {
                const now = new Date();
                const expiry = new Date(subscriptionExpiry);
                const difference = expiry - now;

                // If subscription has expired, log the user out
                if (difference <= 0) {
                    dispatch(logout());
                    clearInterval(interval); // Stop checking after logout
                }
            }, 5000); // Check every 5 seconds

            // Cleanup interval when component unmounts
            return () => clearInterval(interval);
        }
    }, [isSubscribed, subscriptionExpiry, dispatch]);
};

export default useSubscriptionExpiry;
