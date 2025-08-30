// CurrencyField.jsx
"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { HelpCircle } from "lucide-react";

const formatNumber = (value) => {
  const raw = String(value ?? "").replace(/\D/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (formattedValue) => {
  const raw = String(formattedValue ?? "").replace(/,/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export default function CurrencyField({
  name,
  label,
  control,
  helpText,
  rules,
  error,
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <CurrencyInputInner
          field={field}
          label={label}
          helpText={helpText}
          error={error}
        />
      )}
    />
  );
}

function CurrencyInputInner({ field, label, helpText, error }) {
  // Initialize display from the RHF numeric value once
  const [display, setDisplay] = useState(() =>
    field.value === 0 || field.value ? formatNumber(field.value) : ""
  );

  // Sync when RHF value changes externally (e.g., reset/defaultValues)
  useEffect(() => {
    if (field.value === 0 || field.value) {
      setDisplay(formatNumber(field.value));
    } else {
      setDisplay("");
    }
  }, [field.value]);

  return (
    <div className="flex flex-col space-y-2 mb-2">
      <div className="flex items-center justify-between">
        <label className="text-md font-semibold">{label}</label>
        {helpText && (
          <span className="text-gray-500" title={helpText}>
            <HelpCircle className="w-5 h-5" />
          </span>
        )}
      </div>

      <div className="relative border rounded-sm border-gray-300 bg-white">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={(e) => {
            const formatted = formatNumber(e.target.value);
            setDisplay(formatted);
            field.onChange(parseNumber(formatted)); // keep RHF numeric
          }}
          onBlur={() => setDisplay((d) => formatNumber(d))}
          className="w-full rounded-sm pl-7 pr-5 py-3 text-lg"
          aria-invalid={!!error}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
