import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSubscribeMutation } from "../app/apiSlice";
import { setCredentials } from "../features/auth/authSlice";
import "./Subscription.css"; // Import the CSS file

const Subscription = () => {
    const [subscribe, { isLoading }] = useSubscribeMutation();
    const dispatch = useDispatch();
    const { isSubscribed, subscriptionExpiry } = useSelector((state) => state.auth);

    const [timeRemaining, setTimeRemaining] = useState("");

    const calculateRemainingTime = () => {
        if (subscriptionExpiry) {
            const now = new Date();
            const expiry = new Date(subscriptionExpiry);
            const difference = expiry - now;

            if (difference <= 0) {
                setTimeRemaining("Subscription expired");
            } else {
                const minutes = Math.floor(difference / (1000 * 60)); // Get minutes remaining
                setTimeRemaining(`${minutes}m remaining`);
            }
        }
    };

    useEffect(() => {
        if (isSubscribed) {
            const interval = setInterval(() => {
                calculateRemainingTime();
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isSubscribed, subscriptionExpiry]);

    const handleSubscribe = async () => {
        try {
            const response = await subscribe().unwrap();
            if (response.token) {
                const decodedToken = JSON.parse(atob(response.token.split(".")[1]));
                dispatch(setCredentials({ token: response.token, subscriptionExpiry: decodedToken.subscriptionExpiry }));
                alert("You are now subscribed!");
            } else {
                console.error("Token not found in response");
            }
        } catch (err) {
            console.error("Subscription failed:", err.message);
        }
    };

    return (
        <div className="subscription-container">
            <h1 className="subscription-title">Subscribe to Access Full Content</h1>
            {isSubscribed && (
                <div className="subscription-info">
                    <p>Remaining time: {timeRemaining}</p>
                </div>
            )}
            <button
                className="subscription-button"
                onClick={handleSubscribe}
                disabled={isLoading || isSubscribed}
            >
                {isLoading ? "Processing..." : isSubscribed ? "Subscribed" : "Subscribe Now"}
            </button>
        </div>
    );
};

export default Subscription;
