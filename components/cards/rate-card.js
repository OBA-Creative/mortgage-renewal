export default function RateCard({
  percentage,
  monthlyPayment,
  term,
  lender,
  onInquire,
}) {
  return (
    <div className="flex items-center px-4 space-x-10">
      <div className="flex flex-col items-center grow">
        <p>{term}</p>
        <p className="text-6xl font-bold ">{percentage}</p>
      </div>
      <div className="flex flex-col space-y-2 text-center">
        <div>
          <p className="text-sm">monthly payment</p>
          <p className="text-lg font-semibold">{monthlyPayment}</p>
        </div>
        <button
          onClick={() =>
            onInquire({ term, percentage, monthlyPayment, lender })
          }
          className="flex items-center justify-center h-10 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer min-w-34 text-l hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
        >
          inquire
        </button>
      </div>
    </div>
  );
}
