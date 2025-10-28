export default function NextButton({ label }) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        className="px-12 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
      >
        {label}
      </button>
    </div>
  );
}
