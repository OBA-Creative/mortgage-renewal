import Link from "next/link";

export default function UpsellRateCard({ monthlyPayment }) {
  return (
    <div className="p-4 space-y-2 border border-blue-300 rounded-lg bg-blue-50">
      <div className="flex flex-col space-y-2 text-center">
        <div>
          <p className="text-xl font-semibold text-center ">
            Drop Your Payments Further
          </p>
          <p className="text-sm">your monthly payment as low as</p>
          <div className="text-lg font-semibold">
            {monthlyPayment}{" "}
            <span className="text-sm font-medium">/ month</span>
          </div>
        </div>
        <Link href="refinance/rates">
          <div className="flex items-center justify-center h-10 font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-md cursor-pointer min-w-34 text-l hover:bg-blue-500">
            see refinance rates
          </div>
        </Link>
      </div>
    </div>
  );
}
