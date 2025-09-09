import Image from "next/image";
import { useState } from "react";

// Helper function to format rates to always show 2 decimal places
const formatRate = (rate) => {
  if (rate == null || rate === undefined) return "";
  return parseFloat(rate).toFixed(2);
};

// Move RateInputSection outside to prevent re-creation on every render
const RateInputSection = ({
  title,
  rateType,
  titleColor = "text-gray-700",
  formRates,
  handleRateChange,
}) => (
  <div className="mb-6">
    <h4 className={`font-semibold mb-3 text-blue-600`}>{title}</h4>
    <div className="grid grid-cols-3 gap-3">
      {["under65", "under70", "under75", "under80", "over80", "refinance"].map(
        (ltv) => (
          <div key={ltv} className="text-center">
            <label className="block text-xs text-gray-500 mb-1">
              {ltv === "refinance"
                ? "Refi"
                : ltv === "over80"
                ? ">80%"
                : `≤${ltv.slice(-2)}%`}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="20"
              value={formRates[rateType][ltv] || ""}
              onChange={(e) => handleRateChange(rateType, ltv, e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )
      )}
    </div>
  </div>
);

const UpdateRatesForm = ({ province, rates, onClose }) => {
  const [formRates, setFormRates] = useState({
    threeYrFixed: { ...rates.threeYrFixed },
    fourYrFixed: { ...rates.fourYrFixed },
    fiveYrFixed: { ...rates.fiveYrFixed },
    threeYrVariable: { ...rates.threeYrVariable },
    fiveYrVariable: { ...rates.fiveYrVariable },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  const handleRateChange = (rateType, ltvCategory, value) => {
    setFormRates((prev) => ({
      ...prev,
      [rateType]: {
        ...prev[rateType],
        [ltvCategory]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/rates/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provinceCode: province.code,
          rates: formRates,
        }),
      });

      if (response.ok) {
        alert("Rates updated successfully!");
        onClose();
        // Optionally trigger a page refresh or parent component update
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

  const handleUpdateAll = async (e) => {
    e.preventDefault();

    // Confirm with user before updating all provinces
    const confirmUpdate = window.confirm(
      `Are you sure you want to update ALL provinces with ${province.name}'s current rates? This action cannot be undone.`
    );

    if (!confirmUpdate) return;

    setIsUpdatingAll(true);

    try {
      const response = await fetch("/api/admin/rates/update-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rates: formRates,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `All provinces updated successfully with ${province.name}'s rates!`
        );
        onClose();
        // Optionally trigger a page refresh or parent component update
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update all provinces");
      }
    } catch (error) {
      alert("Error updating all provinces: " + error.message);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RateInputSection
        title="3-Year Fixed"
        rateType="threeYrFixed"
        formRates={formRates}
        handleRateChange={handleRateChange}
      />
      <RateInputSection
        title="4-Year Fixed"
        rateType="fourYrFixed"
        formRates={formRates}
        handleRateChange={handleRateChange}
      />
      <RateInputSection
        title="5-Year Fixed"
        rateType="fiveYrFixed"
        formRates={formRates}
        handleRateChange={handleRateChange}
      />
      <RateInputSection
        title="3-Year Variable"
        rateType="threeYrVariable"
        formRates={formRates}
        handleRateChange={handleRateChange}
      />
      <RateInputSection
        title="5-Year Variable"
        rateType="fiveYrVariable"
        formRates={formRates}
        handleRateChange={handleRateChange}
      />

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleUpdateAll}
          disabled={isSubmitting || isUpdatingAll}
          className="px-4 py-2 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
        >
          {isUpdatingAll ? "Updating All..." : "Update All Provinces"}
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
            disabled={isSubmitting || isUpdatingAll}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
          >
            {isSubmitting ? "Updating..." : "Update This Province"}
          </button>
        </div>
      </div>
    </form>
  );
};

const RateSection = ({
  title,
  rates,
  titleStyle = "text-gray-700",
  rateStyle = "font-semibold",
}) => (
  <div className="border-b border-gray-100 pb-3">
    <h4 className={`font-semibold mb-2 text-blue-600`}>{title}</h4>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center">
        <div className="text-gray-500">≤65%</div>
        <div className={rateStyle}>{formatRate(rates?.under65)}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤70%</div>
        <div className={rateStyle}>{formatRate(rates?.under70)}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤75%</div>
        <div className={rateStyle}>{formatRate(rates?.under75)}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤80%</div>
        <div className={rateStyle}>{formatRate(rates?.under80)}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">&gt;80%</div>
        <div className={rateStyle}>{formatRate(rates?.over80)}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">Refi</div>
        <div className={rateStyle}>{formatRate(rates?.refinance)}%</div>
      </div>
    </div>
  </div>
);

const AdminProvinceCard = ({ province, rates }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!rates) return null;

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
              <dd className="text-xs text-gray-400 font-mono">
                {province.code}
              </dd>
            </dl>
          </div>
        </div>

        {/* Rate Sections */}
        <div className="mt-4 space-y-4">
          <RateSection title="3-Year Fixed" rates={rates.threeYrFixed} />

          <RateSection title="4-Year Fixed" rates={rates.fourYrFixed} />

          <RateSection
            title="5-Year Fixed (Popular)"
            rates={rates.fiveYrFixed}
          />

          <RateSection title="3-Year Variable" rates={rates.threeYrVariable} />

          {/* Last section without border */}
          <div>
            <h4 className=" font-semibold text-blue-600 mb-2">
              5-Year Variable
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-500">≤65%</div>
                <div className="font-semibold ">
                  {formatRate(rates.fiveYrVariable?.under65)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤70%</div>
                <div className="font-semibold ">
                  {formatRate(rates.fiveYrVariable?.under70)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤75%</div>
                <div className="font-semibold ">
                  {formatRate(rates.fiveYrVariable?.under75)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤80%</div>
                <div className="font-semibold ">
                  {formatRate(rates.fiveYrVariable?.under80)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">&gt;80%</div>
                <div className="font-semibold">
                  {formatRate(rates.fiveYrVariable?.over80)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Refi</div>
                <div className="font-semibold">
                  {formatRate(rates.fiveYrVariable?.refinance)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-5 rounded-sm overflow-hidden border border-gray-200">
                    <Image
                      src={province.flagImage}
                      alt={`${province.name} flag`}
                      width={32}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Update Rates - {province.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
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
              <UpdateRatesForm
                province={province}
                rates={rates}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProvinceCard;
