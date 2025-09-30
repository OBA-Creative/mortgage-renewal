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
            "Rental rates not available, using standard rates as fallback"
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
        formData?.currentMortgageBalance ?? formData?.mortgageBalance ?? 0
      ),
      borrowAdditionalAmount: Number(formData?.borrowAdditionalAmount ?? 0),
      city: formData?.city ?? "",
      propertyUsage: formData?.propertyUsage ?? "",
    }),
    [formData]
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watched = useWatch({ control });
  const watchedMortgageBal = sanitizeMoney(
    watched?.currentMortgageBalance ?? defaultMortgageBalance
  );

  const watchedBorrowAmt = sanitizeMoney(
    watched?.borrowAdditionalAmount ?? defaultBorrowAmount
  );
  const helocBalance = sanitizeMoney(formData?.helocBalance) || 0;

  // Determine property usage from watched form or store
  const currentPropertyUsage =
    watched?.propertyUsage || formData?.propertyUsage || "";

  // Determine if we should use rental rates
  const useRentalRates =
    currentPropertyUsage === "Rental / Investment" ||
    currentPropertyUsage === "Second Home";

  // Debug effect to track property usage changes
  useEffect(() => {
    if (currentPropertyUsage) {
      console.log("🔄 Property usage changed to:", currentPropertyUsage);
      console.log("💰 Will use rental rates:", useRentalRates);
    }
  }, [currentPropertyUsage, useRentalRates]);

  const totalMortgageRequired =
    (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
    (formData.borrowAdditionalFunds === "yes"
      ? isNaN(watchedBorrowAmt)
        ? 0
        : watchedBorrowAmt
      : 0) +
    (isNaN(helocBalance) ? 0 : helocBalance);

  // Get rates for the user's province/city
  const prov = formData?.province ?? "ON"; // Default to ON if no province

  // Memoize rate calculations to ensure they update when property usage changes
  const { selectedRatesCollection, cityBasedRates, isUsingRentalRates } =
    useMemo(() => {
      const selectedCollection =
        useRentalRates && rentalRates ? rentalRates : rates;
      const cityRates = selectedCollection?.[prov];
      const usingRental = useRentalRates && rentalRates;

      // Log which rates we're using for debugging
      console.log(
        "🏠 Property usage:",
        currentPropertyUsage,
        "📊 Using rental rates:",
        usingRental ? "Yes" : "No",
        "🏢 Rate collection:",
        usingRental ? "Rental" : "Standard"
      );

      return {
        selectedRatesCollection: selectedCollection,
        cityBasedRates: cityRates,
        isUsingRentalRates: usingRental,
      };
    }, [useRentalRates, rentalRates, rates, prov, currentPropertyUsage]);

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

  // Calculate the LTV based on property value
  const propVal = sanitizeMoney(formData?.propertyValue) || 0;
  let rateCategory = "over80"; // Default to highest rate
  let isRefinance = false; // Determine if refinance rates should be used
  let ltv = 0; // Initialize LTV

  if (propVal > 0) {
    ltv = (totalMortgageRequired / propVal) * 100;

    // Determine if this is a refinance scenario (typically over 80% LTV)
    isRefinance = ltv > 80;

    if (ltv <= 65) rateCategory = "under65";
    else if (ltv <= 70) rateCategory = "under70";
    else if (ltv <= 75) rateCategory = "under75";
    else if (ltv <= 80) rateCategory = "under80";
    else rateCategory = "over80";
  }

  // Get the specific rates for the LTV category
  // For refinance scenarios with high LTV, use refinance rates
  let r3F, r4F, r5F, r3VAdjustment, r5VAdjustment;

  let r3FLender, r4FLender, r5FLender, r3VLender, r5VLender;

  if (isRefinance && totalMortgageRequired > 0) {
    // Use refinance rates for high LTV scenarios
    const refinanceCategory = ltv > 75 ? "over25" : "under25"; // Refinance has under25% and over25% equity categories

    r3F =
      cityBasedRates.threeYrFixed.refinance?.[refinanceCategory]?.rate ||
      cityBasedRates.threeYrFixed[rateCategory]?.rate ||
      0;
    r3FLender =
      cityBasedRates.threeYrFixed.refinance?.[refinanceCategory]?.lender ||
      cityBasedRates.threeYrFixed[rateCategory]?.lender ||
      "Default Lender";
    r4F =
      cityBasedRates.fourYrFixed.refinance?.[refinanceCategory]?.rate ||
      cityBasedRates.fourYrFixed[rateCategory]?.rate ||
      0;
    r4FLender =
      cityBasedRates.fourYrFixed.refinance?.[refinanceCategory]?.lender ||
      cityBasedRates.fourYrFixed[rateCategory]?.lender ||
      "Default Lender";
    r5F =
      cityBasedRates.fiveYrFixed.refinance?.[refinanceCategory]?.rate ||
      cityBasedRates.fiveYrFixed[rateCategory]?.rate ||
      0;
    r5FLender =
      cityBasedRates.fiveYrFixed.refinance?.[refinanceCategory]?.lender ||
      cityBasedRates.fiveYrFixed[rateCategory]?.lender ||
      "Default Lender";

    r3VAdjustment =
      cityBasedRates.threeYrVariable.refinance?.[refinanceCategory]
        ?.adjustment ||
      cityBasedRates.threeYrVariable[rateCategory]?.adjustment ||
      0;
    r3VLender =
      cityBasedRates.threeYrVariable.refinance?.[refinanceCategory]?.lender ||
      cityBasedRates.threeYrVariable[rateCategory]?.lender ||
      "Default Lender";
    r5VAdjustment =
      cityBasedRates.fiveYrVariable.refinance?.[refinanceCategory]
        ?.adjustment ||
      cityBasedRates.fiveYrVariable[rateCategory]?.adjustment ||
      0;
    r5VLender =
      cityBasedRates.fiveYrVariable.refinance?.[refinanceCategory]?.lender ||
      cityBasedRates.fiveYrVariable[rateCategory]?.lender ||
      "Default Lender";
  } else {
    // Use regular rates for standard mortgage scenarios
    r3F = cityBasedRates.threeYrFixed[rateCategory]?.rate || 0;
    r3FLender =
      cityBasedRates.threeYrFixed[rateCategory]?.lender || "Default Lender";
    r4F = cityBasedRates.fourYrFixed[rateCategory]?.rate || 0;
    r4FLender =
      cityBasedRates.fourYrFixed[rateCategory]?.lender || "Default Lender";
    r5F = cityBasedRates.fiveYrFixed[rateCategory]?.rate || 0;
    r5FLender =
      cityBasedRates.fiveYrFixed[rateCategory]?.lender || "Default Lender";

    r3VAdjustment =
      cityBasedRates.threeYrVariable[rateCategory]?.adjustment || 0;
    r3VLender =
      cityBasedRates.threeYrVariable[rateCategory]?.lender || "Default Lender";
    r5VAdjustment =
      cityBasedRates.fiveYrVariable[rateCategory]?.adjustment || 0;
    r5VLender =
      cityBasedRates.fiveYrVariable[rateCategory]?.lender || "Default Lender";
  }

  // Variable rates: calculate from prime rate with stored adjustments
  const globalPrimeRate = prime || 0; // Use global prime rate from API

  const r3V = Math.max(0, globalPrimeRate + r3VAdjustment);
  const r5V = Math.max(0, globalPrimeRate + r5VAdjustment);

  // Use fixed 25-year amortization for payment calculations
  const yearsNum = 25;

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
    <div className="flex flex-col items-center ">
      <div className=" mx-auto px-4 py-8 text-center space-y-4">
        <h1 className="text-4xl font-semibold ">
          Here are the best renewal rates that match your profile
        </h1>
        <p className="text-xl">
          If we lock in your rate today, you will be protected from future rate
          increases until {rateLockExpiryDate}
        </p>
      </div>

      <div className="flex space-x-20 ">
        {/* Current Mortgage Balance */}
        <form>
          <div className="min-w-72">
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

            {/* Property Usage Dropdown */}
            <div className="flex flex-col space-y-2 mt-4">
              <label htmlFor="propertyUsage" className="text-md font-semibold">
                Property Usage
              </label>

              <div className="relative border rounded-md border-gray-300 bg-white">
                <select
                  id="propertyUsage"
                  {...register("propertyUsage")}
                  className="appearance-none w-full bg-transparent py-4 pl-4 pr-10  rounded-md"
                >
                  <option value="" disabled>
                    Select property usage
                  </option>
                  {[
                    "Primary Residence",
                    "Second Home",
                    "Primary Residence With Suite",
                    "Rental / Investment",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
              {errors.propertyUsage && (
                <p className="text-red-600 mt-1">
                  {errors.propertyUsage.message}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Rate Cards */}
        <div className="p-4 bg-white rounded-lg border border-gray-300 space-y-4">
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
