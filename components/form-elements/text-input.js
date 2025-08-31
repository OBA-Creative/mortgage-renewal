export default function TextInput({
  type = "text",
  label,
  id,
  register,
  requiredText,
  validationRules = {}, // Add support for custom validation rules
  error,
  defaultValue = "", // Add default prop
  placeholder = "", // Add placeholder support
  ...rest // Allow other props to pass through
}) {
  // Combine required rule with custom validation rules
  const rules = requiredText
    ? { required: requiredText, ...validationRules }
    : validationRules;

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-xl font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        {...register(id, rules)}
        className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
        {...rest}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
