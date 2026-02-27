export default function NextButton({ label, disabled }) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={disabled}
        className={`px-12 py-3 font-semibold text-white transition-all duration-200 rounded-full ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
