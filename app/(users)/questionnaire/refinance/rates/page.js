"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import RateCard from "@/components/cards/rate-card";
import { useMortgageStore } from "@/stores/useMortgageStore";
import CurrencyField from "@/components/form-elements/currency-element";
import BookingModal from "@/components/cards/booking-modal";

export default function RatesPage() {
  const { formData } = useMortgageStore();
  const [rates, setRates] = useState(null);
  const [rentalRates, setRentalRates] = useState(null);
  const [prime, setPrime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const handleInquire = (rateInfo) => {
    setSelectedRate(rateInfo);
    setOpen(true);
  };

  // Fetch rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);

        // Fetch both standard rates and rental rates
        const [ratesResponse, rentalRatesResponse] = await Promise.all([
          fetch("/api/rates"),
          fetch("/api/rates?type=rental"),
        ]);

        if (!ratesResponse.ok) {
          throw new Error("Failed to fetch standard rates");
        }

        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);
        setPrime(ratesData.prime);

        // Handle rental rates (may not exist yet)
        if (rentalRatesResponse.ok) {
          const rentalRatesData = await rentalRatesResponse.json();
          setRentalRates(rentalRatesData.rates);
        } else {
          console.warn(
            "Rental rates not available, using standard rates as fallback",
          );
          setRentalRates(null);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching rates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Calculate rate lock expiry date (120 days from today)
  const rateLockExpiryDate = useMemo(() => {
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 120);

    return expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Safe number formatting that handles both strings and numbers
  const formatNumber = (value) => {
    if (!value && value !== 0) return "";

    // Convert to string and remove all non-digits
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

  function sanitizeMoney(str) {
    if (str == null) return NaN;
    const cleaned = String(str).replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const normalized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    return normalized ? Number(normalized) : NaN;
  }

  // Convert Canadian nominal annual rate (compounded semi-annually)
  // to the effective monthly rate used in Excel PMT:
  // r_m = (1 + (rate/100)/2)^(2/12) - 1
  const monthlyRateFromSemiAnnual = (annualPct) => {
    const j2 = Number(annualPct) / 100 / 2; // semi-annual period rate
    if (!isFinite(j2)) return NaN;
    return Math.pow(1 + j2, 1 / 6) - 1; // 2/12 = 1/6
  };

  function calcMonthlyPayment(balance, annualNominalRatePct, years) {
    const P = Number(balance);
    const n = Math.round(Number(years) * 12);
    if (!isFinite(P) || !isFinite(n) || P <= 0 || n <= 0) return NaN;

    const r = monthlyRateFromSemiAnnual(annualNominalRatePct);
    if (!isFinite(r)) return NaN;

    // PMT(rate=r, nper=n, pv=P, fv=0, type=0) -> payment at period end
    if (Math.abs(r) < 1e-12) return P / n; // zero-rate edge case

    const payment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    return payment;
  }

  const defaultMortgageBalance =
    formData?.currentMortgageBalance ?? formData?.mortgageBalance ?? "";
  const defaultBorrowAmount = formData?.borrowAdditionalAmount ?? 0;

  const defaultValues = useMemo(
    () => ({
      currentMortgageBalance: Number(
        formData?.currentMortgageBalance ?? formData?.mortgageBalance ?? 0,
      ),
      borrowAdditionalAmount: Number(formData?.borrowAdditionalAmount ?? 0),
      amortizationPeriod: Number(formData?.amortizationPeriod ?? 25),
      city: formData?.city ?? "",
    }),
    [formData],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm({
    defaultValues,
    mode: "onChange", // Enable real-time validation
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watched = useWatch({ control });
  const watchedMortgageBal = sanitizeMoney(
    watched?.currentMortgageBalance ?? defaultMortgageBalance,
  );

  const watchedBorrowAmt = sanitizeMoney(
    watched?.borrowAdditionalAmount ?? defaultBorrowAmount,
  );
  const helocBalance = sanitizeMoney(formData?.helocBalance) || 0;
  const yearsNum =
    Number(watched?.amortizationPeriod ?? formData?.amortizationPeriod ?? 0) ||
    0;

  // Get property usage from store (entered in previous step)
  const currentPropertyUsage = formData?.propertyUsage || "";

  // Determine if we should use rental rates based on stored property usage
  const useRentalRates =
    currentPropertyUsage === "Rental / Investment " ||
    currentPropertyUsage === "Second home";

  // Calculate initial total mortgage required (from store values)
  const initialTotalMortgage = useMemo(() => {
    return (
      (sanitizeMoney(
        formData?.currentMortgageBalance ?? formData?.mortgageBalance,
      ) || 0) +
      (formData.borrowAdditionalFunds === "yes"
        ? sanitizeMoney(formData?.borrowAdditionalAmount) || 0
        : 0) +
      (sanitizeMoney(formData?.helocBalance) || 0)
    );
  }, [formData]);

  // Check if user has made changes from initial values
  const hasUserMadeChanges = useMemo(() => {
    const currentTotal =
      (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
      (formData.borrowAdditionalFunds === "yes"
        ? isNaN(watchedBorrowAmt)
          ? 0
          : watchedBorrowAmt
        : 0) +
      (isNaN(helocBalance) ? 0 : helocBalance);

    return Math.abs(currentTotal - initialTotalMortgage) > 1; // Allow for small rounding differences
  }, [
    watchedMortgageBal,
    watchedBorrowAmt,
    helocBalance,
    initialTotalMortgage,
    formData.borrowAdditionalFunds,
  ]);

  const totalMortgageRequired =
    (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
    (formData.borrowAdditionalFunds === "yes"
      ? isNaN(watchedBorrowAmt)
        ? 0
        : watchedBorrowAmt
      : 0) +
    (isNaN(helocBalance) ? 0 : helocBalance);

  // Calculate the LTV based on property value
  const propVal = sanitizeMoney(formData?.propertyValue) || 0;

  // Calculate maximum allowed mortgage (80% of property value)
  const maxMortgageAllowed = propVal * 0.8;

  // Check if total exceeds 80% LTV limit
  const exceedsLTVLimit = totalMortgageRequired > maxMortgageAllowed;

  // Only block rates if user has made changes AND exceeds LTV limit
  const shouldBlockRates = exceedsLTVLimit && hasUserMadeChanges;

  // LTV validation effect - only validate if user has made changes on this page
  useEffect(() => {
    if (propVal > 0 && exceedsLTVLimit && hasUserMadeChanges) {
      const allowedAmount = maxMortgageAllowed - helocBalance;
      const currentInputTotal =
        (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
        (formData.borrowAdditionalFunds === "yes"
          ? isNaN(watchedBorrowAmt)
            ? 0
            : watchedBorrowAmt
          : 0);

      if (currentInputTotal > allowedAmount) {
        setFormError("currentMortgageBalance", {
          type: "ltv-limit",
          message: `Total mortgage cannot exceed 80% of property value ($${maxMortgageAllowed.toLocaleString(
            "en-CA",
            {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            },
          )})`,
        });

        if (formData.borrowAdditionalFunds === "yes") {
          setFormError("borrowAdditionalAmount", {
            type: "ltv-limit",
            message: `Total mortgage cannot exceed 80% of property value`,
          });
        }
      }
    } else {
      // Clear errors when within limit or user hasn't made changes
      clearErrors(["currentMortgageBalance", "borrowAdditionalAmount"]);
    }
  }, [
    watchedMortgageBal,
    watchedBorrowAmt,
    maxMortgageAllowed,
    exceedsLTVLimit,
    propVal,
    helocBalance,
    formData.borrowAdditionalFunds,
    setFormError,
    clearErrors,
    hasUserMadeChanges, // Added this dependency
  ]);

  // Get rates for the user's province/city
  const prov = formData?.province ?? "ON"; // Default to ON if no province

  // Get appropriate rates based on property usage (set in previous step)
  const selectedRatesCollection =
    useRentalRates && rentalRates ? rentalRates : rates;
  const cityBasedRates = selectedRatesCollection?.[prov];

  // Log which rates we're using for debugging
  console.log(
    "🏠 Property usage:",
    currentPropertyUsage,
    "📊 Using rental rates:",
    useRentalRates ? "Yes" : "No",
    "🏢 Rate collection:",
    useRentalRates ? "Rental" : "Standard",
  );

  // Show loading or error states
  if (loading) return <div className="p-8 text-center">Loading rates...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading rates: {error}
      </div>
    );
  if (!rates) return <div className="p-8 text-center">No rates available</div>;

  if (!cityBasedRates) {
    return (
      <div className="p-8 text-center">
        <p>Rates not available for your province ({prov})</p>
      </div>
    );
  }

  // For refinance page, always use refinance rates based on amortization period
  // under25 = amortization period under and equal to 25 years (more than 25% equity remaining)
  // over25 = amortization period over 25 years (less than 25% equity remaining)
  const refinanceCategory = yearsNum <= 25 ? "under25" : "over25";

  // Get refinance rates for the user's province
  const r3F =
    cityBasedRates.threeYrFixed.refinance?.[refinanceCategory]?.rate || 0;
  const r3FLender =
    cityBasedRates.threeYrFixed.refinance?.[refinanceCategory]?.lender ||
    "Default Lender";
  const r4F =
    cityBasedRates.fourYrFixed.refinance?.[refinanceCategory]?.rate || 0;
  const r4FLender =
    cityBasedRates.fourYrFixed.refinance?.[refinanceCategory]?.lender ||
    "Default Lender";
  const r5F =
    cityBasedRates.fiveYrFixed.refinance?.[refinanceCategory]?.rate || 0;
  const r5FLender =
    cityBasedRates.fiveYrFixed.refinance?.[refinanceCategory]?.lender ||
    "Default Lender";

  // Get refinance variable rate adjustments
  const r3VAdjustment =
    cityBasedRates.threeYrVariable.refinance?.[refinanceCategory]?.adjustment ||
    0;
  const r3VLender =
    cityBasedRates.threeYrVariable.refinance?.[refinanceCategory]?.lender ||
    "Default Lender";
  const r5VAdjustment =
    cityBasedRates.fiveYrVariable.refinance?.[refinanceCategory]?.adjustment ||
    0;
  const r5VLender =
    cityBasedRates.fiveYrVariable.refinance?.[refinanceCategory]?.lender ||
    "Default Lender";

  // Variable rates: calculate from prime rate with stored refinance adjustments
  const globalPrimeRate = prime || 0; // Use global prime rate from API

  const r3V = Math.max(0, globalPrimeRate + r3VAdjustment);
  const r5V = Math.max(0, globalPrimeRate + r5VAdjustment);

  // Calculate monthly payments
  const pay3F = calcMonthlyPayment(totalMortgageRequired, r3F, yearsNum);
  const pay4F = calcMonthlyPayment(totalMortgageRequired, r4F, yearsNum);
  const pay5F = calcMonthlyPayment(totalMortgageRequired, r5F, yearsNum);
  const pay3V = calcMonthlyPayment(totalMortgageRequired, r3V, yearsNum);
  const pay5V = calcMonthlyPayment(totalMortgageRequired, r5V, yearsNum);

  // Format for display
  const fmtRate = (r) => (isNaN(r) ? "N/A" : `${Number(r).toFixed(2)}%`);
  const fmtMoney = (p) =>
    isNaN(p)
      ? "N/A"
      : `$${p.toLocaleString("en-CA", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;

  return (
    <div className="flex flex-col items-center pt-24 ">
      <div className="px-4 py-8 mx-auto space-y-4 text-center ">
        <h1 className="text-4xl font-semibold ">
          Here are the best <span className="text-blue-500 ">refinance</span>{" "}
          rates that match your profile
        </h1>
        <p className="text-xl">
          If we lock in your rate today, you will be protected from future rate
          increases until{" "}
          <span className="font-semibold">{rateLockExpiryDate}</span>
        </p>
      </div>
      <div className="flex space-x-20 ">
        {/* Current Mortgage Balance */}
        <form>
          <div className="w-92 ">
            <CurrencyField
              name="currentMortgageBalance"
              label="Current Mortgage Balance"
              control={control}
              error={errors.currentMortgageBalance}
            />
            {/* Additional Borrowing Amount */}
            {formData.borrowAdditionalFunds === "yes" && (
              <CurrencyField
                name="borrowAdditionalAmount"
                label="Additional Amount to Borrow"
                control={control}
                error={errors.borrowAdditionalAmount}
              />
            )}
            {/* Total Mortgage Required */}
            <div className="flex flex-col mt-8 space-y-2">
              <div className="flex flex-col space-y-2 align-baseline ">
                <p className="text-2xl font-semibold">
                  Total Mortgage Required
                </p>
                <p
                  className={`text-2xl font-semibold ${shouldBlockRates ? "text-red-400" : "text-blue-500"}`}
                >
                  $
                  {totalMortgageRequired.toLocaleString("en-CA", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-400">
                This is the total amount calculated from your mortgage balance
                {formData.borrowAdditionalFunds === "yes"
                  ? " and additional borrowing"
                  : ""}
                {helocBalance > 0 ? " plus HELOC balance" : ""}.
              </p>
            </div>

            {/* Amortization Period */}
            <div className="mt-10">
              <label
                htmlFor="amortizationPeriod"
                className="block mb-2 font-semibold text-md"
              >
                Amortization Period:{" "}
                <span className="font-normal">
                  {watched?.amortizationPeriod ||
                    formData?.amortizationPeriod ||
                    25}{" "}
                  years
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                {...register("amortizationPeriod")}
                className="w-full h-2 bg-white border border-gray-300 rounded-full appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between mt-1 text-sm text-gray-400">
                <span>1 yr</span>
                <span>30 yrs</span>
              </div>
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .slider::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
              `}</style>
            </div>
          </div>
        </form>

        {/* Rate Cards */}
        {shouldBlockRates ? (
          <p className="mt-8 text-xl text-center text-gray-500 max-w-72">
            Lower the total mortgage required to see available rates.
          </p>
        ) : (
          <div className="p-4 space-y-4 bg-white border border-gray-300 rounded-lg">
            <RateCard
              percentage={fmtRate(r3F)}
              monthlyPayment={fmtMoney(pay3F)}
              term="3-yr fixed"
              lender={r3FLender}
              onInquire={handleInquire}
            />
            <div className="border-b border-gray-300"></div>
            <RateCard
              percentage={fmtRate(r4F)}
              monthlyPayment={fmtMoney(pay4F)}
              term="4-yr fixed"
              lender={r4FLender}
              onInquire={handleInquire}
            />
            <div className="border-b border-gray-300"></div>
            <RateCard
              percentage={fmtRate(r5F)}
              monthlyPayment={fmtMoney(pay5F)}
              term="5-yr fixed"
              lender={r5FLender}
              onInquire={handleInquire}
            />
            <div className="border-b border-gray-300"></div>
            <RateCard
              percentage={fmtRate(r3V)}
              monthlyPayment={fmtMoney(pay3V)}
              term="3-yr variable"
              lender={r3VLender}
              onInquire={handleInquire}
            />
            <div className="border-b border-gray-300"></div>
            <RateCard
              percentage={fmtRate(r5V)}
              monthlyPayment={fmtMoney(pay5V)}
              term="5-yr variable"
              lender={r5VLender}
              onInquire={handleInquire}
            />
          </div>
        )}
      </div>

      {/* Full-screen modal */}
      {open && (
        <BookingModal
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedRate(null);
          }}
          calendlyUrl="https://calendly.com/obacreative/mortgage-discusion"
          selectedRate={selectedRate}
        />
      )}
    </div>
  );
}
