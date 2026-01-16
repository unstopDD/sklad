import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import UnitManager from './components/UnitManager'
import IngredientManager from './components/IngredientManager'
import ProductManager from './components/ProductManager'
import ProductionManager from './components/ProductionManager'
import WriteOffManager from './components/WriteOffManager'
import History from './components/History'

import { useInventoryStore } from './store/inventoryStore'; // We still check profile from store for routing
import { Loader2, RefreshCw } from 'lucide-react';

import AuthPage from './components/Auth/AuthPage'
import { AuthProvider, useAuth } from './components/Auth/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import SetupProduction from './components/SetupProduction'
import ErrorBoundary from './components/ErrorBoundary';

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
        <HashRouter>
            <Routes>
                <Route path="/login" element={
                    user ? <Navigate to="/" replace /> : <AuthPage />
                } />

                <Route element={<ProtectedRoute />}>
                    <Route path="/setup" element={
                        profile ? <Navigate to="/" replace /> : <SetupProduction />
                    } />

                    <Route path="/" element={
                        !profile ? <Navigate to="/setup" replace /> : <Layout />
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
