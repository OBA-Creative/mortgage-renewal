"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import RateCard from "@/components/cards/rate-card";
import { useMortgageStore } from "@/stores/useMortgageStore";
import CurrencyField from "@/components/form-elements/currency-element";
import BookingModal from "@/components/cards/booking-modal";
import UpsellRateCard from "@/components/cards/upsell-rate-card";

export default function RatesPage() {
  const { formData } = useMortgageStore();
  const [rates, setRates] = useState(null);
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

        // Fetch standard rates (which now include rental rates)
        const ratesResponse = await fetch("/api/rates");

        if (!ratesResponse.ok) {
          throw new Error("Failed to fetch rates");
        }

        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);
        setPrime(ratesData.prime);
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

  const defaultValues = useMemo(
    () => ({
      currentMortgageBalance: Number(
        formData?.currentMortgageBalance ?? formData?.mortgageBalance ?? 0,
      ),
      borrowAdditionalAmount: Number(formData?.borrowAdditionalAmount ?? 0),
      city: formData?.city ?? "",
    }),
    [formData],
  );

  const {
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
    watched?.currentMortgageBalance ??
      formData?.currentMortgageBalance ??
      formData?.mortgageBalance ??
      "",
  );

  const watchedBorrowAmt = sanitizeMoney(
    watched?.borrowAdditionalAmount ?? formData?.borrowAdditionalAmount ?? 0,
  );
  const helocBalance = sanitizeMoney(formData?.helocBalance) || 0;

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

  // Determine property usage from store
  const currentPropertyUsage = formData?.propertyUsage || "";

  console.log("Current property usage:", currentPropertyUsage);
  console.log("Property usage length:", currentPropertyUsage.length);
  console.log(
    "Property usage char codes:",
    currentPropertyUsage.split("").map((c) => c.charCodeAt(0)),
  );

  // Determine if we should use rental rates (trim to handle any whitespace issues)
  const trimmedPropertyUsage = currentPropertyUsage.trim();
  const useRentalRates =
    trimmedPropertyUsage === "Owner-occupied and Rental" ||
    trimmedPropertyUsage === "Rental / Investment";

  console.log("Should use rental rates:", useRentalRates);

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

  // Get city-based rates for the user's province
  const cityBasedRates = useMemo(() => {
    const cityRates = rates?.[prov];

    // Log which rates we're using for debugging
    console.log(
      "🏠 Property usage:",
      currentPropertyUsage,
      "📊 Using rental rates:",
      useRentalRates ? "Yes" : "No",
    );

    return cityRates;
  }, [rates, prov, currentPropertyUsage, useRentalRates]);

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

  let rateCategory = "over80"; // Default to highest rate
  let ltv = 0; // Initialize LTV

  if (propVal > 0) {
    ltv = (totalMortgageRequired / propVal) * 100;

    // Check if downpayment is "Less than 20%" - if so, always use over80 rates
    if (formData?.downpaymentValue === "Less than 20%") {
      rateCategory = "over80";
      console.log(
        "🔴 Downpayment is less than 20% - using over80 renewal rates",
      );
    } else if (exceedsLTVLimit && !hasUserMadeChanges) {
      // For pre-existing high LTV scenarios, always use over80 rates
      rateCategory = "over80";
      console.log("🔴 Pre-existing high LTV - using over80 renewal rates");
    } else {
      // Normal LTV-based renewal rate calculation
      if (ltv <= 65) rateCategory = "under65";
      else if (ltv <= 70) rateCategory = "under70";
      else if (ltv <= 75) rateCategory = "under75";
      else if (ltv <= 80) rateCategory = "under80";
      else rateCategory = "over80";

      console.log(
        `📊 Normal LTV calculation: ${ltv.toFixed(1)}% → ${rateCategory} renewal rates`,
      );
    }
  }

  // Get renewal rates for the LTV category
  let r3F, r4F, r5F, r3VAdjustment, r5VAdjustment;
  let r3FLender, r4FLender, r5FLender, r3VLender, r5VLender;

  console.log(`� Fetching renewal rates with category: ${rateCategory}`);
  console.log(`🔍 Province: ${prov}, LTV: ${ltv.toFixed(1)}%`);
  console.log(
    `🏦 Available rate categories:`,
    Object.keys(cityBasedRates.threeYrFixed || {}),
  );

  // Always use standard renewal rates (no refinance logic)
  if (useRentalRates) {
    // Use rental rates for investment properties
    r3F = cityBasedRates.threeYrFixed.rental?.rate || 0;
    r3FLender = cityBasedRates.threeYrFixed.rental?.lender || "Default Lender";

    r4F = cityBasedRates.fourYrFixed.rental?.rate || 0;
    r4FLender = cityBasedRates.fourYrFixed.rental?.lender || "Default Lender";

    r5F = cityBasedRates.fiveYrFixed.rental?.rate || 0;
    r5FLender = cityBasedRates.fiveYrFixed.rental?.lender || "Default Lender";

    r3VAdjustment = cityBasedRates.threeYrVariable.rental?.adjustment || 0;
    r3VLender =
      cityBasedRates.threeYrVariable.rental?.lender || "Default Lender";

    r5VAdjustment = cityBasedRates.fiveYrVariable.rental?.adjustment || 0;
    r5VLender =
      cityBasedRates.fiveYrVariable.rental?.lender || "Default Lender";

    console.log("🏢 Using rental rates for investment property");
  } else {
    // Use regular LTV-based rates for owner-occupied properties
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

    console.log(
      `🏠 Using LTV-based rates for owner-occupied property (${rateCategory})`,
    );
  }

  console.log(`💰 Renewal rates - 3F: ${r3F}%, 4F: ${r4F}%, 5F: ${r5F}%`);
  console.log(
    `🏪 Lenders - 3F: ${r3FLender}, 4F: ${r4FLender}, 5F: ${r5FLender}`,
  );

  // Debug specific category data if rates are 0
  if (r3F === 0 || r4F === 0 || r5F === 0) {
    console.log(`🚨 Some rates are 0! Debugging ${rateCategory} data:`, {
      threeYrFixed: cityBasedRates.threeYrFixed?.[rateCategory],
      fourYrFixed: cityBasedRates.fourYrFixed?.[rateCategory],
      fiveYrFixed: cityBasedRates.fiveYrFixed?.[rateCategory],
      threeYrVariable: cityBasedRates.threeYrVariable?.[rateCategory],
      fiveYrVariable: cityBasedRates.fiveYrVariable?.[rateCategory],
    });
    console.log(
      `🗂️ Full database structure:`,
      JSON.stringify(cityBasedRates, null, 2),
    );
  }

  // Variable rates: calculate from prime rate with stored adjustments
  const globalPrimeRate = prime || 0; // Use global prime rate from API

  const r3V = Math.max(0, globalPrimeRate + r3VAdjustment);
  const r5V = Math.max(0, globalPrimeRate + r5VAdjustment);

  // Use actual amortization period from form data, fallback to 25 years
  const yearsNum = formData?.amortizationPeriod || 25;

  // Calculate monthly payments
  const pay3F = calcMonthlyPayment(totalMortgageRequired, r3F, yearsNum);
  const pay4F = calcMonthlyPayment(totalMortgageRequired, r4F, yearsNum);
  const pay5F = calcMonthlyPayment(totalMortgageRequired, r5F, yearsNum);
  const pay3V = calcMonthlyPayment(totalMortgageRequired, r3V, yearsNum);
  const pay5V = calcMonthlyPayment(totalMortgageRequired, r5V, yearsNum);

  // Get refinance rate for over25 category (3-yr fixed) for upsell

  const upsellRate =
    cityBasedRates.threeYrFixed?.refinance?.over25?.rate || 3.4; // fallback to 3.3 if not available
  const upsellPayment = calcMonthlyPayment(
    totalMortgageRequired,
    upsellRate,
    30,
  );

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
      <div className="px-4 py-8 mx-auto space-y-4 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl ">
          Here are the best <span className="text-blue-500 ">renewal</span>{" "}
          rates that match your profile
        </h1>
        <p className="px-4 text-base sm:text-lg lg:text-xl">
          If we lock in your rate today, you will be protected from future rate
          increases until{" "}
          <span className="font-semibold">{rateLockExpiryDate}</span>
        </p>
      </div>

      <div className="flex flex-col-reverse w-full px-4 space-y-8 space-y-reverse lg:flex-row lg:space-x-20 lg:space-y-0 max-w-7xl">
        {/* Current Mortgage Balance */}
        <form className="w-full lg:w-auto">
          <div className="w-full lg:w-92">
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
          </div>
        </form>

        {/* Rate Cards */}
        {shouldBlockRates ? (
          <p className="w-full mt-8 text-xl text-center text-gray-500 max-w-72 lg:w-auto">
            Lower the total mortgage required to see available rates.
          </p>
        ) : (
          <div className="w-full p-4 space-y-4 bg-white border border-gray-300 rounded-lg lg:w-auto">
            <UpsellRateCard monthlyPayment={fmtMoney(upsellPayment)} />
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
