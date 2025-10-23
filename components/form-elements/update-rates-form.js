import { useState } from "react";
import { useMortgageStore } from "../../stores/useMortgageStore";

// Store-based lender hook
const useLenders = (isRental = false) => {
  const { getLenders } = useMortgageStore();
  return { lenders: getLenders(isRental), loading: false, error: null };
};

// Variable rate input component with adjustment field
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
    : ltv === "rental"
      ? "Rental"
      : isRefinance
        ? refinanceType === "under25"
          ? "≤25 yrs"
          : ">25 yrs"
        : ltv === "over80"
          ? "Insured"
          : `≤${ltv.slice(-2)}%`;

  const displayLtvColor =
    displayLtv === "Rental"
      ? "text-purple-600"
      : displayLtv === "≤25 yrs" || displayLtv === ">25 yrs"
        ? "text-green-600"
        : "text-blue-600";

  const fieldKey = !ltv ? "" : isRefinance ? `refinance.${refinanceType}` : ltv;

  return (
    <div className="space-y-2">
      <label className={`block text-xs font-medium ${displayLtvColor}`}>
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
          <option value="" disabled>
            Select Lender
          </option>
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
  titleColor = "text-blue-600",
  formRates,
  handleAdjustmentChange,
  handleLenderChange,
  selectedRates,
  toggleRateSelection,
  toggleCategorySelection,
  isRental = false,
}) => (
  <div className="flex pb-2 mb-2 space-x-3 border-b border-gray-300">
    <div className="flex items-start pr-3 mr-3 border-r border-gray-300">
      <input
        type="checkbox"
        id={`category-${rateType}`}
        checked={selectedRates[rateType].categorySelected}
        onChange={() => toggleCategorySelection(rateType)}
        className="mt-6 mr-2 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <label
        htmlFor={`category-${rateType}`}
        className={`font-semibold mt-4 ${titleColor} cursor-pointer`}
      >
        {title}
      </label>
    </div>
    <div>
      {/* Regular LTV rates */}
      <div className="flex space-x-4">
        {["under65", "under70", "under75", "under80", "over80"].map((ltv) => (
          <div key={ltv} className="flex items-start space-x-2">
            <input
              type="checkbox"
              id={`${rateType}-${ltv}`}
              checked={selectedRates[rateType][ltv]}
              onChange={() => toggleRateSelection(rateType, ltv)}
              className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

        {/* Refinance rates */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={`${rateType}-refinanceUnder25`}
                checked={selectedRates[rateType].refinanceUnder25}
                onChange={() =>
                  toggleRateSelection(rateType, "refinanceUnder25")
                }
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                onChange={() =>
                  toggleRateSelection(rateType, "refinanceOver25")
                }
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
        {/* Rental rates */}
        <div className="">
          <div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={`${rateType}-rental`}
                checked={selectedRates[rateType].rental}
                onChange={() => toggleRateSelection(rateType, "rental")}
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="flex-1">
                <VariableRateInputField
                  ltv="rental"
                  rateType={rateType}
                  value={formRates[rateType].rental}
                  onAdjustmentChange={handleAdjustmentChange}
                  onLenderChange={handleLenderChange}
                  isRental={isRental}
                />
              </div>
            </div>
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
    : ltv === "rental"
      ? "Rental"
      : isRefinance
        ? refinanceType === "under25"
          ? "≤25 yrs"
          : ">25 yrs"
        : ltv === "over80"
          ? "Insured"
          : `≤${ltv.slice(-2)}%`;

  const displayLtvColor =
    displayLtv === "Rental"
      ? "text-purple-600"
      : displayLtv === "≤25 yrs" || displayLtv === ">25 yrs"
        ? "text-green-600"
        : "text-blue-600";

  const fieldKey = !ltv ? "" : isRefinance ? `refinance.${refinanceType}` : ltv;

  return (
    <div className="space-y-2">
      <label className={`block text-xs font-medium ${displayLtvColor}`}>
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
          <option value="" disabled>
            Select Lender
          </option>
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
  <div className="flex pb-2 mb-2 space-x-3 border-b border-gray-300">
    <div className="flex items-start pr-3 mb-3 border-r border-gray-300">
      <input
        type="checkbox"
        id={`category-${rateType}`}
        checked={selectedRates[rateType].categorySelected}
        onChange={() => toggleCategorySelection(rateType)}
        className="mt-6 mr-2 text-blue-600 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <label
        htmlFor={`category-${rateType}`}
        className={`font-semibold  ${titleColor} cursor-pointer mt-4`}
      >
        {title}
      </label>
    </div>
    <div>
      {/* Regular LTV rates */}
      <div className="flex space-x-4">
        {["under65", "under70", "under75", "under80", "over80"].map((ltv) => (
          <div key={ltv} className="flex items-start space-x-2">
            <input
              type="checkbox"
              id={`${rateType}-${ltv}`}
              checked={selectedRates[rateType][ltv]}
              onChange={() => toggleRateSelection(rateType, ltv)}
              className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

        {/* Refinance rates */}
        <div className="">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={`${rateType}-refinanceUnder25`}
                checked={selectedRates[rateType].refinanceUnder25}
                onChange={() =>
                  toggleRateSelection(rateType, "refinanceUnder25")
                }
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                onChange={() =>
                  toggleRateSelection(rateType, "refinanceOver25")
                }
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
        {/* Rental rates */}
        <div className="">
          <div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id={`${rateType}-rental`}
                checked={selectedRates[rateType].rental}
                onChange={() => toggleRateSelection(rateType, "rental")}
                className="mt-6 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <div className="flex-1">
                <RateInputField
                  ltv="rental"
                  rateType={rateType}
                  value={formRates[rateType].rental}
                  onRateChange={handleRateChange}
                  onLenderChange={handleLenderChange}
                  isRental={isRental}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UpdateRatesForm = ({ province, rates, onClose, isRental = false }) => {
  // Debug log to see what rates structure we're receiving
  console.log(
    "UpdateRatesForm received rates:",
    JSON.stringify(rates, null, 2)
  );

  // Helper function to normalize rental data that might have corrupted nested structure
  const normalizeRental = (rentalData, isFixed = true) => {
    if (!rentalData) {
      // Return appropriate default based on rate type
      return isFixed ? { rate: 0, lender: "" } : { adjustment: 0, lender: "" };
    }

    // Check if this is the old corrupted nested structure from database for variable rates
    // Variable rates in DB currently look like: { adjustment: { adjustment: -0.54, lender: "MCAP" } }
    if (
      rentalData.adjustment &&
      typeof rentalData.adjustment === "object" &&
      rentalData.adjustment.adjustment !== undefined
    ) {
      return {
        adjustment: rentalData.adjustment.adjustment || 0,
        lender: rentalData.adjustment.lender || "",
      };
    }

    // Check if this is corrupted nested structure for fixed rates in database
    // Fixed rates in DB currently look like: { rate: { rate: 5.43, lender: "Credit Union" } }
    if (
      rentalData.rate &&
      typeof rentalData.rate === "object" &&
      rentalData.rate.rate !== undefined
    ) {
      return {
        rate: rentalData.rate.rate || 0,
        lender: rentalData.rate.lender || "",
      };
    }

    // Return the data as-is if it's already properly structured
    return rentalData;
  };

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
      rental: normalizeRental(rates.threeYrFixed?.rental, true), // Fixed rates
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
      rental: normalizeRental(rates.fourYrFixed?.rental, true), // Fixed rates
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
      rental: normalizeRental(rates.fiveYrFixed?.rental, true), // Fixed rates
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
      rental: normalizeRental(rates.threeYrVariable?.rental, false), // Variable rates
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
      rental: normalizeRental(rates.fiveYrVariable?.rental, false), // Variable rates
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
      rental: false,
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
      rental: false,
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
      rental: false,
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
      rental: false,
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
      rental: false,
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

          // Add selected rental rates
          if (rateCategory.rental) {
            filteredRateData[rateType].rental = formRates[rateType].rental;
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
          rental: categorySelected,
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
        "rental",
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
          rental: true,
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
          rental: false,
        };
      });
      return newSelectedRates;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-black/55 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto ">
        <div className="py-2 pl-6 pr-4 bg-blue-600 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Update Rates - {province.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-md cursor-pointer hover:text-red-500 hover:bg-white"
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
              title="3yr FX"
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
              title="4yr FX"
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
              title="5yr FX"
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
              title="3yr VAR"
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
              title="5yr VAR"
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
            <div className="border-gray-200 ">
              {/* Selection Summary */}
              {/* <div className="p-3 mb-4 rounded-lg bg-blue-50">
              <div className="p-3 mb-4 rounded-lg bg-blue-50">
                <div className="text-sm">
                  <strong>Selection Summary:</strong>
                  <div className="mt-1">
                    • Provinces selected:{" "}
                    {selectedProvinces.filter((p) => p.checked).length}
                  </div>
                  <div>• Rates selected: {getSelectedRatesCount()}</div>
                  {getSelectedRatesCount() === 0 && (
                    <div className="mt-1 font-medium text-red-600">
                      ⚠️ Please select rates above (use checkboxes next to rate
                      categories or individual rates)
                    </div>
                  )}
                  <div className="flex mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={selectAllRates}
                      className="px-2 py-1 text-xs text-blue-800 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Select All Rates
                    </button>
                    <button
                      type="button"
                      onClick={clearAllRates}
                      className="px-2 py-1 text-xs text-gray-800 transition-colors bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Clear All Rates
                    </button>
                  </div>
                </div>
              </div> */}

              {/* Select All Toggle */}
              <div className="mt-2 mb-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedProvinces.every((p) => p.checked)}
                    onChange={toggleAllProvinces}
                    className="mr-2 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  Select All Provinces
                </label>
              </div>

              {/* Province Checkboxes Grid */}
              <div className="grid grid-cols-6 gap-1 ">
                {selectedProvinces.map((prov) => (
                  <label
                    key={prov.code}
                    className="flex items-center text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={prov.checked}
                      onChange={() => toggleProvinceSelection(prov.code)}
                      className="mr-2 text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="mr-1 text-xs font-bold">{prov.code}</span>
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
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleUpdateMultiple}
                disabled={
                  isSubmitting ||
                  isUpdatingMultiple ||
                  selectedProvinces.filter((p) => p.checked).length === 0 ||
                  getSelectedRatesCount() === 0
                }
                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdatingMultiple}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UpdateRatesForm;
