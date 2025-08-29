export default function TextInput({
  type,
  label,
  id,
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
      <input
        id={id}
        type={type}
        {...register(id, rules)}
        className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
