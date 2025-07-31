import "./header.css";
import { NavLink, useNavigate } from "react-router-dom";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-gray-300 shadow-sm bg-white">
      <div className="max-w-screen-lg mx-auto px-4 flex justify-between items-center py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-purple-600">
            <NavLink to="/">CollabZ</NavLink>
          </h1>
          <nav className="hidden md:flex gap-4 text-gray-700">
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-500 text-m font-semibold"
                  : "text-gray-500 font-semibold hover:text-black"
              }
            >
              Documents
            </NavLink>
            <NavLink
              to="/shared"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-500 font-semibold"
                  : "text-gray-500 font-semibold hover:text-black"
              }
            >
              Shared with me
            </NavLink>
            <NavLink
              to="/recent"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-500 font-semibold"
                  : "text-gray-500  font-semibold hover:text-black"
              }
            >
              Recent
            </NavLink>
          </nav>
        </div>
        <div className="flex gap-4 items-center">
          <button className="hidden md:flex items-center gap-1 border border-gray-300 px-4 py-1 rounded hover:bg-gray-300 text-gray-700 hover:text-purple-600 transition-colors duration-200">
            <ShareOutlinedIcon className="text-inherit" />
            Share
          </button>
          <button className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700">
            <AddOutlinedIcon className="text-inherit" /> New Document
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 border border-red-300 px-4 py-1 rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            <LogoutOutlinedIcon className="text-inherit" fontSize="small" />
            Logout
          </button>
          <div className="w-8 h-8 bg-gray-300 rounded-full text-center text-sm font-bold text-white flex items-center justify-center">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
