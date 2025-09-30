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
  min,
  max,
  realTimeValidation = false, // New prop to enable real-time validation
  ...rest // Allow other props to pass through
}) {
  const [activeHelp, setActiveHelp] = useState(null);
  const [realtimeError, setRealtimeError] = useState("");

  const toggleHelp = (key) =>
    setActiveHelp((prev) => (prev === key ? null : key));

  // Real-time validation handler for number inputs
  const handleInputChange = (e) => {
    if (type === "number" && realTimeValidation) {
      const value = e.target.value;

      // Clear error if input is empty
      if (value === "") {
        setRealtimeError("");
        return;
      }

      // Check for non-integer values
      if (!/^\d+$/.test(value)) {
        setRealtimeError("Please round it to the closest number of years");
        return;
      }

      const numValue = parseInt(value, 10);

      // Check min constraint
      if (min !== undefined && numValue < min) {
        setRealtimeError(`Minimum number of amortization years is ${min}`);
        return;
      }

      // Check max constraint
      if (max !== undefined && numValue > max) {
        setRealtimeError(`Maximum number of amortization years is ${max}`);
        return;
      }

      // Clear error if all validations pass
      setRealtimeError("");
    }
  };

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
        className={`w-full rounded-md border py-4 px-4 text-lg ${
          realtimeError
            ? "border-red-500 bg-red-50"
            : error
              ? "border-red-500 bg-white"
              : "border-gray-300 bg-white"
        } ${
          type === "number"
            ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            : ""
        }`}
        onChange={realTimeValidation ? handleInputChange : undefined}
        min={min}
        max={max}
        {...rest}
      />
      {/* Show real-time error first, then form validation error */}
      {realtimeError ? (
        <p className="text-red-600 mt-1 font-medium">{realtimeError}</p>
      ) : error ? (
        <p className="text-red-600 mt-1">{error.message}</p>
      ) : null}
    </div>
  );
}
