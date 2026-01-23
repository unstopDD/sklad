import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/core/Layout'
import Dashboard from './components/dashboard/Dashboard'
import UnitManager from './components/inventory/UnitManager'
import IngredientManager from './components/inventory/IngredientManager'
import ProductManager from './components/inventory/ProductManager'
import ProductionManager from './components/production/ProductionManager'
import WriteOffManager from './components/inventory/WriteOffManager'
import History from './components/inventory/History'
import LandingPage from './components/landing/LandingPage'

import { useInventoryStore } from './store/inventoryStore';
import { Loader2, RefreshCw } from 'lucide-react';

import AuthPage from './components/Auth/AuthPage'
import { AuthProvider, useAuth } from './components/Auth/AuthProvider'
import ProtectedRoute from './components/core/ProtectedRoute'
import SetupProduction from './components/production/SetupProduction'
import ErrorBoundary from './components/core/ErrorBoundary';
import { LangProvider } from './i18n';

const AppContent = () => {
    const { user, loading, authError } = useAuth();
    const profile = useInventoryStore(state => state.profile);

    // 1. Loading State
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a',
                color: '#94a3b8'
            }}>
                <Loader2 className="animate-spin mb-4" size={32} />
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Загрузка...</span>
            </div>
        );
    }

    // 2. Error State
    if (authError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-red-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-6">
                        <RefreshCw size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка</h2>
                    <p className="text-gray-600 mb-8">{authError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} />
                        Обновить страницу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Auth routes */}
            <Route path="/app/login" element={
                user ? <Navigate to="/app" replace /> : <AuthPage />
            } />

            {/* Protected app routes */}
            <Route path="/app/*" element={<ProtectedRoute />}>
                <Route path="setup" element={
                    profile ? <Navigate to="/app" replace /> : <SetupProduction />
                } />

                <Route path="" element={
                    !profile ? <Navigate to="/app/setup" replace /> : <Layout />
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="units" element={<UnitManager />} />
                    <Route path="ingredients" element={<IngredientManager />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="production" element={<ProductionManager />} />
                    <Route path="writeoff" element={<WriteOffManager />} />
                    <Route path="history" element={<History />} />
                </Route>
            </Route>

            {/* Redirect old login route to new one */}
            <Route path="/login" element={<Navigate to="/app/login" replace />} />

            {/* Catch all - redirect to app */}
            <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
    );
};

function App() {
    // Handle OAuth callbacks - Supabase redirects to /#access_token=... which HashRouter sees as route
    // We need to detect this and redirect to /#/app before routing happens
    React.useEffect(() => {
        const hash = window.location.hash;
        // Check if hash starts with OAuth params (not a valid route)
        if (hash && (hash.startsWith('#access_token') || hash.startsWith('#error') || hash.startsWith('#type='))) {
            // Replace with /app route, preserving the OAuth params
            window.location.hash = '/app' + hash.substring(1); // Remove first # and append to /app
        }
    }, []);

    return (
        <LangProvider>
            <ErrorBoundary>
                <HashRouter>
                    <Routes>
                        {/* Landing page - public, no auth needed */}
                        <Route path="/" element={<LandingPage />} />

                        {/* App routes - wrapped in AuthProvider */}
                        <Route path="/*" element={
                            <AuthProvider>
                                <AppContent />
                            </AuthProvider>
                        } />
                    </Routes>
                </HashRouter>
            </ErrorBoundary>
        </LangProvider>
    )
}

export default App
