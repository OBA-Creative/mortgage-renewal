"use client";

import { Controller } from "react-hook-form";
import { HelpCircle } from "lucide-react";
import { useCallback, useState } from "react";

export default function FormDatePicker({
  id,
  label,
  requiredText,
  control,
  helpTexts,
  error,
}) {
  const [activeHelp, setActiveHelp] = useState(null);

  const toggleHelp = useCallback(
    (key) => setActiveHelp((prev) => (prev === key ? null : key)),
    []
  );

  const rules = requiredText
    ? {
        required: requiredText,
        validate: (value) => {
          // Handle different value types: string, Date object, null, undefined
          if (!value) {
            return requiredText || "This field is required";
          }

          // If it's a string, check if it's empty or just whitespace
          if (typeof value === "string" && value.trim() === "") {
            return requiredText || "This field is required";
          }

          return true;
        },
      }
    : undefined;

  // Convert Date object to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (date) => {
    if (!date) return "";
    if (typeof date === "string") {
      // If it's already a string, check if it's in the right format
      if (date.includes("T")) {
        return date.split("T")[0];
      }
      return date;
    }
    if (date instanceof Date && !isNaN(date)) {
      return date.toISOString().split("T")[0];
    }
    return "";
  };

  // Convert YYYY-MM-DD string to YYYY-MM-DD string (keeping it simple)
  const parseDateFromInput = (dateString) => {
    if (!dateString) return "";
    return dateString; // Keep as string for form validation
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xl font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => toggleHelp(id)}
          className="p-1 text-gray-500 rounded-full cursor-pointer hover:bg-blue-600 hover:text-white"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
      {activeHelp === id && (
        <div className="p-3 mt-2 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}

      <Controller
        control={control}
        name={id}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <input
            id={id}
            type="date"
            value={formatDateForInput(value)}
            onChange={(e) => onChange(parseDateFromInput(e.target.value))}
            onBlur={onBlur}
            min={new Date().toISOString().split("T")[0]}
            max={(() => {
              const maxDate = new Date();
              maxDate.setFullYear(maxDate.getFullYear() + 30);
              return maxDate.toISOString().split("T")[0];
            })()}
            className={`w-full rounded-md border py-4 px-4 text-lg cursor-pointer placeholder-gray-400 ${
              error ? "border-red-500 bg-white" : "border-gray-300 bg-white"
            }`}
          />
        )}
      />
      {error && <p className="mt-1 text-red-600">{error.message}</p>}
    </div>
  );
}
