"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import RateCard from "@/components/cards/rate-card";
import { useMortgageStore } from "@/stores/useMortgageStore";
import CurrencyField from "@/components/form-elements/currency-element";
import BookingModal from "@/components/cards/booking-modal";

// Rates object architecture
// Each key is a province, and each value is an object mapping loan types to their rates
// This structure allows for easy expansion to include more provinces and loan types
const prime = 3;
const rates = {
  AB: {
    threeYrFixed: {
      under65: (1.1).toFixed(2),
      under70: (1.2).toFixed(2),
      under75: (1.3).toFixed(2),
      under80: (1.4).toFixed(2),
      over80: (1.5).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.1).toFixed(2),
      under70: (2.2).toFixed(2),
      under75: (2.3).toFixed(2),
      under80: (2.4).toFixed(2),
      over80: (2.5).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.1).toFixed(2),
      under70: (3.2).toFixed(2),
      under75: (3.3).toFixed(2),
      under80: (3.4).toFixed(2),
      over80: (3.5).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 0.8).toFixed(2),
      under70: (prime - 0.7).toFixed(2),
      under75: (prime - 0.6).toFixed(2),
      under80: (prime - 0.5).toFixed(2),
      over80: (prime - 0.4).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1).toFixed(2),
      under70: (prime - 0.9).toFixed(2),
      under75: (prime - 0.8).toFixed(2),
      under80: (prime + 0.7).toFixed(2),
      over80: (prime + 0.6).toFixed(2),
    },
  },
  BC: {
    threeYrFixed: {
      under65: (1.2).toFixed(2),
      under70: (1.3).toFixed(2),
      under75: (1.4).toFixed(2),
      under80: (1.5).toFixed(2),
      over80: (1.6).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.2).toFixed(2),
      under70: (2.3).toFixed(2),
      under75: (2.4).toFixed(2),
      under80: (2.5).toFixed(2),
      over80: (2.6).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.2).toFixed(2),
      under70: (3.3).toFixed(2),
      under75: (3.4).toFixed(2),
      under80: (3.5).toFixed(2),
      over80: (3.6).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 0.9).toFixed(2),
      under70: (prime - 0.8).toFixed(2),
      under75: (prime - 0.7).toFixed(2),
      under80: (prime - 0.6).toFixed(2),
      over80: (prime - 0.5).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.1).toFixed(2),
      under70: (prime - 1).toFixed(2),
      under75: (prime - 0.9).toFixed(2),
      under80: (prime + 0.8).toFixed(2),
      over80: (prime + 0.7).toFixed(2),
    },
  },
  MB: {
    threeYrFixed: {
      under65: (1.3).toFixed(2),
      under70: (1.4).toFixed(2),
      under75: (1.5).toFixed(2),
      under80: (1.6).toFixed(2),
      over80: (1.7).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.3).toFixed(2),
      under70: (2.4).toFixed(2),
      under75: (2.5).toFixed(2),
      under80: (2.6).toFixed(2),
      over80: (2.7).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.3).toFixed(2),
      under70: (3.4).toFixed(2),
      under75: (3.5).toFixed(2),
      under80: (3.6).toFixed(2),
      over80: (3.7).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.0).toFixed(2),
      under70: (prime - 0.9).toFixed(2),
      under75: (prime - 0.8).toFixed(2),
      under80: (prime - 0.7).toFixed(2),
      over80: (prime - 0.6).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.2).toFixed(2),
      under70: (prime - 1.1).toFixed(2),
      under75: (prime - 1.0).toFixed(2),
      under80: (prime + 0.9).toFixed(2),
      over80: (prime + 0.8).toFixed(2),
    },
  },
  NB: {
    threeYrFixed: {
      under65: (1.4).toFixed(2),
      under70: (1.5).toFixed(2),
      under75: (1.6).toFixed(2),
      under80: (1.7).toFixed(2),
      over80: (1.8).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.4).toFixed(2),
      under70: (2.5).toFixed(2),
      under75: (2.6).toFixed(2),
      under80: (2.7).toFixed(2),
      over80: (2.8).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.4).toFixed(2),
      under70: (3.5).toFixed(2),
      under75: (3.6).toFixed(2),
      under80: (3.7).toFixed(2),
      over80: (3.8).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.1).toFixed(2),
      under70: (prime - 1.0).toFixed(2),
      under75: (prime - 0.9).toFixed(2),
      under80: (prime - 0.8).toFixed(2),
      over80: (prime - 0.7).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.3).toFixed(2),
      under70: (prime - 1.2).toFixed(2),
      under75: (prime - 1.1).toFixed(2),
      under80: (prime + 1.0).toFixed(2),
      over80: (prime + 0.9).toFixed(2),
    },
  },
  NL: {
    threeYrFixed: {
      under65: (1.5).toFixed(2),
      under70: (1.6).toFixed(2),
      under75: (1.7).toFixed(2),
      under80: (1.8).toFixed(2),
      over80: (1.9).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.5).toFixed(2),
      under70: (2.6).toFixed(2),
      under75: (2.7).toFixed(2),
      under80: (2.8).toFixed(2),
      over80: (2.9).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.5).toFixed(2),
      under70: (3.6).toFixed(2),
      under75: (3.7).toFixed(2),
      under80: (3.8).toFixed(2),
      over80: (3.9).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.2).toFixed(2),
      under70: (prime - 1.1).toFixed(2),
      under75: (prime - 1.0).toFixed(2),
      under80: (prime - 0.9).toFixed(2),
      over80: (prime - 0.8).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.4).toFixed(2),
      under70: (prime - 1.3).toFixed(2),
      under75: (prime - 1.2).toFixed(2),
      under80: (prime + 1.1).toFixed(2),
      over80: (prime + 1.0).toFixed(2),
    },
  },
  NS: {
    threeYrFixed: {
      under65: (1.6).toFixed(2),
      under70: (1.7).toFixed(2),
      under75: (1.8).toFixed(2),
      under80: (1.9).toFixed(2),
      over80: (2.0).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.6).toFixed(2),
      under70: (2.7).toFixed(2),
      under75: (2.8).toFixed(2),
      under80: (2.9).toFixed(2),
      over80: (3.0).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.6).toFixed(2),
      under70: (3.7).toFixed(2),
      under75: (3.8).toFixed(2),
      under80: (3.9).toFixed(2),
      over80: (4.0).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.3).toFixed(2),
      under70: (prime - 1.2).toFixed(2),
      under75: (prime - 1.1).toFixed(2),
      under80: (prime - 1.0).toFixed(2),
      over80: (prime - 0.9).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.5).toFixed(2),
      under70: (prime - 1.4).toFixed(2),
      under75: (prime - 1.3).toFixed(2),
      under80: (prime + 1.2).toFixed(2),
      over80: (prime + 1.1).toFixed(2),
    },
  },
  ON: {
    threeYrFixed: {
      under65: (1.7).toFixed(2),
      under70: (1.8).toFixed(2),
      under75: (1.9).toFixed(2),
      under80: (2.0).toFixed(2),
      over80: (2.1).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.7).toFixed(2),
      under70: (2.8).toFixed(2),
      under75: (2.9).toFixed(2),
      under80: (3.0).toFixed(2),
      over80: (3.1).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.7).toFixed(2),
      under70: (3.8).toFixed(2),
      under75: (3.9).toFixed(2),
      under80: (4.0).toFixed(2),
      over80: (4.1).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.4).toFixed(2),
      under70: (prime - 1.3).toFixed(2),
      under75: (prime - 1.2).toFixed(2),
      under80: (prime - 1.1).toFixed(2),
      over80: (prime - 1.0).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.6).toFixed(2),
      under70: (prime - 1.5).toFixed(2),
      under75: (prime - 1.4).toFixed(2),
      under80: (prime + 1.3).toFixed(2),
      over80: (prime + 1.2).toFixed(2),
    },
  },
  PE: {
    threeYrFixed: {
      under65: (1.8).toFixed(2),
      under70: (1.9).toFixed(2),
      under75: (2.0).toFixed(2),
      under80: (2.1).toFixed(2),
      over80: (2.2).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.8).toFixed(2),
      under70: (2.9).toFixed(2),
      under75: (3.0).toFixed(2),
      under80: (3.1).toFixed(2),
      over80: (3.2).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.8).toFixed(2),
      under70: (3.9).toFixed(2),
      under75: (4.0).toFixed(2),
      under80: (4.1).toFixed(2),
      over80: (4.2).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.5).toFixed(2),
      under70: (prime - 1.4).toFixed(2),
      under75: (prime - 1.3).toFixed(2),
      under80: (prime - 1.2).toFixed(2),
      over80: (prime - 1.1).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.7).toFixed(2),
      under70: (prime - 1.6).toFixed(2),
      under75: (prime - 1.5).toFixed(2),
      under80: (prime + 1.4).toFixed(2),
      over80: (prime + 1.3).toFixed(2),
    },
  },
  QC: {
    threeYrFixed: {
      under65: (1.9).toFixed(2),
      under70: (2.0).toFixed(2),
      under75: (2.1).toFixed(2),
      under80: (2.2).toFixed(2),
      over80: (2.3).toFixed(2),
    },
    fourYrFixed: {
      under65: (2.9).toFixed(2),
      under70: (3.0).toFixed(2),
      under75: (3.1).toFixed(2),
      under80: (3.2).toFixed(2),
      over80: (3.3).toFixed(2),
    },
    fiveYrFixed: {
      under65: (3.9).toFixed(2),
      under70: (4.0).toFixed(2),
      under75: (4.1).toFixed(2),
      under80: (4.2).toFixed(2),
      over80: (4.3).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.6).toFixed(2),
      under70: (prime - 1.5).toFixed(2),
      under75: (prime - 1.4).toFixed(2),
      under80: (prime - 1.3).toFixed(2),
      over80: (prime - 1.2).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.8).toFixed(2),
      under70: (prime - 1.7).toFixed(2),
      under75: (prime - 1.6).toFixed(2),
      under80: (prime + 1.5).toFixed(2),
      over80: (prime + 1.4).toFixed(2),
    },
  },
  SK: {
    threeYrFixed: {
      under65: (2.0).toFixed(2),
      under70: (2.1).toFixed(2),
      under75: (2.2).toFixed(2),
      under80: (2.3).toFixed(2),
      over80: (2.4).toFixed(2),
    },
    fourYrFixed: {
      under65: (3.0).toFixed(2),
      under70: (3.1).toFixed(2),
      under75: (3.2).toFixed(2),
      under80: (3.3).toFixed(2),
      over80: (3.4).toFixed(2),
    },
    fiveYrFixed: {
      under65: (4.0).toFixed(2),
      under70: (4.1).toFixed(2),
      under75: (4.2).toFixed(2),
      under80: (4.3).toFixed(2),
      over80: (4.4).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.7).toFixed(2),
      under70: (prime - 1.6).toFixed(2),
      under75: (prime - 1.5).toFixed(2),
      under80: (prime - 1.4).toFixed(2),
      over80: (prime - 1.3).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 1.9).toFixed(2),
      under70: (prime - 1.8).toFixed(2),
      under75: (prime - 1.7).toFixed(2),
      under80: (prime + 1.6).toFixed(2),
      over80: (prime + 1.5).toFixed(2),
    },
  },
  NT: {
    threeYrFixed: {
      under65: (2.1).toFixed(2),
      under70: (2.2).toFixed(2),
      under75: (2.3).toFixed(2),
      under80: (2.4).toFixed(2),
      over80: (2.5).toFixed(2),
    },
    fourYrFixed: {
      under65: (3.1).toFixed(2),
      under70: (3.2).toFixed(2),
      under75: (3.3).toFixed(2),
      under80: (3.4).toFixed(2),
      over80: (3.5).toFixed(2),
    },
    fiveYrFixed: {
      under65: (4.1).toFixed(2),
      under70: (4.2).toFixed(2),
      under75: (4.3).toFixed(2),
      under80: (4.4).toFixed(2),
      over80: (4.5).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.8).toFixed(2),
      under70: (prime - 1.7).toFixed(2),
      under75: (prime - 1.6).toFixed(2),
      under80: (prime - 1.5).toFixed(2),
      over80: (prime - 1.4).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 2.0).toFixed(2),
      under70: (prime - 1.9).toFixed(2),
      under75: (prime - 1.8).toFixed(2),
      under80: (prime + 1.7).toFixed(2),
      over80: (prime + 1.6).toFixed(2),
    },
  },
  NU: {
    threeYrFixed: {
      under65: (2.2).toFixed(2),
      under70: (2.3).toFixed(2),
      under75: (2.4).toFixed(2),
      under80: (2.5).toFixed(2),
      over80: (2.6).toFixed(2),
    },
    fourYrFixed: {
      under65: (3.2).toFixed(2),
      under70: (3.3).toFixed(2),
      under75: (3.4).toFixed(2),
      under80: (3.5).toFixed(2),
      over80: (3.6).toFixed(2),
    },
    fiveYrFixed: {
      under65: (4.2).toFixed(2),
      under70: (4.3).toFixed(2),
      under75: (4.4).toFixed(2),
      under80: (4.5).toFixed(2),
      over80: (4.6).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 1.9).toFixed(2),
      under70: (prime - 1.8).toFixed(2),
      under75: (prime - 1.7).toFixed(2),
      under80: (prime - 1.6).toFixed(2),
      over80: (prime - 1.5).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 2.1).toFixed(2),
      under70: (prime - 2.0).toFixed(2),
      under75: (prime - 1.9).toFixed(2),
      under80: (prime + 1.8).toFixed(2),
      over80: (prime + 1.7).toFixed(2),
    },
  },
  YT: {
    threeYrFixed: {
      under65: (2.3).toFixed(2),
      under70: (2.4).toFixed(2),
      under75: (2.5).toFixed(2),
      under80: (2.6).toFixed(2),
      over80: (2.7).toFixed(2),
    },
    fourYrFixed: {
      under65: (3.3).toFixed(2),
      under70: (3.4).toFixed(2),
      under75: (3.5).toFixed(2),
      under80: (3.6).toFixed(2),
      over80: (3.7).toFixed(2),
    },
    fiveYrFixed: {
      under65: (4.3).toFixed(2),
      under70: (4.4).toFixed(2),
      under75: (4.5).toFixed(2),
      under80: (4.6).toFixed(2),
      over80: (4.7).toFixed(2),
    },
    threeYrVariable: {
      under65: (prime - 2.0).toFixed(2),
      under70: (prime - 1.9).toFixed(2),
      under75: (prime - 1.8).toFixed(2),
      under80: (prime - 1.7).toFixed(2),
      over80: (prime - 1.6).toFixed(2),
    },
    fiveYrVariable: {
      under65: (prime - 2.2).toFixed(2),
      under70: (prime - 2.1).toFixed(2),
      under75: (prime - 2.0).toFixed(2),
      under80: (prime + 1.9).toFixed(2),
      over80: (prime + 1.8).toFixed(2),
    },
  },
};

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

  const pow = Math.pow(1 + r, n);
  const payment = (P * r * pow) / (pow - 1);

  // Excel returns a negative cash flow; we return positive $/mo
  return payment;
}

