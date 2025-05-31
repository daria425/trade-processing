import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router";
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
  if (isLoading) {
    return null;
  }
  return <Outlet context={{ userData, getIdToken }} />;
}
