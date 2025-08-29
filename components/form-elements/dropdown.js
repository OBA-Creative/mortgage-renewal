export default function Dropdown({
  id,
  label,
  options,
  disabledText,
  register,
  requiredText,
  error,
}) {
  const rules = requiredText ? { required: requiredText } : undefined;
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-xl font-semibold">
        {label}
      </label>
      <div className="relative border rounded-md border-gray-300 bg-white">
        <select
          id={id}
          {...register(id, rules)}
          className="appearance-none w-full bg-transparent py-4 pl-4 pr-10 text-lg rounded-md"
        >
          <option value="" disabled>
            {disabledText}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
