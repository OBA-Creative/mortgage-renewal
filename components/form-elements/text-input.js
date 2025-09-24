import { useState } from "react";
import LabelWithHelper from "./label-with-helper";

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
  helpTexts, // Extract helpTexts to prevent DOM attribute error
  ...rest // Allow other props to pass through
}) {
  const [activeHelp, setActiveHelp] = useState(null);

  const toggleHelp = (key) =>
    setActiveHelp((prev) => (prev === key ? null : key));

  // Combine required rule with custom validation rules
  const rules = requiredText
    ? { required: requiredText, ...validationRules }
    : validationRules;

  return (
    <div className="flex flex-col space-y-2">
      <LabelWithHelper
        htmlFor={id}
        label={label}
        onHelpClick={helpTexts ? () => toggleHelp(id) : undefined}
      />
      {activeHelp === id && helpTexts && (
        <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}
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
