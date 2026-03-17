import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import { lazy} from "react"

import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layouts/Layout"
import WorkspaceLayout from "./components/Layouts/WorkspaceLayout"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Workspaces = lazy(() => import("./pages/Workspaces"))
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"))
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"))
const NotFound = lazy(() => import("./pages/NotFound"))

export default function App() {

  const { user } = useAuth()

  return (

    <BrowserRouter>

      <Routes>

        {/* Root */}
        <Route
          path="/"
          element={user ? <Navigate to="/workspaces" /> : <Home />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* Workspaces dashboard */}
          <Route path="/workspaces" element={<Workspaces />} />


          {/* Workspace Layout */}
          <Route path="/workspace/:id" element={<WorkspaceLayout />}>

            {/* Workspace home */}
            <Route index element={<WorkspacePage />} />

            {/* Document editor */}
            <Route
              path="document/:docId"
              element={<DocumentEditor />}
            />

          </Route>

        </Route>


        {/* Not found */}
        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>

  )

}