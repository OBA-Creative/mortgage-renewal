import Image from "next/image";
import { useState, useEffect } from "react";
import { useMortgageStore } from "../../stores/useMortgageStore";
import UpdateRatesForm from "../form-elements/update-rates-form";

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
