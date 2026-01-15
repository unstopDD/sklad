import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import UnitManager from './components/UnitManager'
import IngredientManager from './components/IngredientManager'
import ProductManager from './components/ProductManager'
import ProductionManager from './components/ProductionManager'
import History from './components/History'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="units" element={<UnitManager />} />
                    <Route path="ingredients" element={<IngredientManager />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="production" element={<ProductionManager />} />
                    <Route path="history" element={<History />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
