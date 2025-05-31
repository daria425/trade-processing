import { Auth } from "./components/auth/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./components/Index";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/dashboard/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Index /> },
    { path: "/login", element: <Auth /> },
    {
      path: "/app",
      element: <ProtectedRoute />,
      children: [{ path: "", element: <Dashboard /> }],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
