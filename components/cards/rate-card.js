export default function RateCard({
  percentage,
  monthyPayment,
  term,
  dateValidUntil,
}) {
  return (
    <div>
      <div className="flex flex-col items-center border-t-1 border-gray-400 border-x-1 rounded-t-xl p-4  bg-white">
        <p>{term}</p>
        <p className=" text-6xl font-bold ">{percentage}</p>
        <div className="flex flex-row items-center space-x-2  text-sm">
          <div className="border-b-1 border-gray-400 w-12"></div>
          <p>monthy payment</p>
          <div className="border-b-1 border-gray-400 w-12"></div>
        </div>
        <p className="text-lg font-semibold">{monthyPayment}</p>
      </div>
      <button className="flex flex-col items-center px-6 py-3 bg-blue-600 w-full rounded-b-xl text-white font-semibold hover:bg-blue-500 transition-colors duration-200 cursor-pointer">
        inquire
      </button>
    </div>
  );
}
