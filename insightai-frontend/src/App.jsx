import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Upload from "./pages/Upload";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Analysis from "./pages/analysis";
import Chat from "./pages/chat";
import Charts from "./pages/charts";
import TablePage from "./pages/table";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <Analysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/charts"
        element={
          <ProtectedRoute>
            <Charts />
          </ProtectedRoute>
        }
      />
      <Route
  path="/table"
  element={
    <ProtectedRoute>
      <TablePage />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}