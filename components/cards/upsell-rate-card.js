import { TrendingDown } from "lucide-react";
import Link from "next/link";

export default function UpsellRateCard({ monthlyPayment }) {
  return (
    <div className="p-4 pt-2 space-y-2 border border-blue-300 rounded-lg bg-blue-50">
      <div className="flex flex-col space-y-2 text-center">
        <div>
          <p className="text-xl font-semibold text-center ">
            Lower Your Payments Further
          </p>
          <p className="text-sm">your monthly payment as low as</p>
          <div className="flex items-center justify-center space-x-2 text-lg font-semibold">
            <TrendingDown className="w-6 h-6 mx-auto text-blue-600" />
            {monthlyPayment}{" "}
            <span className="text-sm font-medium">/ month</span>
          </div>
        </div>
        <Link href="refinance/rates">
          <div className="flex items-center justify-center h-10 px-10 mx-auto font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer w-fit text-l hover:bg-blue-500 hover:scale-110 hover:shadow-lg">
            see refinance rates
          </div>
        </Link>
      </div>
    </div>
  );
}
