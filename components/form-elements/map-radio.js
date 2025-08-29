export default function MapRadio({
  id,
  label,
  register,
  requiredText,
  options,
  error,
}) {
  const rules = requiredText ? { required: requiredText } : undefined;
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-xl font-semibold">{label}</p>
      <div className="grid grid-cols-2 gap-4">
        {options?.map((option) => (
          <label key={option} className="block">
            <input
              type="radio"
              value={option}
              {...register(id, rules)}
              className="sr-only peer"
            />
            <div className="cursor-pointer rounded-md border bg-white border-gray-300 p-4 peer-checked:border-blue-600 peer-checked:ring ring-blue-600 peer-checked:bg-blue-100 hover:bg-blue-100 text-center">
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
