const formatNumber = (value) => {
  return new Intl.NumberFormat("us-US", {
    style: "currency",
    currency: "USD",
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
}) {
  const mortgageBalanceNumber = parseNumber(mortgageBalance);
  const borrowAdditionalAmountNumber = parseNumber(borrowAdditionalAmount);
  const totalMortgageAmount =
    mortgageBalanceNumber + borrowAdditionalAmountNumber;
  return (
    <div className="border rounded-md border-blue-600 mt-4">
      <div className="w-full p-4 text-blue-700 font-semibold text-2xl text-center border-b ">
        <p>Your total mortgage amount</p>
      </div>
      <div className="py-8 px-12 text-xl font-light text-gray-700 space-y-2">
        <div className="flex justify-between">
          <p>Current mortgage balance</p>
          <p>{formatNumber(mortgageBalanceNumber)}</p>
        </div>

        <div className="flex justify-between">
          <p>+ Additional equity</p>
          <p>{formatNumber(borrowAdditionalAmountNumber)}</p>
        </div>
      </div>
      <div className="flex justify-between text-xl py-4 px-12 font-semibold border-t border-blue-600 bg-blue-100 rounded-b-md">
        <p>Total mortgage required</p>
        <p>{formatNumber(totalMortgageAmount)}</p>
      </div>
    </div>
  );
}
