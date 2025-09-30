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

  const rules = requiredText ? { required: requiredText } : undefined;
  return (
    <div className="flex flex-col space-y-2">
      <LabelWithHelper
        htmlFor={id}
        label={label}
        onHelpClick={() => toggleHelp(id)}
      />
      {activeHelp === id && (
        <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}
      <div className="relative border rounded-md border-gray-300 bg-white">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
          $
        </span>
        <input
          id={id}
          type="text"
          value={valueState || ""}
          placeholder={placeholder}
          {...register(id, rules)}
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
          className="w-full rounded-md pl-7 pr-5 py-4 text-lg placeholder-gray-400"
        />
      </div>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
