import { useOutletContext } from "react-router";
import type { AuthContextType } from "../../types/auth.types";
import DataStream from "./DataStream";
export default function Dashboard() {
  const { userData, getIdToken } = useOutletContext<AuthContextType>();

  return (
    <div className="text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Welcome, {userData?.trader.name || "Trader"}!
          </h1>
          <DataStream getIdToken={getIdToken} />
        </div>
      </div>
    </div>
  );
}
