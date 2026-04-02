import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import { Suspense, lazy } from "react"

import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layouts/Layout"
import WorkspaceLayout from "./components/Layouts/WorkspaceLayout"
import {
  AuthFormSkeleton,
  DashboardSkeleton,
  EditorSkeleton,
  PageSkeleton,
  SidebarSkeleton,
  WorkspaceHeaderSkeleton,
} from "./components/ui/Skeleton"

const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Workspaces = lazy(() => import("./pages/Workspaces"))
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"))
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"))
const NotFound = lazy(() => import("./pages/NotFound"))

function WorkspaceRouteSkeleton() {
  return (
    <PageSkeleton
      sidebar={<SidebarSkeleton />}
      header={<WorkspaceHeaderSkeleton />}
    >
      <EditorSkeleton />
    </PageSkeleton>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
              {user ? <Navigate to="/workspaces" /> : <Home />}
            </Suspense>
          }
        />

        <Route
          path="/login"
          element={
            <Suspense fallback={<AuthFormSkeleton />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<AuthFormSkeleton />}>
              <Register />
            </Suspense>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/workspaces"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Workspaces />
              </Suspense>
            }
          />

          <Route path="/workspace/:id" element={<WorkspaceLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<WorkspaceRouteSkeleton />}>
                  <WorkspacePage />
                </Suspense>
              }
            />

            <Route
              path="document/:docId"
              element={
                <Suspense fallback={<WorkspaceRouteSkeleton />}>
                  <DocumentEditorWrapper />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-white" />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

function DocumentEditorWrapper() {
  const { docId } = useParams<{ docId: string }>()
  return <DocumentEditor key={docId} />
}