export default function RatesPage() {
  const { formData } = useMortgageStore();

  const [open, setOpen] = useState(false);
  const handleInquire = () => setOpen(true);

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

  const propertyValue = Number(formData?.propertyValue || 0);

  // Extract province from formData and use it to construct object
  const rawProv = formData?.province?.trim();
  const province =
    rawProv && rates[rawProv]
      ? rawProv
      : rawProv && PROV_MAP[rawProv]
      ? PROV_MAP[rawProv]
      : null; // wait until we know it

  const ratio =
    propertyValue > 0 ? totalMortgageRequired / (propertyValue / 100) : 0;

  function getRate(province, rateTerm) {
    if (!province || !ratio || !isFinite(ratio)) return null;
    const band =
      ratio < 65
        ? "under65"
        : ratio < 70
        ? "under70"
        : ratio < 75
        ? "under75"
        : ratio < 80
        ? "under80"
        : "over80";

    const val = rates?.[province]?.[rateTerm]?.[band];
    return val != null ? Number(val) : NaN; // ensure it's a number
  }

  const r3F = getRate(province, "threeYrFixed");
  const r4F = getRate(province, "fourYrFixed");
  const r5F = getRate(province, "fiveYrFixed");
  const r3V = getRate(province, "threeYrVariable");
  const r5V = getRate(province, "fiveYrVariable");

  // Payments only if inputs are valid
  const pay3F = calcMonthlyPayment(
    watchedMortgageBal,
    getRate(province, "threeYrFixed"),
    yearsNum
  );
  const pay4F = calcMonthlyPayment(
    watchedMortgageBal,
    getRate(province, "fourYrFixed"),
    yearsNum
  );
  const pay5F = calcMonthlyPayment(
    watchedMortgageBal,
    getRate(province, "fiveYrFixed"),
    yearsNum
  );
  const pay3V = calcMonthlyPayment(
    watchedMortgageBal,
    getRate(province, "threeYrVariable"),
    yearsNum
  );
  const pay5V = calcMonthlyPayment(
    watchedMortgageBal,
    getRate(province, "fiveYrVariable"),
    yearsNum
  );

  // --- helpers ---
  const PROV_MAP = {
    Alberta: "AB",
    "British Columbia": "BC",
    Manitoba: "MB",
    "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL",
    "Nova Scotia": "NS",
    Ontario: "ON",
    "Prince Edward Island": "PE",
    Quebec: "QC",
    Saskatchewan: "SK",
    "Northwest Territories": "NT",
    Nunavut: "NU",
    Yukon: "YT",
  };

  const fmtRate = (r) =>
    r == null || !isFinite(r) ? "—" : `${Number(r).toFixed(2)}%`;

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
    <div className="max-w-7xl xl:min-w-5xl mx-auto p-6">
      <div>
        <h1 className="text-4xl font-semibold text-center  max-w-3xl mx-auto">
          Here are the best rates that match your profile
        </h1>
        <p className="text-xl text-center mt-4">
          {`If we lock in your rate today, you will be protected from future rate increases until ${formattedDate}`}
        </p>
      </div>
      <div className="flex items-start justify-between space-x-10 mt-4">
        {/* Left column: form */}
        <div className="flex flex-col mt-7 mb-4 bg-white rounded-md border border-gray-200 p-4 w-full max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CurrencyField
              name="currentMortgageBalance"
              label="Current mortgage balance"
              control={control}
              rules={{ min: { value: 0, message: "Must be ≥ 0" } }}
              error={errors.currentMortgageBalance}
            />

            {formData.borrowAdditionalFunds === "yes" && (
              <CurrencyField
                name="borrowAdditionalAmount"
                label="Additional amount needed"
                control={control}
                rules={{ min: { value: 0, message: "Must be ≥ 0" } }}
                error={errors.borrowAdditionalAmount}
              />
            )}
            <div className="flex flex-col space-y-2 mb-4">
              <label className=" text-md  font-semibold">
                Amortization period (years)
              </label>
              <input
                type="number"
                placeholder="e.g., 25"
                className="border border-gray-300 rounded-sm p-2  w-full h-12 text-lg"
                {...register("amortizationPeriod", {
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1 year" },
                  max: { value: 30, message: "Must be 30 years or less" },
                })}
              />
              {errors.amortizationPeriod && (
                <p className="text-sm text-red-600 mb-2">
                  {errors.amortizationPeriod.message}
                </p>
              )}
            </div>
          </form>
          <div className="mt-4 text-center">
            <div className="border-b mb-4 border-gray-300"></div>
            <p className="font-semibold text-xl">Total mortgage required</p>
            <p className="font-semibold text-blue-600 text-3xl">
              ${formatNumber(totalMortgageRequired)}
            </p>
          </div>
        </div>

        {/* Right column: rates */}
        <div className="flex flex-col mt-8 border-t border-gray-300 ">
          {/* Pass onInquire to RateCard; it should call this when its "Inquire" button is clicked */}
          <RateCard
            percentage={fmtRate(r3F)}
            monthlyPayment={fmtMoney(pay3F)}
            term="3-yr fixed"
            onInquire={handleInquire}
          />
          <RateCard
            percentage={fmtRate(r4F)}
            monthlyPayment={fmtMoney(pay4F)}
            term="4-yr fixed"
            onInquire={handleInquire}
          />
          <RateCard
            percentage={fmtRate(r5F)}
            monthlyPayment={fmtMoney(pay5F)}
            term="5-yr fixed"
            onInquire={handleInquire}
          />
          <RateCard
            percentage={fmtRate(r3V)}
            monthlyPayment={fmtMoney(pay3V)}
            term="3-yr variable"
            onInquire={handleInquire}
          />
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
