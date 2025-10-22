import { useState, useCallback, useEffect } from "react";
import LabelWithHelper from "./label-with-helper";

const formatNumber = (value) => {
  // Remove all non-digit characters first
  const raw = String(value).replace(/\D/g, "");
  if (!raw) return "";

  // Add commas for thousands separator
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (formattedValue) => {
  // Remove commas and convert to number
  const raw = String(formattedValue).replace(/,/g, "");
  const parsed = parseFloat(raw);
  // Return 0 for invalid numbers instead of empty string, or the parsed number
  return isNaN(parsed) ? 0 : parsed;
};

export default function DollarInput({
  id,
  label,
  setValue,
  valueState,
  setValueState,
  register,
  requiredText,
  helpTexts,
  error,
  defaultValue, // Add support for default values
  placeholder = "Enter amount", // Add placeholder support with default
  onBlur, // Add onBlur callback support
  validationRules, // Add validation rules support
}) {
  const [activeHelp, setActiveHelp] = useState(null);

  // Handle default value on mount
  useEffect(() => {
    if (defaultValue && !valueState) {
      const formatted = formatNumber(defaultValue);
      setValueState(formatted);
      const numericValue = parseNumber(formatted);
      setValue(id, numericValue, { shouldValidate: false });
    }
  }, [defaultValue, valueState, setValueState, setValue, id]);

  const toggleHelp = useCallback(
    (key) => setActiveHelp((prev) => (prev === key ? null : key)),
    []
  );

  const rules =
    validationRules || (requiredText ? { required: requiredText } : undefined);
  return (
    <div className="flex flex-col space-y-2">
      <LabelWithHelper
        htmlFor={id}
        label={label}
        onHelpClick={() => toggleHelp(id)}
      />
      {activeHelp === id && (
        <div className="p-3 mt-2 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}
      <div className="relative bg-white border border-gray-300 rounded-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg text-gray-400">
          $
        </span>
        <input
          id={id}
          type="text"
          value={valueState || ""}
          placeholder={placeholder}
          {...(register ? register(id, rules) : {})}
          onChange={(e) => {
            const inputValue = e.target.value;
            // Format the display value (add commas)
            const formatted = formatNumber(inputValue);
            setValueState(formatted);
            // Set the numeric value for form submission
            const numericValue = parseNumber(formatted);
            setValue(id, numericValue, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          onBlur={(e) => {
            // Call custom onBlur callback if provided
            if (onBlur) {
              // Use the current formatted value from state, not the raw input value
              const numericValue = parseNumber(valueState || e.target.value);
              onBlur(numericValue);
            }
          }}
          className="w-full py-4 pr-5 text-lg placeholder-gray-400 rounded-md pl-7"
        />
      </div>
      {error && <p className="mt-1 text-red-600">{error.message}</p>}
    </div>
  );
}
