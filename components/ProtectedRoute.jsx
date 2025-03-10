import React, { useEffect } from 'react';
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";


const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const token = useSelector((state) => state.auth.token);
    const router = useRouter();
    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.replace("/SignIn");
        }
    }, [isAuthenticated, token, router]);

    if (isAuthenticated && token) {
        return children;
    }

    return null;


};
export default ProtectedRoute;