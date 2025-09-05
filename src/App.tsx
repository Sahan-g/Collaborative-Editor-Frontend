import "./App.css";
import Header from "./Components/Header";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Documents from "./Pages/Documents";
import Shared from "./Pages/shared";
import Recent from "./Pages/Recent";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditDoc from "./Pages/EditDoc";
import { ShareModalProvider } from "./contexts/modalContext";

function AppContent() {
  const location = useLocation();
  const hideHeader =
    location.pathname === "/register" || location.pathname === "/login";

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/document/:id" element={<EditDoc />} /> */}

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared"
          element={
            <ProtectedRoute>
              <Shared />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent"
          element={
            <ProtectedRoute>
              <Recent />
            </ProtectedRoute>
          }
        />
        <Route path="/documents/:id" element={<ProtectedRoute>
          <EditDoc />
        </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ShareModalProvider>
          <AppContent />
        </ShareModalProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
