import { useState, useCallback } from "react";
import { HelpCircle } from "lucide-react";

const formatNumber = (value) => {
  const raw = value.replace(/\D/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
}) {
  const [activeHelp, setActiveHelp] = useState(null);

  const toggleHelp = useCallback(
    (key) => setActiveHelp((prev) => (prev === key ? null : key)),
    []
  );

  const rules = requiredText ? { required: requiredText } : undefined;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="propertyValue" className="text-xl font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => toggleHelp(id)}
          className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
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
          value={valueState}
          {...register(id, rules)}
          onChange={(e) => {
            const formatted = formatNumber(e.target.value);
            setValueState(formatted);
            const numeric = formatted.replace(/,/g, "");
            setValue(id, numeric ? parseFloat(numeric) : "");
          }}
          className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
        />
      </div>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
