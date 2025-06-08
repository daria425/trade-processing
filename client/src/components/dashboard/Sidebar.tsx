import { useState } from "react";

export default function Sidebar({
  portfolioValue,
}: {
  portfolioValue: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-0 left-0 z-50 p-2 bg-indigo-600 text-white rounded-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div
        className={`
        fixed md:sticky top-0 left-0 h-full w-64
        bg-indigo-600 border-r border-gray-200 
        shadow-sm overflow-y-auto z-60
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
      `}
      >
        <div className="p-4 text-white">
          <div className="bg-slate-900 border border-white rounded-md p-2">
            <h2 className="text-sm font-semibold text-gray-500">
              Portfolio Value
            </h2>
            <p className="text-lg font-semibold text-emerald-500">
              ${portfolioValue.toFixed(2)}
            </p>
          </div>
        </div>
        <nav className="space-y-2"></nav>
      </div>
    </>
  );
}
