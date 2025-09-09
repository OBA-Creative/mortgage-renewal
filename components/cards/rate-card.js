export default function RateCard({
  percentage,
  monthlyPayment,
  term,
  onInquire,
}) {
  return (
    <div className="flex  space-x-10 items-center px-4">
      <div className="flex flex-col items-center grow">
        <p>{term}</p>
        <p className=" text-6xl font-bold ">{percentage}</p>
      </div>
      <div className="text-center space-y-2 flex flex-col">
        <div>
          <p className="text-sm">monthly payment</p>
          <p className="text-lg font-semibold">{monthlyPayment}</p>
        </div>
        <button
          onClick={onInquire}
          className=" flex items-center justify-center bg-blue-600 min-w-34 rounded-md h-10 text-l text-white font-semibold hover:bg-blue-500 transition-colors duration-200 cursor-pointer "
        >
          inquire
        </button>
      </div>
    </div>
  );
}
