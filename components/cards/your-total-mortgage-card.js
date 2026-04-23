import { formatCurrency, parseNumber } from "@/lib/number-utils";

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
          <p>{formatCurrency(mortgageBalanceNumber)}</p>
        </div>

        {hasHeloc && (
          <div className="flex justify-between">
            <p>+ HELOC balance</p>
            <p>{formatCurrency(helocBalanceNumber)}</p>
          </div>
        )}

        <div className="flex justify-between">
          <p>+ Additional equity</p>
          <p>{formatCurrency(borrowAdditionalAmountNumber)}</p>
        </div>
      </div>
      <div className="flex justify-between px-12 py-4 text-xl font-semibold bg-blue-100 border-t border-blue-600 rounded-b-md">
        <p>Total mortgage required</p>
        <p>{formatCurrency(totalMortgageAmount)}</p>
      </div>
    </div>
  );
}
