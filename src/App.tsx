import "./App.css";
import Header from "./Components/Header";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Documents from "./Pages/Documents";
import Shared from "./Pages/shared";
import Recent from "./Pages/Recent";
import Register from "./Pages/Register";

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname === "/register";

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/documents" element={<Documents />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
