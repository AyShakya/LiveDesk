import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Workspaces from "./pages/Workspaces"
import WorkspacePage from "./pages/WorkspacePage"
import DocumentEditor from "./pages/DocumentEditor"
import Layout from "./components/Layout"

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Redirect root if logged in */}
        {user && <Route path="/" element={<Navigate to="/workspaces" />} />}

        {/* Protected Routes */}
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
      </Routes>
    </BrowserRouter>
  )
}