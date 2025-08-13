export default function Heading({ createBusinessOpen, setCreateBusinessOpen }) {
  return (
    <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between animate-[fadeIn_0.6s_ease-in-out]">
      <h3 className="text-base font-semibold text-gray-900">Businesses</h3>
      <div className="mt-3 sm:mt-0 sm:ml-4">
        <button
          type="button"
          onClick={() => setCreateBusinessOpen(!createBusinessOpen)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Create new business
        </button>
      </div>
    </div>
  );
}
