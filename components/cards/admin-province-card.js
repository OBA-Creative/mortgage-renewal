import Image from "next/image";
import { useState, useEffect } from "react";
import { useMortgageStore } from "../../stores/useMortgageStore";

// Helper function to format rates to always show 2 decimal places
const formatRate = (rate) => {
  if (rate == null || rate === undefined) return "";
  return parseFloat(rate).toFixed(2);
};

// Store-based lender hook
const useLenders = (isRental = false) => {
  const { getLenders } = useMortgageStore();
  return { lenders: getLenders(isRental), loading: false, error: null };
};

// Variable rate discounts from prime
const variableRateDiscounts = {
  threeYrVariable: 0.8, // Prime - 0.8
  fiveYrVariable: 0.9, // Prime - 0.9
};

// Variable rate input component with lender dropdown (uses adjustment instead of rate)
const VariableRateInputField = ({
  ltv,
  rateType,
  value,
  onAdjustmentChange,
  onLenderChange,
  isRefinance = false,
  refinanceType = null,
  isRental = false,
}) => {
  const { lenders } = useLenders(isRental);
  const displayLtv = !ltv
    ? ""
    : isRefinance
    ? refinanceType === "under25"
      ? "≤25 years of amortization"
      : ">25 years of amortization"
    : ltv === "over80"
    ? ">80%"
    : `≤${ltv.slice(-2)}%`;

  const fieldKey = !ltv ? "" : isRefinance ? `refinance.${refinanceType}` : ltv;

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-600 font-medium">
        {displayLtv}
      </label>
      <div className="space-y-1">
        <input
          type="number"
          step="0.01"
          min="-5"
          max="5"
          value={value?.adjustment || ""}
          onChange={(e) => {
            if (rateType && fieldKey) {
              onAdjustmentChange(rateType, fieldKey, e.target.value);
            } else {
              onAdjustmentChange(e.target.value);
            }
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
          placeholder="Adjustment %"
        />
        <select
          value={value?.lender || ""}
          onChange={(e) => {
            if (rateType && fieldKey) {
              onLenderChange(rateType, fieldKey, e.target.value);
            } else {
              onLenderChange(e.target.value);
            }
          }}
          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
        >
          <option value="">Select Lender</option>
          {lenders.map((lender) => (
            <option key={lender} value={lender}>
              {lender}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Variable rate section component for forms
const VariableRateFormSection = ({
  title,
  rateType,
  titleColor = "text-blue-800",
  formRates,
  handleAdjustmentChange,
  handleLenderChange,
  selectedRates,
  toggleRateSelection,
  toggleCategorySelection,
  isRental = false,
}) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        id={`category-${rateType}`}
        checked={selectedRates[rateType].categorySelected}
        onChange={() => toggleCategorySelection(rateType)}
        className="mr-3 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <label
        htmlFor={`category-${rateType}`}
        className={`font-semibold text-xl ${titleColor} cursor-pointer`}
      >
        {title}
      </label>
      <span className="ml-2 text-sm text-gray-500">
        (Select all rates in this category)
      </span>
    </div>

    {/* Regular LTV rates */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {["under65", "under70", "under75", "under80", "over80"].map((ltv) => (
        <div key={ltv} className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-${ltv}`}
            checked={selectedRates[rateType][ltv]}
            onChange={() => toggleRateSelection(rateType, ltv)}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <VariableRateInputField
              ltv={ltv}
              rateType={rateType}
              value={formRates[rateType][ltv]}
              onAdjustmentChange={handleAdjustmentChange}
              onLenderChange={handleLenderChange}
              isRental={isRental}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Refinance rates */}
    <div className="border-t pt-3">
      <h5 className="text-xs font-medium text-gray-600 mb-2">
        Refinance Rates
      </h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-refinanceUnder25`}
            checked={selectedRates[rateType].refinanceUnder25}
            onChange={() => toggleRateSelection(rateType, "refinanceUnder25")}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <VariableRateInputField
              ltv="refinance"
              rateType={rateType}
              value={formRates[rateType].refinance?.under25}
              onAdjustmentChange={handleAdjustmentChange}
              onLenderChange={handleLenderChange}
              isRefinance={true}
              refinanceType="under25"
              isRental={isRental}
            />
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-refinanceOver25`}
            checked={selectedRates[rateType].refinanceOver25}
            onChange={() => toggleRateSelection(rateType, "refinanceOver25")}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <VariableRateInputField
              ltv="refinance"
              rateType={rateType}
              value={formRates[rateType].refinance?.over25}
              onAdjustmentChange={handleAdjustmentChange}
              onLenderChange={handleLenderChange}
              isRefinance={true}
              refinanceType="over25"
              isRental={isRental}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Rate input component with lender dropdown
const RateInputField = ({
  ltv,
  rateType,
  value,
  onRateChange,
  onLenderChange,
  isRefinance = false,
  refinanceType = null,
  isRental = false,
}) => {
  const { lenders } = useLenders(isRental);
  const displayLtv = !ltv
    ? ""
    : isRefinance
    ? refinanceType === "under25"
      ? "≤25 years of amortization"
      : ">25 years of amortization"
    : ltv === "over80"
    ? ">80%"
    : `≤${ltv.slice(-2)}%`;

  const fieldKey = !ltv ? "" : isRefinance ? `refinance.${refinanceType}` : ltv;

  return (
    <div className="space-y-2">
      <label className="block text-xs text-gray-600 font-medium">
        {displayLtv}
      </label>
      <div className="space-y-1">
        <input
          type="number"
          step="0.01"
          min="0"
          max="20"
          value={value?.rate || ""}
          onChange={(e) => {
            if (rateType && fieldKey) {
              onRateChange(rateType, fieldKey, e.target.value);
            } else {
              onRateChange(e.target.value);
            }
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Rate %"
        />
        <select
          value={value?.lender || ""}
          onChange={(e) => {
            if (rateType && fieldKey) {
              onLenderChange(rateType, fieldKey, e.target.value);
            } else {
              onLenderChange(e.target.value);
            }
          }}
          className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Lender</option>
          {lenders.map((lender) => (
            <option key={lender} value={lender}>
              {lender}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Fixed rate section component
const FixedRateSection = ({
  title,
  rateType,
  titleColor = "text-blue-600",
  formRates,
  handleRateChange,
  handleLenderChange,
  selectedRates,
  toggleRateSelection,
  toggleCategorySelection,
  isRental = false,
}) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        id={`category-${rateType}`}
        checked={selectedRates[rateType].categorySelected}
        onChange={() => toggleCategorySelection(rateType)}
        className="mr-3 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <label
        htmlFor={`category-${rateType}`}
        className={`font-semibold text-xl ${titleColor} cursor-pointer`}
      >
        {title}
      </label>
      <span className="ml-2 text-sm text-gray-500">
        (Select all rates in this category)
      </span>
    </div>

    {/* Regular LTV rates */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {["under65", "under70", "under75", "under80", "over80"].map((ltv) => (
        <div key={ltv} className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-${ltv}`}
            checked={selectedRates[rateType][ltv]}
            onChange={() => toggleRateSelection(rateType, ltv)}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <RateInputField
              ltv={ltv}
              rateType={rateType}
              value={formRates[rateType][ltv]}
              onRateChange={handleRateChange}
              onLenderChange={handleLenderChange}
              isRental={isRental}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Refinance rates */}
    <div className="border-t pt-3">
      <h5 className="text-xs font-medium text-gray-600 mb-2">
        Refinance Rates
      </h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-refinanceUnder25`}
            checked={selectedRates[rateType].refinanceUnder25}
            onChange={() => toggleRateSelection(rateType, "refinanceUnder25")}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <RateInputField
              ltv="refinance"
              rateType={rateType}
              value={formRates[rateType].refinance?.under25}
              onRateChange={handleRateChange}
              onLenderChange={handleLenderChange}
              isRefinance={true}
              refinanceType="under25"
              isRental={isRental}
            />
          </div>
        </div>
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id={`${rateType}-refinanceOver25`}
            checked={selectedRates[rateType].refinanceOver25}
            onChange={() => toggleRateSelection(rateType, "refinanceOver25")}
            className="mt-6 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div className="flex-1">
            <RateInputField
              ltv="refinance"
              rateType={rateType}
              value={formRates[rateType].refinance?.over25}
              onRateChange={handleRateChange}
              onLenderChange={handleLenderChange}
              isRefinance={true}
              refinanceType="over25"
              isRental={isRental}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UpdateRatesForm = ({ province, rates, onClose, isRental = false }) => {
  // Province list for checkboxes
  const allProvinces = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
  ];

  // Initialize form state with new structure
  const [formRates, setFormRates] = useState({
    threeYrFixed: {
      under65: {
        rate: rates.threeYrFixed?.under65?.rate || 0,
        lender: rates.threeYrFixed?.under65?.lender || "",
      },
      under70: {
        rate: rates.threeYrFixed?.under70?.rate || 0,
        lender: rates.threeYrFixed?.under70?.lender || "",
      },
      under75: {
        rate: rates.threeYrFixed?.under75?.rate || 0,
        lender: rates.threeYrFixed?.under75?.lender || "",
      },
      under80: {
        rate: rates.threeYrFixed?.under80?.rate || 0,
        lender: rates.threeYrFixed?.under80?.lender || "",
      },
      over80: {
        rate: rates.threeYrFixed?.over80?.rate || 0,
        lender: rates.threeYrFixed?.over80?.lender || "",
      },
      refinance: {
        under25: {
          rate: rates.threeYrFixed?.refinance?.under25?.rate || 0,
          lender: rates.threeYrFixed?.refinance?.under25?.lender || "",
        },
        over25: {
          rate: rates.threeYrFixed?.refinance?.over25?.rate || 0,
          lender: rates.threeYrFixed?.refinance?.over25?.lender || "",
        },
      },
    },
    fourYrFixed: {
      under65: {
        rate: rates.fourYrFixed?.under65?.rate || 0,
        lender: rates.fourYrFixed?.under65?.lender || "",
      },
      under70: {
        rate: rates.fourYrFixed?.under70?.rate || 0,
        lender: rates.fourYrFixed?.under70?.lender || "",
      },
      under75: {
        rate: rates.fourYrFixed?.under75?.rate || 0,
        lender: rates.fourYrFixed?.under75?.lender || "",
      },
      under80: {
        rate: rates.fourYrFixed?.under80?.rate || 0,
        lender: rates.fourYrFixed?.under80?.lender || "",
      },
      over80: {
        rate: rates.fourYrFixed?.over80?.rate || 0,
        lender: rates.fourYrFixed?.over80?.lender || "",
      },
      refinance: {
        under25: {
          rate: rates.fourYrFixed?.refinance?.under25?.rate || 0,
          lender: rates.fourYrFixed?.refinance?.under25?.lender || "",
        },
        over25: {
          rate: rates.fourYrFixed?.refinance?.over25?.rate || 0,
          lender: rates.fourYrFixed?.refinance?.over25?.lender || "",
        },
      },
    },
    fiveYrFixed: {
      under65: {
        rate: rates.fiveYrFixed?.under65?.rate || 0,
        lender: rates.fiveYrFixed?.under65?.lender || "",
      },
      under70: {
        rate: rates.fiveYrFixed?.under70?.rate || 0,
        lender: rates.fiveYrFixed?.under70?.lender || "",
      },
      under75: {
        rate: rates.fiveYrFixed?.under75?.rate || 0,
        lender: rates.fiveYrFixed?.under75?.lender || "",
      },
      under80: {
        rate: rates.fiveYrFixed?.under80?.rate || 0,
        lender: rates.fiveYrFixed?.under80?.lender || "",
      },
      over80: {
        rate: rates.fiveYrFixed?.over80?.rate || 0,
        lender: rates.fiveYrFixed?.over80?.lender || "",
      },
      refinance: {
        under25: {
          rate: rates.fiveYrFixed?.refinance?.under25?.rate || 0,
          lender: rates.fiveYrFixed?.refinance?.under25?.lender || "",
        },
        over25: {
          rate: rates.fiveYrFixed?.refinance?.over25?.rate || 0,
          lender: rates.fiveYrFixed?.refinance?.over25?.lender || "",
        },
      },
    },
    threeYrVariable: {
      under65: {
        adjustment: rates.threeYrVariable?.under65?.adjustment || 0,
        lender: rates.threeYrVariable?.under65?.lender || "",
      },
      under70: {
        adjustment: rates.threeYrVariable?.under70?.adjustment || 0,
        lender: rates.threeYrVariable?.under70?.lender || "",
      },
      under75: {
        adjustment: rates.threeYrVariable?.under75?.adjustment || 0,
        lender: rates.threeYrVariable?.under75?.lender || "",
      },
      under80: {
        adjustment: rates.threeYrVariable?.under80?.adjustment || 0,
        lender: rates.threeYrVariable?.under80?.lender || "",
      },
      over80: {
        adjustment: rates.threeYrVariable?.over80?.adjustment || 0,
        lender: rates.threeYrVariable?.over80?.lender || "",
      },
      refinance: {
        under25: {
          adjustment:
            rates.threeYrVariable?.refinance?.under25?.adjustment || 0,
          lender: rates.threeYrVariable?.refinance?.under25?.lender || "",
        },
        over25: {
          adjustment: rates.threeYrVariable?.refinance?.over25?.adjustment || 0,
          lender: rates.threeYrVariable?.refinance?.over25?.lender || "",
        },
      },
    },
    fiveYrVariable: {
      under65: {
        adjustment: rates.fiveYrVariable?.under65?.adjustment || 0,
        lender: rates.fiveYrVariable?.under65?.lender || "",
      },
      under70: {
        adjustment: rates.fiveYrVariable?.under70?.adjustment || 0,
        lender: rates.fiveYrVariable?.under70?.lender || "",
      },
      under75: {
        adjustment: rates.fiveYrVariable?.under75?.adjustment || 0,
        lender: rates.fiveYrVariable?.under75?.lender || "",
      },
      under80: {
        adjustment: rates.fiveYrVariable?.under80?.adjustment || 0,
        lender: rates.fiveYrVariable?.under80?.lender || "",
      },
      over80: {
        adjustment: rates.fiveYrVariable?.over80?.adjustment || 0,
        lender: rates.fiveYrVariable?.over80?.lender || "",
      },
      refinance: {
        under25: {
          adjustment: rates.fiveYrVariable?.refinance?.under25?.adjustment || 0,
          lender: rates.fiveYrVariable?.refinance?.under25?.lender || "",
        },
        over25: {
          adjustment: rates.fiveYrVariable?.refinance?.over25?.adjustment || 0,
          lender: rates.fiveYrVariable?.refinance?.over25?.lender || "",
        },
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingMultiple, setIsUpdatingMultiple] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState(
    // Exclude current province from checkboxes since it's always updated
    allProvinces
      .filter((p) => p.code !== province.code)
      .map((p) => ({ ...p, checked: false }))
  );

  // State to track which rates should be copied during bulk update
  const [selectedRates, setSelectedRates] = useState({
    threeYrFixed: {
      categorySelected: false,
      under65: false,
      under70: false,
      under75: false,
      under80: false,
      over80: false,
      refinanceUnder25: false,
      refinanceOver25: false,
    },
    fourYrFixed: {
      categorySelected: false,
      under65: false,
      under70: false,
      under75: false,
      under80: false,
      over80: false,
      refinanceUnder25: false,
      refinanceOver25: false,
    },
    fiveYrFixed: {
      categorySelected: false,
      under65: false,
      under70: false,
      under75: false,
      under80: false,
      over80: false,
      refinanceUnder25: false,
      refinanceOver25: false,
    },
    threeYrVariable: {
      categorySelected: false,
      under65: false,
      under70: false,
      under75: false,
      under80: false,
      over80: false,
      refinanceUnder25: false,
      refinanceOver25: false,
    },
    fiveYrVariable: {
      categorySelected: false,
      under65: false,
      under70: false,
      under75: false,
      under80: false,
      over80: false,
      refinanceUnder25: false,
      refinanceOver25: false,
    },
  });

  const handleRateChange = (rateType, fieldKey, value) => {
    const numericValue = parseFloat(value) || 0;

    if (fieldKey.includes("refinance.")) {
      const refinanceType = fieldKey.split(".")[1];
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          refinance: {
            ...prev[rateType].refinance,
            [refinanceType]: {
              ...prev[rateType].refinance[refinanceType],
              rate: numericValue,
            },
          },
        },
      }));
    } else {
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          [fieldKey]: {
            ...prev[rateType][fieldKey],
            rate: numericValue,
          },
        },
      }));
    }
  };

  const handleAdjustmentChange = (rateType, fieldKey, value) => {
    const numericValue = parseFloat(value) || 0;

    if (fieldKey.includes("refinance.")) {
      const refinanceType = fieldKey.split(".")[1];
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          refinance: {
            ...prev[rateType].refinance,
            [refinanceType]: {
              ...prev[rateType].refinance[refinanceType],
              adjustment: numericValue,
            },
          },
        },
      }));
    } else {
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          [fieldKey]: {
            ...prev[rateType][fieldKey],
            adjustment: numericValue,
          },
        },
      }));
    }
  };

  const handleLenderChange = (rateType, fieldKey, lender) => {
    if (fieldKey.includes("refinance.")) {
      const refinanceType = fieldKey.split(".")[1];
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          refinance: {
            ...prev[rateType].refinance,
            [refinanceType]: {
              ...prev[rateType].refinance[refinanceType],
              lender: lender,
            },
          },
        },
      }));
    } else {
      setFormRates((prev) => ({
        ...prev,
        [rateType]: {
          ...prev[rateType],
          [fieldKey]: {
            ...prev[rateType][fieldKey],
            lender: lender,
          },
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data without prime rate (prime rate is managed separately)
      const rateData = {
        ...formRates,
      };

      const apiEndpoint = isRental
        ? "/api/admin/rental-rates/update"
        : "/api/admin/rates/update";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provinceCode: province.code,
          rates: rateData,
        }),
      });

      if (response.ok) {
        const successMessage = isRental
          ? "Rental rates updated successfully!"
          : "Rates updated successfully!";
        alert(successMessage);
        onClose();
        window.location.reload();
      } else {
        throw new Error(
          isRental ? "Failed to update rental rates" : "Failed to update rates"
        );
      }
    } catch (error) {
      const errorMessage = isRental
        ? "Error updating rental rates: "
        : "Error updating rates: ";
      alert(errorMessage + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMultiple = async (e) => {
    e.preventDefault();

    const checkedProvinces = selectedProvinces.filter((p) => p.checked);

    if (checkedProvinces.length === 0) {
      alert("Please select at least one province to update.");
      return;
    }

    const selectedRatesCount = getSelectedRatesCount();
    if (selectedRatesCount === 0) {
      alert("Please select at least one rate to copy to other provinces.");
      return;
    }

    const provinceNames = checkedProvinces.map((p) => p.name).join(", ");
    const confirmMessage = isRental
      ? `Are you sure you want to update ${checkedProvinces.length} province(s) (${provinceNames}) with ${selectedRatesCount} selected rental rate(s) from ${province.name}? This action cannot be undone.`
      : `Are you sure you want to update ${checkedProvinces.length} province(s) (${provinceNames}) with ${selectedRatesCount} selected rate(s) from ${province.name}? This action cannot be undone.`;

    const confirmUpdate = window.confirm(confirmMessage);
    if (!confirmUpdate) return;

    setIsUpdatingMultiple(true);

    try {
      // Filter formRates to only include selected rates
      const filteredRateData = {};

      Object.keys(selectedRates).forEach((rateType) => {
        const rateCategory = selectedRates[rateType];
        const hasSelectedRates = Object.keys(rateCategory).some(
          (key) => key !== "categorySelected" && rateCategory[key]
        );

        if (hasSelectedRates) {
          filteredRateData[rateType] = {};

          // Add selected LTV rates
          ["under65", "under70", "under75", "under80", "over80"].forEach(
            (ltv) => {
              if (rateCategory[ltv]) {
                filteredRateData[rateType][ltv] = formRates[rateType][ltv];
              }
            }
          );

          // Add selected refinance rates
          if (rateCategory.refinanceUnder25 || rateCategory.refinanceOver25) {
            filteredRateData[rateType].refinance = {};

            if (rateCategory.refinanceUnder25) {
              filteredRateData[rateType].refinance.under25 =
                formRates[rateType].refinance?.under25;
            }

            if (rateCategory.refinanceOver25) {
              filteredRateData[rateType].refinance.over25 =
                formRates[rateType].refinance?.over25;
            }
          }
        }
      });

      const apiEndpoint = isRental
        ? "/api/admin/rental-rates/update-multiple"
        : "/api/admin/rates/update-multiple";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceProvinceCode: province.code,
          targetProvinceCodes: checkedProvinces.map((p) => p.code),
          rates: filteredRateData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const successMessage = isRental
          ? `Successfully updated ${checkedProvinces.length} provinces with ${selectedRatesCount} selected rental rate(s) from ${province.name}!`
          : `Successfully updated ${checkedProvinces.length} provinces with ${selectedRatesCount} selected rate(s) from ${province.name}!`;
        alert(successMessage);
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        const errorMessage = isRental
          ? "Failed to update rental rates for provinces"
          : "Failed to update provinces";
        throw new Error(errorData.message || errorMessage);
      }
    } catch (error) {
      const errorPrefix = isRental
        ? "Error updating rental rate provinces: "
        : "Error updating provinces: ";
      alert(errorPrefix + error.message);
    } finally {
      setIsUpdatingMultiple(false);
    }
  };

  const toggleProvinceSelection = (provinceCode) => {
    setSelectedProvinces((prev) =>
      prev.map((p) =>
        p.code === provinceCode ? { ...p, checked: !p.checked } : p
      )
    );
  };

  const toggleAllProvinces = () => {
    const allChecked = selectedProvinces.every((p) => p.checked);
    setSelectedProvinces((prev) =>
      prev.map((p) => ({ ...p, checked: !allChecked }))
    );
  };

  // Functions to handle rate selection for bulk updates
  const toggleRateSelection = (rateType, rateKey) => {
    setSelectedRates((prev) => {
      const newSelectedRates = {
        ...prev,
        [rateType]: {
          ...prev[rateType],
          [rateKey]: !prev[rateType][rateKey],
        },
      };

      // Update category selection based on individual selections
      const categoryKeys = [
        "under65",
        "under70",
        "under75",
        "under80",
        "over80",
        "refinanceUnder25",
        "refinanceOver25",
      ];
      const allCategoryRatesSelected = categoryKeys.every(
        (key) => newSelectedRates[rateType][key]
      );
      const someCategoryRatesSelected = categoryKeys.some(
        (key) => newSelectedRates[rateType][key]
      );

      newSelectedRates[rateType].categorySelected = allCategoryRatesSelected;

      return newSelectedRates;
    });
  };

  const toggleCategorySelection = (rateType) => {
    setSelectedRates((prev) => {
      const categorySelected = !prev[rateType].categorySelected;
      return {
        ...prev,
        [rateType]: {
          ...prev[rateType],
          categorySelected,
          under65: categorySelected,
          under70: categorySelected,
          under75: categorySelected,
          under80: categorySelected,
          over80: categorySelected,
          refinanceUnder25: categorySelected,
          refinanceOver25: categorySelected,
        },
      };
    });
  };

  const getSelectedRatesCount = () => {
    let count = 0;
    Object.keys(selectedRates).forEach((rateType) => {
      const categoryKeys = [
        "under65",
        "under70",
        "under75",
        "under80",
        "over80",
        "refinanceUnder25",
        "refinanceOver25",
      ];
      categoryKeys.forEach((key) => {
        if (selectedRates[rateType][key]) count++;
      });
    });
    return count;
  };

  const selectAllRates = () => {
    setSelectedRates((prev) => {
      const newSelectedRates = { ...prev };
      Object.keys(newSelectedRates).forEach((rateType) => {
        newSelectedRates[rateType] = {
          categorySelected: true,
          under65: true,
          under70: true,
          under75: true,
          under80: true,
          over80: true,
          refinanceUnder25: true,
          refinanceOver25: true,
        };
      });
      return newSelectedRates;
    });
  };

  const clearAllRates = () => {
    setSelectedRates((prev) => {
      const newSelectedRates = { ...prev };
      Object.keys(newSelectedRates).forEach((rateType) => {
        newSelectedRates[rateType] = {
          categorySelected: false,
          under65: false,
          under70: false,
          under75: false,
          under80: false,
          over80: false,
          refinanceUnder25: false,
          refinanceOver25: false,
        };
      });
      return newSelectedRates;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Update Rates - {province.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fixed Rate Sections */}
            <FixedRateSection
              title="3-Year Fixed"
              rateType="threeYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
              selectedRates={selectedRates}
              toggleRateSelection={toggleRateSelection}
              toggleCategorySelection={toggleCategorySelection}
              isRental={isRental}
            />

            <FixedRateSection
              title="4-Year Fixed"
              rateType="fourYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
              selectedRates={selectedRates}
              toggleRateSelection={toggleRateSelection}
              toggleCategorySelection={toggleCategorySelection}
              isRental={isRental}
            />

            <FixedRateSection
              title="5-Year Fixed"
              rateType="fiveYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
              selectedRates={selectedRates}
              toggleRateSelection={toggleRateSelection}
              toggleCategorySelection={toggleCategorySelection}
              isRental={isRental}
            />

            {/* Variable Rate Sections */}
            <VariableRateFormSection
              title="3-Year Variable"
              rateType="threeYrVariable"
              formRates={formRates}
              handleAdjustmentChange={handleAdjustmentChange}
              handleLenderChange={handleLenderChange}
              selectedRates={selectedRates}
              toggleRateSelection={toggleRateSelection}
              toggleCategorySelection={toggleCategorySelection}
              isRental={isRental}
            />

            <VariableRateFormSection
              title="5-Year Variable"
              rateType="fiveYrVariable"
              formRates={formRates}
              handleAdjustmentChange={handleAdjustmentChange}
              handleLenderChange={handleLenderChange}
              selectedRates={selectedRates}
              toggleRateSelection={toggleRateSelection}
              toggleCategorySelection={toggleCategorySelection}
              isRental={isRental}
            />

            {/* Province Selection for Multiple Updates */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-xl text-blue-600">
                Update Additional Provinces
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Select provinces to update and choose which rates to copy from{" "}
                {province.name}
              </p>

              {/* Selection Summary */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <strong>Selection Summary:</strong>
                  <div className="mt-1">
                    • Provinces selected:{" "}
                    {selectedProvinces.filter((p) => p.checked).length}
                  </div>
                  <div>• Rates selected: {getSelectedRatesCount()}</div>
                  {getSelectedRatesCount() === 0 && (
                    <div className="text-red-600 font-medium mt-1">
                      ⚠️ Please select rates above (use checkboxes next to rate
                      categories or individual rates)
                    </div>
                  )}
                  <div className="mt-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllRates}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    >
                      Select All Rates
                    </button>
                    <button
                      type="button"
                      onClick={clearAllRates}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                    >
                      Clear All Rates
                    </button>
                  </div>
                </div>
              </div>

              {/* Select All Toggle */}
              <div className="mb-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedProvinces.every((p) => p.checked)}
                    onChange={toggleAllProvinces}
                    className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  Select All Provinces
                </label>
              </div>

              {/* Province Checkboxes Grid */}
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                {selectedProvinces.map((prov) => (
                  <label
                    key={prov.code}
                    className="flex items-center text-sm text-gray-700 hover:bg-gray-50 p-1 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={prov.checked}
                      onChange={() => toggleProvinceSelection(prov.code)}
                      className="mr-2 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-xs font-bold mr-1">{prov.code}</span>
                  </label>
                ))}
              </div>

              {selectedProvinces.filter((p) => p.checked).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {selectedProvinces.filter((p) => p.checked).length}{" "}
                  province(s) selected
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleUpdateMultiple}
                disabled={
                  isSubmitting ||
                  isUpdatingMultiple ||
                  selectedProvinces.filter((p) => p.checked).length === 0 ||
                  getSelectedRatesCount() === 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 cursor-pointer"
              >
                {isUpdatingMultiple
                  ? "Updating..."
                  : `Update Selected (${
                      selectedProvinces.filter((p) => p.checked).length
                    } provinces, ${getSelectedRatesCount()} rates)`}
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdatingMultiple}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                >
                  {isSubmitting ? "Updating..." : "Update This Province"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Variable rate section component (displays adjustments and calculated rates)
const VariableRateSection = ({ title, rateType, rates, primeRate }) => {
  console.log(`${title} rates:`, rates);
  return (
    <div>
      <h4 className="font-semibold mb-2 text-gray-700 ">{title}</h4>
      {!rates ? (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
          ❌ No rates data for {title}
        </div>
      ) : Object.keys(rates).length === 0 ? (
        <div className="text-orange-500 text-sm p-3 bg-orange-50 rounded">
          ⚠️ Empty rates object for {title}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤65%</div>
            <div className="font-semibold text-blue-600">
              {primeRate && rates?.under65?.adjustment !== undefined
                ? (primeRate + rates.under65.adjustment).toFixed(2)
                : "0.00"}
              %
            </div>
            <div className="text-gray-400 text-[10px]">
              {rates?.under65?.adjustment >= 0 ? "+" : ""}
              {rates?.under65?.adjustment}%
            </div>
            {rates?.under65?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under65.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤70%</div>
            <div className="font-semibold text-blue-600">
              {primeRate && rates?.under70?.adjustment !== undefined
                ? (primeRate + rates.under70.adjustment).toFixed(2)
                : "0.00"}
              %
            </div>
            <div className="text-gray-400 text-[10px]">
              {rates?.under70?.adjustment >= 0 ? "+" : ""}
              {rates?.under70?.adjustment}%
            </div>
            {rates?.under70?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under70.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤75%</div>
            <div className="font-semibold text-blue-600">
              {primeRate && rates?.under75?.adjustment !== undefined
                ? (primeRate + rates.under75.adjustment).toFixed(2)
                : "0.00"}
              %
            </div>
            <div className="text-gray-400 text-[10px]">
              {rates?.under75?.adjustment >= 0 ? "+" : ""}
              {rates?.under75?.adjustment}%
            </div>
            {rates?.under75?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under75.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤80%</div>
            <div className="font-semibold text-blue-600">
              {primeRate && rates?.under80?.adjustment !== undefined
                ? (primeRate + rates.under80.adjustment).toFixed(2)
                : "0.00"}
              %
            </div>
            <div className="text-gray-400 text-[10px]">
              {rates?.under80?.adjustment >= 0 ? "+" : ""}
              {rates?.under80?.adjustment}%
            </div>
            {rates?.under80?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under80.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">&gt;80%</div>
            <div className="font-semibold text-blue-600">
              {primeRate && rates?.over80?.adjustment !== undefined
                ? (primeRate + rates.over80.adjustment).toFixed(2)
                : "0.00"}
              %
            </div>
            <div className="text-gray-400 text-[10px]">
              {rates?.over80?.adjustment >= 0 ? "+" : ""}
              {rates?.over80?.adjustment}%
            </div>
            {rates?.over80?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.over80.lender}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refinance rates section */}
      {rates?.refinance && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-500 bg-blue-50 rounded mb-1">
                ≤25 years of amortization
              </div>
              <div className="font-semibold text-blue-600">
                {primeRate &&
                rates?.refinance?.under25?.adjustment !== undefined
                  ? (primeRate + rates.refinance.under25.adjustment).toFixed(2)
                  : "0.00"}
                %
              </div>
              <div className="text-gray-400 text-[10px]">
                {rates?.refinance?.under25?.adjustment >= 0 ? "+" : ""}
                {rates?.refinance?.under25?.adjustment}%
              </div>
              {rates?.refinance?.under25?.lender && (
                <div className="text-gray-400 text-[10px]">
                  {rates.refinance.under25.lender}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-gray-500 bg-blue-50 rounded mb-1">
                &gt;25 years of amortization
              </div>
              <div className="font-semibold text-blue-600">
                {primeRate && rates?.refinance?.over25?.adjustment !== undefined
                  ? (primeRate + rates.refinance.over25.adjustment).toFixed(2)
                  : "0.00"}
                %
              </div>
              <div className="text-gray-400 text-[10px]">
                {rates?.refinance?.over25?.adjustment >= 0 ? "+" : ""}
                {rates?.refinance?.over25?.adjustment}%
              </div>
              {rates?.refinance?.over25?.lender && (
                <div className="text-gray-400 text-[10px]">
                  {rates.refinance.over25.lender}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RateSection = ({
  title,
  rates,
  titleStyle = "text-gray-700",
  rateStyle = "font-semibold text-blue-600",
}) => {
  console.log(`${title} rates:`, rates);
  return (
    <div>
      <h4 className="font-semibold mb-2 text-gray-700">{title}</h4>
      {!rates ? (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
          ❌ No rates data for {title}
        </div>
      ) : Object.keys(rates).length === 0 ? (
        <div className="text-orange-500 text-sm p-3 bg-orange-50 rounded">
          ⚠️ Empty rates object for {title}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤65%</div>
            <div className={rateStyle}>
              {formatRate(rates?.under65?.rate || rates?.under65)}%
            </div>
            {rates?.under65?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under65.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤70%</div>
            <div className={rateStyle}>
              {formatRate(rates?.under70?.rate || rates?.under70)}%
            </div>
            {rates?.under70?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under70.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤75%</div>
            <div className={rateStyle}>
              {formatRate(rates?.under75?.rate || rates?.under75)}%
            </div>
            {rates?.under75?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under75.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">≤80%</div>
            <div className={rateStyle}>
              {formatRate(rates?.under80?.rate || rates?.under80)}%
            </div>
            {rates?.under80?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.under80.lender}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-500 bg-blue-50 rounded mb-1">&gt;80%</div>
            <div className={rateStyle}>
              {formatRate(rates?.over80?.rate || rates?.over80)}%
            </div>
            {rates?.over80?.lender && (
              <div className="text-gray-400 text-[10px]">
                {rates.over80.lender}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refinance rates section */}
      {rates?.refinance && (
        <div className="mt-4 ">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-500 bg-blue-50 rounded mb-1">
                ≤25 years of amortization
              </div>
              <div className={rateStyle}>
                {formatRate(rates?.refinance?.under25?.rate)}%
              </div>
              {rates?.refinance?.under25?.lender && (
                <div className="text-gray-400 text-[10px]">
                  {rates.refinance.under25.lender}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-gray-500 bg-blue-50 rounded mb-1">
                &gt;25 years of amortization
              </div>
              <div className={rateStyle}>
                {formatRate(rates?.refinance?.over25?.rate)}%
              </div>
              {rates?.refinance?.over25?.lender && (
                <div className="text-gray-400 text-[10px]">
                  {rates.refinance.over25.lender}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminProvinceCard = ({
  province,
  rates,
  primeRate,
  isRental = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug the entire rates object for this province
  console.log(
    `AdminProvinceCard for ${province.name} (${province.code}):`,
    rates
  );

  if (!rates) {
    console.log(`No rates found for ${province.code}`);
    return null;
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg relative">
      <div className="px-4 py-5 sm:p-6">
        {/* Update Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
          title="Update rates"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        {/* Province Header */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-8 rounded-md overflow-hidden shadow-md border border-gray-200">
              <Image
                src={province.flagImage}
                alt={`${province.name} flag`}
                width={48}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {province.name}
              </dt>
              <dd className="text-xs text-gray-400 ">{province.code}</dd>
            </dl>
          </div>
        </div>

        {/* Rate Sections */}
        <div className="mt-4 space-y-4">
          <RateSection title="3-Year Fixed" rates={rates.threeYrFixed} />

          <RateSection title="4-Year Fixed" rates={rates.fourYrFixed} />

          <RateSection title="5-Year Fixed" rates={rates.fiveYrFixed} />

          <VariableRateSection
            title="3-Year Variable"
            rateType="threeYrVariable"
            rates={rates.threeYrVariable}
            primeRate={primeRate}
          />

          <VariableRateSection
            title="5-Year Variable"
            rateType="fiveYrVariable"
            rates={rates.fiveYrVariable}
            primeRate={primeRate}
          />
        </div>
      </div>

      {/* Update Modal */}
      {isModalOpen && (
        <UpdateRatesForm
          province={province}
          rates={rates}
          onClose={() => setIsModalOpen(false)}
          isRental={isRental}
        />
      )}
    </div>
  );
};

export default AdminProvinceCard;
