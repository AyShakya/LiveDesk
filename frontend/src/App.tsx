import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Workspaces from "./pages/Workspaces";
import WorkspacePage from "./pages/WorkspacePage";
import DocumentEditor from "./pages/DocumentEditor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <Workspaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id/document/:docId"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
