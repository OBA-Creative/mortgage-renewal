const formatNumber = (value) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
};

const parseNumber = (formattedValue) => {
  // Remove commas and convert to number
  const raw = String(formattedValue).replace(/,/g, "");
  const parsed = parseFloat(raw);
  // Return 0 for invalid numbers instead of empty string, or the parsed number
  return isNaN(parsed) ? 0 : parsed;
};

export default function YourTotalMortgageCard({
  mortgageBalance,
  borrowAdditionalAmount,
  helocBalance,
}) {
  const mortgageBalanceNumber = parseNumber(mortgageBalance);
  const borrowAdditionalAmountNumber = parseNumber(borrowAdditionalAmount);
  const helocBalanceNumber = parseNumber(helocBalance);
  const hasHeloc = helocBalanceNumber > 0;
  const totalMortgageAmount =
    mortgageBalanceNumber +
    borrowAdditionalAmountNumber +
    (hasHeloc ? helocBalanceNumber : 0);
  return (
    <div className="border border-blue-600 rounded-md ">
      <div className="w-full p-4 text-2xl font-semibold text-center text-blue-700 border-b ">
        <p>Your total mortgage amount</p>
      </div>
      <div className="px-12 py-8 space-y-2 text-xl font-light text-gray-700">
        <div className="flex justify-between">
          <p>Current mortgage balance</p>
          <p>{formatNumber(mortgageBalanceNumber)}</p>
        </div>

        {hasHeloc && (
          <div className="flex justify-between">
            <p>+ HELOC balance</p>
            <p>{formatNumber(helocBalanceNumber)}</p>
          </div>
        )}

        <div className="flex justify-between">
          <p>+ Additional equity</p>
          <p>{formatNumber(borrowAdditionalAmountNumber)}</p>
        </div>
      </div>
      <div className="flex justify-between px-12 py-4 text-xl font-semibold bg-blue-100 border-t border-blue-600 rounded-b-md">
        <p>Total mortgage required</p>
        <p>{formatNumber(totalMortgageAmount)}</p>
      </div>
    </div>
  );
}
