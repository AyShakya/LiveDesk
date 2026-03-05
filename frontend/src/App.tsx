// App.tsx — complete replacement for Routes section
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Workspaces from "./pages/Workspaces"
import WorkspacePage from "./pages/WorkspacePage"
import DocumentEditor from "./pages/DocumentEditor"
import NotFound from "./pages/NotFound"

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Root decides based on auth */}
        <Route path="/" element={user ? <Navigate to="/workspaces" /> : <Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <Layout>
                <Workspaces />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkspacePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id/document/:docId"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentEditor />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback for unknown frontend routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}