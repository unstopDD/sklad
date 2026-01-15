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

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="units" element={<UnitManager />} />
                    <Route path="ingredients" element={<IngredientManager />} />
                    <Route path="products" element={<ProductManager />} />
                    <Route path="production" element={<ProductionManager />} />
                    <Route path="writeoff" element={<WriteOffManager />} />
                    <Route path="history" element={<History />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default App
