import Image from "next/image";
import { useState, useEffect } from "react";

// Helper function to format rates to always show 2 decimal places
const formatRate = (rate) => {
  if (rate == null || rate === undefined) return "";
  return parseFloat(rate).toFixed(2);
};

// Canadian lenders list
const lenders = [
  "TD Bank",
  "RBC",
  "BMO",
  "Scotiabank",
  "CIBC",
  "National Bank",
  "Credit Union",
  "Alternative Lender",
  "First National",
  "MCAP",
  "Dominion Lending",
];

// Variable rate discounts from prime
const variableRateDiscounts = {
  threeYrVariable: 0.8, // Prime - 0.8
  fiveYrVariable: 0.9, // Prime - 0.9
};

// Rate input component with lender dropdown
const RateInputField = ({
  ltv,
  rateType,
  value,
  onRateChange,
  onLenderChange,
  isRefinance = false,
  refinanceType = null,
}) => {
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
}) => (
  <div className="mb-6">
    <h4 className={`font-semibold text-xl mb-3 ${titleColor}`}>{title}</h4>

    {/* Regular LTV rates */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {["under65", "under70", "under75", "under80", "over80"].map((ltv) => (
        <RateInputField
          key={ltv}
          ltv={ltv}
          rateType={rateType}
          value={formRates[rateType][ltv]}
          onRateChange={handleRateChange}
          onLenderChange={handleLenderChange}
        />
      ))}
    </div>

    {/* Refinance rates */}
    <div className="border-t pt-3">
      <h5 className="text-xs font-medium text-gray-600 mb-2">
        Refinance Rates
      </h5>
      <div className="grid grid-cols-2 gap-3">
        <RateInputField
          ltv="refinance"
          rateType={rateType}
          value={formRates[rateType].refinance?.under25}
          onRateChange={handleRateChange}
          onLenderChange={handleLenderChange}
          isRefinance={true}
          refinanceType="under25"
        />
        <RateInputField
          ltv="refinance"
          rateType={rateType}
          value={formRates[rateType].refinance?.over25}
          onRateChange={handleRateChange}
          onLenderChange={handleLenderChange}
          isRefinance={true}
          refinanceType="over25"
        />
      </div>
    </div>
  </div>
);

// Variable rate display component (calculated from prime)
const VariableRateSection = ({
  title,
  rateType,
  titleColor = "text-purple-600",
  primeRate,
}) => {
  const discount = variableRateDiscounts[rateType];
  const calculatedRate = primeRate?.rate
    ? (primeRate.rate - discount).toFixed(2)
    : "0.00";

  return (
    <div className="mb-6">
      <h4 className={`font-semibold mb-3 ${titleColor}`}>{title}</h4>
      <div className="bg-purple-50 border border-purple-200 rounded p-3">
        <div className="text-center">
          <span>
            Calculated from Prime Rate ({formatRate(primeRate.rate)}% -{" "}
            {discount}%)
          </span>
          <p className="text-lg font-bold text-purple-700">{calculatedRate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Prime Lender: {primeRate?.lender}
          </p>
          <p className="text-xs text-gray-500">
            Variable rates are automatically calculated and cannot be edited
            directly
          </p>
        </div>
      </div>
    </div>
  );
};

const UpdateRatesForm = ({ province, rates, onClose }) => {
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
  });

  const [primeRate, setPrimeRate] = useState({
    rate: rates.prime?.rate || rates.prime || 0,
    lender: rates.prime?.lender || "RBC",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingMultiple, setIsUpdatingMultiple] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState(
    // Exclude current province from checkboxes since it's always updated
    allProvinces
      .filter((p) => p.code !== province.code)
      .map((p) => ({ ...p, checked: false }))
  );

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
      // Prepare data with prime rate
      const rateData = {
        ...formRates,
        prime: primeRate,
      };

      const response = await fetch("/api/admin/rates/update", {
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
        alert("Rates updated successfully!");
        onClose();
        window.location.reload();
      } else {
        throw new Error("Failed to update rates");
      }
    } catch (error) {
      alert("Error updating rates: " + error.message);
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

    const provinceNames = checkedProvinces.map((p) => p.name).join(", ");
    const confirmUpdate = window.confirm(
      `Are you sure you want to update ${checkedProvinces.length} province(s) (${provinceNames}) with ${province.name}'s current rates? This action cannot be undone.`
    );

    if (!confirmUpdate) return;

    setIsUpdatingMultiple(true);

    try {
      const rateData = {
        ...formRates,
        prime: primeRate,
      };

      const response = await fetch("/api/admin/rates/update-multiple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceProvinceCode: province.code,
          targetProvinceCodes: checkedProvinces.map((p) => p.code),
          rates: rateData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Successfully updated ${checkedProvinces.length} provinces with ${province.name}'s rates!`
        );
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update provinces");
      }
    } catch (error) {
      alert("Error updating provinces: " + error.message);
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
            {/* Prime Rate */}
            <div className="mb-6">
              <h4 className="font-semibold text-xl mb-3 text-blue-600">
                Prime Rate
              </h4>
              <RateInputField
                value={primeRate}
                onRateChange={(value) =>
                  setPrimeRate((prev) => ({
                    ...prev,
                    rate: parseFloat(value) || 0,
                  }))
                }
                onLenderChange={(lender) =>
                  setPrimeRate((prev) => ({ ...prev, lender }))
                }
                placeholder="Prime Rate %"
              />
            </div>

            {/* Fixed Rate Sections */}
            <FixedRateSection
              title="3-Year Fixed"
              rateType="threeYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
            />

            <FixedRateSection
              title="4-Year Fixed"
              rateType="fourYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
            />

            <FixedRateSection
              title="5-Year Fixed"
              rateType="fiveYrFixed"
              formRates={formRates}
              handleRateChange={handleRateChange}
              handleLenderChange={handleLenderChange}
            />

            {/* Province Selection for Multiple Updates */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-xl text-blue-600">
                Update Additional Provinces
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Select provinces to update with {province.name}&apos;s rates
              </p>

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
                  selectedProvinces.filter((p) => p.checked).length === 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200 cursor-pointer"
              >
                {isUpdatingMultiple
                  ? "Updating..."
                  : `Update Selected (${
                      selectedProvinces.filter((p) => p.checked).length
                    })`}
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

// Display version of variable rate section for province card
const VariableRateDisplaySection = ({ title, rateType, primeRate }) => {
  const discount = variableRateDiscounts[rateType];
  const calculatedRate = primeRate?.rate
    ? (primeRate.rate - discount).toFixed(2)
    : "0.00";

  return (
    <div className="border-b border-gray-100 pb-3">
      <h4 className="font-semibold mb-2 text-purple-600">{title}</h4>
      <div className="bg-purple-50 border border-purple-200 rounded p-2">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">
            {calculatedRate}%
          </div>
          <div className="text-xs text-purple-600">
            Prime ({formatRate(primeRate?.rate)}% - {discount}%)
          </div>
          <div className="text-xs text-gray-400">{primeRate?.lender}</div>
        </div>
      </div>
    </div>
  );
};

const RateSection = ({
  title,
  rates,
  titleStyle = "text-gray-700",
  rateStyle = "font-semibold",
}) => {
  console.log(`${title} rates:`, rates);
  return (
    <div className="border-b border-gray-100 pb-3">
      <h4 className="font-semibold mb-2 text-blue-600 text-xl">{title}</h4>
      {!rates ? (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
          ❌ No rates data for {title}
        </div>
      ) : Object.keys(rates).length === 0 ? (
        <div className="text-orange-500 text-sm p-3 bg-orange-50 rounded">
          ⚠️ Empty rates object for {title}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">≤65%</div>
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
            <div className="text-gray-500">≤70%</div>
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
            <div className="text-gray-500">≤75%</div>
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
            <div className="text-gray-500">≤80%</div>
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
            <div className="text-gray-500">&gt;80%</div>
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
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-gray-600  font-medium mb-2">Refinance Rates</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-500">≤25 years of amortization</div>
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
              <div className="text-gray-500">&gt;25 years of amortization</div>
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

const AdminProvinceCard = ({ province, rates }) => {
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
          {/* Prime Rate Display */}
          <div className="bg-gray-50 border border-gray-300 rounded p-3">
            <h4 className="font-semibold text-center text-xl text-blue-600 mb-1">
              Prime Rate
            </h4>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">
                {formatRate(rates.prime?.rate || rates.prime)}%
              </div>
              <div className="text-xs text-gray-700">
                Lender: {rates.prime?.lender || "Unknown"}
              </div>
            </div>
          </div>

          <RateSection title="3-Year Fixed" rates={rates.threeYrFixed} />

          <RateSection title="4-Year Fixed" rates={rates.fourYrFixed} />

          <RateSection title="5-Year Fixed" rates={rates.fiveYrFixed} />
        </div>
      </div>

      {/* Update Modal */}
      {isModalOpen && (
        <UpdateRatesForm
          province={province}
          rates={rates}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminProvinceCard;
