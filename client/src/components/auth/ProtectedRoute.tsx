import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useMediaQuery } from "usehooks-ts";
import Sidebar from "../dashboard/Sidebar";
export default function ProtectedRoute() {
  const { userData, isLoading, error, getIdToken, setError } =
    useContext(AuthContext);
  const location = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [location, error, setError]);

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        nav("/403");
      } else if (!userData) {
        nav("/login");
      }
    }
  }, [nav, userData, error, isLoading]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div
      className={`bg-slate-950 min-h-screen ${
        !isMobile ? "grid grid-cols-[auto_1fr]" : ""
      }`}
    >
      {isLoading ? null : (
        <>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-white z-50 shadow-sm top-4 left-4 rounded-md p-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}
          <Sidebar
            portfolioValue={userData?.portfolio_value || 0}
            isOpen={isSidebarOpen}
          />
          <Outlet context={{ userData, getIdToken, isBuying }} />
        </>
      )}
    </div>
  );
}
