import { formatCurrency } from "@/lib/number-utils";

export default function AvailableEquityCard({
  propertyValue,
  mortgageBalance,
  heloc,
  helocBalance,
}) {
  const maxLoanAmount = Math.floor(propertyValue * 0.8);
  const maxBorrow = Math.floor(
    maxLoanAmount - mortgageBalance - (heloc ? helocBalance : 0),
  );

  return (
    <div className="border rounded-md border-blue-600 ">
      <div className="w-full p-4 text-blue-700 font-semibold text-2xl text-center border-b ">
        <p>Your total available equity</p>
      </div>
      <div className="py-8 px-12 text-xl font-light text-gray-700 space-y-2 ">
        <div className="flex justify-between">
          <p>Property Value</p>
          <p>{formatCurrency(propertyValue)}</p>
        </div>
        <div className="flex justify-between">
          <p>Max loan amount (80% LTV)</p>
          <p>{formatCurrency(maxLoanAmount)}</p>
        </div>
        <div className="flex justify-between w-full">
          <p> - Current mortgage balance</p>
          <p>{formatCurrency(mortgageBalance)}</p>
        </div>
        {heloc && (
          <div className="flex justify-between w-full">
            <p> - Current HELOC balance</p>
            <p>{formatCurrency(helocBalance) || 0}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between text-xl py-4 px-12 font-semibold border-t border-blue-600 bg-blue-100 rounded-b-md">
        <p>Borrow up to an additional</p>
        <p>{formatCurrency(maxBorrow)}</p>
      </div>
    </div>
  );
}
