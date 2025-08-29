export default function NextButton({ label }) {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold py-3 px-12 cursor-pointer "
      >
        {label}
      </button>
    </div>
  );
}
