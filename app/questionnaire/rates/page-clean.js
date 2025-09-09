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
  const [prime, setPrime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const handleInquire = () => setOpen(true);

  // Fetch rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rates");
        if (!response.ok) {
          throw new Error("Failed to fetch rates");
        }
        const data = await response.json();
        setRates(data.rates);
        setPrime(data.prime);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching rates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Helper to create LTV-based rate structure
  const createLTVRates = useCallback(
    (baseRate, isVariable = false) => {
      const base = parseFloat(baseRate);
      if (isNaN(base)) return {};

      if (isVariable) {
        // Variable rates: add to prime rate with LTV adjustments
        const primeNum = parseFloat(prime) || 6.95;
        return {
          under65: (primeNum + base + 0.0).toFixed(2),
          under70: (primeNum + base + 0.1).toFixed(2),
          under75: (primeNum + base + 0.2).toFixed(2),
          under80: (primeNum + base + 0.3).toFixed(2),
          over80: (primeNum + base + 0.4).toFixed(2),
        };
      } else {
        // Fixed rates: add LTV adjustments
        return {
          under65: (base + 0.0).toFixed(2),
          under70: (base + 0.1).toFixed(2),
          under75: (base + 0.2).toFixed(2),
          under80: (base + 0.3).toFixed(2),
          over80: (base + 0.4).toFixed(2),
        };
      }
    },
    [prime]
  );

  // Create rates object from database data
  const transformedRates = useMemo(() => {
    if (!rates) return null;

    const transformed = {};
    const provinces = [
      "AB",
      "BC",
      "MB",
      "NB",
      "NL",
      "NS",
      "NT",
      "NU",
      "ON",
      "PE",
      "QC",
      "SK",
      "YT",
    ];

    provinces.forEach((province) => {
      if (rates[province]) {
        transformed[province] = {
          threeYrFixed: createLTVRates(rates[province].threeYrFixed),
          fourYrFixed: createLTVRates(rates[province].fourYrFixed),
          fiveYrFixed: createLTVRates(rates[province].fiveYrFixed),
          threeYrVariable: createLTVRates(
            rates[province].threeYrVariable,
            true
          ),
          fiveYrVariable: createLTVRates(rates[province].fiveYrVariable, true),
        };
      }
    });

    return transformed;
  }, [rates, createLTVRates]);

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
      amortizationPeriod: Number(formData?.amortizationPeriod ?? 25),
      city: formData?.city ?? "",
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
  const yearsNum =
    Number(watched?.amortizationPeriod ?? formData?.amortizationPeriod ?? 0) ||
    0;

  const totalMortgageRequired =
    (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
    (formData.borrowAdditionalFunds === "yes"
      ? isNaN(watchedBorrowAmt)
        ? 0
        : watchedBorrowAmt
      : 0);

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

  // Show loading or error states
  if (loading) return <div className="p-8 text-center">Loading rates...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading rates: {error}
      </div>
    );
  if (!transformedRates)
    return <div className="p-8 text-center">No rates available</div>;

  // Get rates for the user's province/city
  const prov = formData?.province ?? "ON"; // Default to ON if no province
  const cityBasedRates = transformedRates[prov];

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

  if (propVal > 0) {
    const ltv = (totalMortgageRequired / propVal) * 100;

    if (ltv <= 65) rateCategory = "under65";
    else if (ltv <= 70) rateCategory = "under70";
    else if (ltv <= 75) rateCategory = "under75";
    else if (ltv <= 80) rateCategory = "under80";
    else rateCategory = "over80";
  }

  // Get the specific rates for the LTV category
  const r3F = cityBasedRates.threeYrFixed[rateCategory];
  const r4F = cityBasedRates.fourYrFixed[rateCategory];
  const r5F = cityBasedRates.fiveYrFixed[rateCategory];
  const r3V = cityBasedRates.threeYrVariable[rateCategory];
  const r5V = cityBasedRates.fiveYrVariable[rateCategory];

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
          Here are the best rates that match your profile
        </h1>
        <p className="text-xl">
          If we lock in your rate today, you will be protected from future rate
          increases until {rateLockExpiryDate}
        </p>
      </div>
      <div className="flex space-x-20 ">
        {/* Current Mortgage Balance */}
        <form>
          <div className="space-y-6 mb-8">
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
            {/* Amortization Period */}
            <div>
              <label
                htmlFor="amortizationPeriod"
                className="block  font-semibold mb-2"
              >
                Amortization Period (years)
              </label>
              <input
                {...register("amortizationPeriod")}
                className="w-full border rounded px-4 py-2 bg-white border-gray-300 h-14 text-lg"
              ></input>
            </div>
          </div>
        </form>

        {/* Rate Cards */}
        <div className="p-4 bg-white rounded-lg border border-gray-300 space-y-4">
          <RateCard
            percentage={fmtRate(r3F)}
            monthlyPayment={fmtMoney(pay3F)}
            term="3-yr fixed"
            onInquire={handleInquire}
          />
          <div className="border-b border-gray-300"></div>
          <RateCard
            percentage={fmtRate(r4F)}
            monthlyPayment={fmtMoney(pay4F)}
            term="4-yr fixed"
            onInquire={handleInquire}
          />
          <div className="border-b border-gray-300"></div>
          <RateCard
            percentage={fmtRate(r5F)}
            monthlyPayment={fmtMoney(pay5F)}
            term="5-yr fixed"
            onInquire={handleInquire}
          />
          <div className="border-b border-gray-300"></div>
          <RateCard
            percentage={fmtRate(r3V)}
            monthlyPayment={fmtMoney(pay3V)}
            term="3-yr variable"
            onInquire={handleInquire}
          />
          <div className="border-b border-gray-300"></div>
          <RateCard
            percentage={fmtRate(r5V)}
            monthlyPayment={fmtMoney(pay5V)}
            term="5-yr variable"
            onInquire={handleInquire}
          />
        </div>
      </div>

      {/* Full-screen modal */}
      {open && (
        <BookingModal
          open={open}
          onClose={() => setOpen(false)}
          calendlyUrl="https://calendly.com/obacreative/mortgage-discusion"
        />
      )}
    </div>
  );
}
