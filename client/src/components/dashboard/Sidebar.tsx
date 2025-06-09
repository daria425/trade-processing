export default function Sidebar({
  portfolioValue,
  isOpen,
}: {
  portfolioValue: number;
  isOpen: boolean;
}) {
  return (
    <>
      <div
        className={`
        fixed md:sticky top-0 left-0 h-full w-64
        bg-slate-900 border-r border-gray-200 
        shadow-sm overflow-y-auto z-60
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
      `}
      >
        <div className="p-4 text-white">
          <div className="bg-slate-950 border border-white rounded-md p-2">
            <h2 className="text-sm font-semibold text-gray-500">
              Portfolio Value
            </h2>
            <p className="text-lg font-semibold text-emerald-500">
              ${portfolioValue.toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <div className="px-4 py-2 text-gray-400">
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Buy Stocks +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
