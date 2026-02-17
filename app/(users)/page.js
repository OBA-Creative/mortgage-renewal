"use client";

import { useEffect } from "react";
import { useMortgageStore } from "@/stores/useMortgageStore";
import PathExplainerCard from "@/components/cards/path-explainer-card";

export default function Home() {
  const { fetchLenders } = useMortgageStore();

  // Pre-load lenders so the dropdown is ready when users reach that step
  useEffect(() => {
    fetchLenders();
  }, [fetchLenders]);

  return (
    <div className="flex flex-col justify-center min-h-screen lg:flex-row bg-blue-1000">
      <div className="flex flex-col items-center justify-center w-full min-h-[50vh] py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-100 hover:bg-blue-200">
        <p className="text-3xl font-bold lg:mb-6 sm:text-4xl lg:text-5xl">
          {"I'm renewing"}
        </p>
        <p className="px-4 text-lg font-light text-center sm:text-lg lg:text-xl">
          (Keeping my existing mortgage, no new borrowing)
        </p>
        <PathExplainerCard
          title="Explore renewal options if you’re:"
          item1="Staying with the same balance"
          item2="Not changing your amortization"
          item3="Just comparing renewal terms"
          btnLabel="Explore renewal options"
          link="/questionnaire/renew"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full min-h-[50vh] py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-50 hover:bg-blue-200">
        <p className="text-3xl font-bold lg:mb-6 sm:text-4xl lg:text-5xl">
          {"I'm refinancing"}
        </p>
        <p className="px-4 text-lg font-light text-center sm:text-lg lg:text-xl">
          (Changing my mortgage to improve cash flow and lower my payments)
        </p>
        <PathExplainerCard
          title="Explore refinance options if you’re:"
          item1="Consolidating other debt to lower monthly costs"
          item2="Facing higher payments at renewal"
          item3="Wanting to extend amortization"
          btnLabel="Explore refinance options"
          link="/questionnaire/refinance"
        />
      </div>
    </div>
  );
}
