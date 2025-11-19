// src/routes/EmployeeRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EmployeeRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return null; // tránh nháy khi verify /users/me
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== "employee" && user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }
    return children;
}
