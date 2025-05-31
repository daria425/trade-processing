import { useOutletContext } from "react-router";
import type { AuthContextType } from "../../types/auth.types";
export default function Dashboard() {
  const { userData } = useOutletContext<AuthContextType>();

  return (
    <div className="bg-slate-900 min-h-screen text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Welcome, {userData?.trader.name || "Trader"}!
          </h1>
          <p className="text-indigo-300 mt-2">
            Your trading dashboard is ready
          </p>
        </div>
      </div>
    </div>
  );
}
