"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import RateCard from "@/components/cards/rate-card";
import { useMortgageStore } from "@/stores/useMortgageStore";

// Demo rates (real ones should be imported from DB)
const rates = {
  BC: {
    "3YearFixed": 3.6,
    "4YearFixed": 4.1,
    "5YearFixed": 4.6,
    "3YearVariable": 3.1,
    "5YearVariable": 4.3,
  },
};

function sanitizeMoney(str) {
  if (str == null) return NaN;
  const cleaned = String(str).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const normalized =
    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  return normalized ? Number(normalized) : NaN;
}

function calcMonthlyPayment(balance, annualRatePct, years) {
  const P = Number(balance);
  const n = Number(years) * 12;
  if (!isFinite(P) || !isFinite(n) || P <= 0 || n <= 0) return NaN;

  const r = Number(annualRatePct) / 100 / 12;
  if (!isFinite(r)) return NaN;
  if (r === 0) return P / n;

  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

export default function RatesPage() {
  const { formData } = useMortgageStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const defaultValues = useMemo(
    () => ({
      currentMortgageBalance:
        formData?.currentMortgageBalance ?? formData?.mortgageBalance ?? "",
      amortizationPeriod: formData?.amortizationPeriod ?? "",
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
  const balanceNum = sanitizeMoney(watched?.currentMortgageBalance);
  const yearsNum = Number(watched?.amortizationPeriod);

  const pay3Fixed = calcMonthlyPayment(
    balanceNum,
    rates.BC["3YearFixed"],
    yearsNum
  );
  const pay4Fixed = calcMonthlyPayment(
    balanceNum,
    rates.BC["4YearFixed"],
    yearsNum
  );
  const pay5Fixed = calcMonthlyPayment(
    balanceNum,
    rates.BC["5YearFixed"],
    yearsNum
  );
  const pay3Var = calcMonthlyPayment(
    balanceNum,
    rates.BC["3YearVariable"],
    yearsNum
  );
  const pay5Var = calcMonthlyPayment(
    balanceNum,
    rates.BC["5YearVariable"],
    yearsNum
  );

  const fmtMoney = (num) =>
    isFinite(num)
      ? new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency: "CAD",
          maximumFractionDigits: 0,
        }).format(num)
      : "—";

  const onSubmit = (data) => {
    console.log("Form submitted with:", data);
  };

  const dateValidUntil = new Date();
  dateValidUntil.setDate(dateValidUntil.getDate() + 120);
  const formattedDate = dateValidUntil.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Optional: close modal on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl mx-auto">
        Here are the best rates that match your profile
      </h1>

      <p className="text-xl text-center">
        {`If we lock in your rate today, you will be protected from future rate increases until ${formattedDate}`}
      </p>

      <div className="flex items-start space-x-10">
        {/* Left column: form */}
        <div className="flex flex-col mt-7 mb-4 bg-white rounded-md border border-gray-200 p-4 w-full max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-sm font-medium mb-1">
              Current mortgage balance
            </label>
            <input
              type="text"
              placeholder="e.g., 450,000"
              inputMode="decimal"
              className="border border-gray-300 rounded-md p-2 mb-3 w-full"
              {...register("currentMortgageBalance", {
                setValueAs: (v) => String(v ?? "").replace(/[^0-9.]/g, ""),
              })}
            />
            {errors.currentMortgageBalance && (
              <p className="text-sm text-red-600 mb-2">
                {errors.currentMortgageBalance.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1">
              Amortization period (years)
            </label>
            <input
              type="number"
              placeholder="e.g., 25"
              className="border border-gray-300 rounded-md p-2 mb-3 w-full"
              {...register("amortizationPeriod", {
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1 year" },
                max: { value: 40, message: "Must be 40 years or less" },
              })}
            />
            {errors.amortizationPeriod && (
              <p className="text-sm text-red-600 mb-2">
                {errors.amortizationPeriod.message}
              </p>
            )}

            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              placeholder="e.g., Vancouver"
              className="border border-gray-300 rounded-md p-2 mb-4 w-full"
              {...register("city")}
            />
            {errors.city && (
              <p className="text-sm text-red-600 mb-2">{errors.city.message}</p>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              Update rates
            </button>
          </form>
        </div>

        {/* Right column: rates */}
        <div className="flex flex-col mt-8 border-t border-gray-300">
          {/* Pass onInquire to RateCard; it should call this when its "Inquire" button is clicked */}
          <RateCard
            percentage={`${rates.BC["3YearFixed"].toFixed(2)}%`}
            monthlyPayment={fmtMoney(pay3Fixed)}
            term="3-yr fixed"
            onInquire={openModal}
          />
          <RateCard
            percentage={`${rates.BC["4YearFixed"].toFixed(2)}%`}
            monthlyPayment={fmtMoney(pay4Fixed)}
            term="4-yr fixed"
            onInquire={openModal}
          />
          <RateCard
            percentage={`${rates.BC["5YearFixed"].toFixed(2)}%`}
            monthlyPayment={fmtMoney(pay5Fixed)}
            term="5-yr fixed"
            onInquire={openModal}
          />
          <RateCard
            percentage={`${rates.BC["3YearVariable"].toFixed(2)}%`}
            monthlyPayment={fmtMoney(pay3Var)}
            term="3-yr variable"
            onInquire={openModal}
          />
          <RateCard
            percentage={`${rates.BC["5YearVariable"].toFixed(2)}%`}
            monthlyPayment={fmtMoney(pay5Var)}
            term="5-yr variable"
            onInquire={openModal}
          />
        </div>
      </div>

      {/* Full-screen modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquire-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

          {/* Modal content */}
          <div className="relative z-10 w-[min(900px,92vw)] max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="inquire-title" className="text-2xl font-semibold">
                Current formData
              </h2>
              <button
                onClick={closeModal}
                className="rounded-md px-3 py-1.5 border border-gray-300 hover:bg-gray-100"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <pre className="text-sm leading-6 bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto">
              {JSON.stringify(formData ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
