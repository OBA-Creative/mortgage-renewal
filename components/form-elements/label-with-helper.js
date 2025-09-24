import { HelpCircle } from "lucide-react";

export default function LabelWithHelper({
  htmlFor,
  label,
  onHelpClick,
  className = "text-xl font-semibold",
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={htmlFor} className={className}>
        {label}
      </label>
      <button
        type="button"
        onClick={onHelpClick}
        className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
