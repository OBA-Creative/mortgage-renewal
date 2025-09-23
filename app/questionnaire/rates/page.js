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
  const helocBalance = sanitizeMoney(formData?.helocBalance) || 0;
  const yearsNum =
    Number(watched?.amortizationPeriod ?? formData?.amortizationPeriod ?? 0) ||
    0;

  const totalMortgageRequired =
    (isNaN(watchedMortgageBal) ? 0 : watchedMortgageBal) +
    (formData.borrowAdditionalFunds === "yes"
      ? isNaN(watchedBorrowAmt)
        ? 0
        : watchedBorrowAmt
      : 0) +
    (isNaN(helocBalance) ? 0 : helocBalance);

  // Show loading or error states
  if (loading) return <div className="p-8 text-center">Loading rates...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading rates: {error}
      </div>
    );
  if (!rates) return <div className="p-8 text-center">No rates available</div>;

  // Get rates for the user's province/city
  const prov = formData?.province ?? "ON"; // Default to ON if no province
  const cityBasedRates = rates[prov];

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
  // Fixed rates: extract rate value from rate/lender object
  const r3F = cityBasedRates.threeYrFixed[rateCategory]?.rate || 0;
  const r4F = cityBasedRates.fourYrFixed[rateCategory]?.rate || 0;
  const r5F = cityBasedRates.fiveYrFixed[rateCategory]?.rate || 0;

  // Variable rates: calculate from prime rate with discounts
  const primeRate = cityBasedRates.prime?.rate || 0;
  const r3V = Math.max(0, primeRate - 0.8); // 3-year variable = prime - 0.8%
  const r5V = Math.max(0, primeRate - 0.9); // 5-year variable = prime - 0.9%

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
            {/* Amortization Period */}
            <div className="mt-4">
              <label
                htmlFor="amortizationPeriod"
                className="block font-semibold mb-2"
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
              <div className="flex justify-between text-sm text-gray-700 mt-1">
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
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
                .slider::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }
              `}</style>
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
