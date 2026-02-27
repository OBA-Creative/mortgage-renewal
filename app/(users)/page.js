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
    <div className="flex flex-col justify-center min-h-dvh lg:flex-row bg-blue-50">
      <div className="flex flex-col items-center justify-center w-full min-h-[40vh] pt-24 pb-10 sm:min-h-[50vh] sm:py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-100 hover:bg-blue-200">
        <p className="text-2xl font-bold sm:text-3xl lg:mb-6 lg:text-5xl">
          {"I'm renewing"}
        </p>
        <p className="hidden px-4 text-base text-center sm:block sm:text-lg lg:text-xl">
          I'm keeping my existing mortgage, no new borrowing
        </p>
        <PathExplainerCard
          title="Explore renewal options if you’re:"
          item1="Staying with the same balance"
          item2="Not changing your amortization"
          item3="Maturing within next 4 months"
          btnLabel="Explore renewal options"
          link="/questionnaire/property"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full min-h-[40vh] py-10 sm:min-h-[50vh] sm:py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-50 hover:bg-blue-200">
        <p className="text-2xl font-bold sm:text-3xl lg:mb-6 lg:text-5xl">
          {"I'm refinancing"}
        </p>
        <p className="hidden px-4 text-base text-center sm:block sm:text-lg lg:text-xl">
          I'm changing my mortgage to improve cash flow and lower my payments
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
