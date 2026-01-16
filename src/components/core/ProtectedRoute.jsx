import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // While loading, we might show a spinner, but App.jsx usually handles the initial blocked load.
    // However, if we navigate around, checking 'loading' helps avoid flickers.
    if (loading) {
        // You can return null or a spinner. App.jsx already has a top-level loader, 
        // but this protects against internal route switches if they cause revalidation.
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
