/**
 * Convert a Canadian nominal annual rate (compounded semi-annually)
 * to the effective monthly rate used in the standard PMT formula.
 *   r_m = (1 + (annualPct/100) / 2) ^ (1/6) - 1
 */
export const monthlyRateFromSemiAnnual = (annualPct) => {
  const j2 = Number(annualPct) / 100 / 2;
  if (!isFinite(j2)) return NaN;
  return Math.pow(1 + j2, 1 / 6) - 1;
};

/**
 * Calculate the monthly mortgage payment using the standard PMT formula.
 * @param {number} balance              - Principal (P)
 * @param {number} annualNominalRatePct - Annual rate in percent, compounded semi-annually
 * @param {number} years                - Amortization in years
 * @returns {number} Monthly payment, or NaN for invalid inputs
 */
export const calcMonthlyPayment = (balance, annualNominalRatePct, years) => {
  const P = Number(balance);
  const n = Math.round(Number(years) * 12);
  if (!isFinite(P) || !isFinite(n) || P <= 0 || n <= 0) return NaN;

  const r = monthlyRateFromSemiAnnual(annualNominalRatePct);
  if (!isFinite(r)) return NaN;

  if (Math.abs(r) < 1e-12) return P / n; // zero-rate edge case

  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};
