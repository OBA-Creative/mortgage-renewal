import { TrendingDown } from "lucide-react";
import Link from "next/link";

export default function UpsellRateCard({ monthlyPayment }) {
  return (
    <div className="p-3 pt-2 space-y-2 border border-blue-300 rounded-lg sm:p-4 bg-blue-50">
      <div className="flex flex-col space-y-2 text-center">
        <div>
          <p className="text-lg font-semibold text-center sm:text-xl">
            Lower Your Payments Further
          </p>
          <p className="text-xs sm:text-sm">
            extend amortization to get payment down to
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div>
              <TrendingDown className="w-5 h-5 text-blue-600 sm:w-6 sm:h-6" />
            </div>
            <p className="text-lg font-semibold sm:text-xl">
              {monthlyPayment}{" "}
              <span className="text-xs font-medium sm:text-sm">/ month</span>
            </p>
          </div>
        </div>
        <Link href="renew/refinance" className="w-full">
          <div className="flex items-center justify-center h-10 px-6 mx-auto text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer sm:px-10 sm:text-base w-fit hover:bg-blue-500 hover:scale-110 hover:shadow-lg">
            see refinance rates
          </div>
        </Link>
      </div>
    </div>
  );
}
