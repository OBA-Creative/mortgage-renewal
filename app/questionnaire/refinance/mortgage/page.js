"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";

export default function MortgagePage() {
  const [activeHelp, setActiveHelp] = useState(null);
  const helpTexts = {
    lender:
      "Select your current lender from the list, or pick 'Other' to specify a different one.",
    mortgageBalance:
      "Enter your outstanding mortgage balance at the time of renewal.",
    maturityDate: "Provide the date when your current mortgage term expires.",
  };
  const toggleHelp = (key) => {
    setActiveHelp((prev) => (prev === key ? null : key));
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lender: "",
      mortgageBalance: "",
      maturityDate: "",
      otherLender: "",
    },
  });

  const router = useRouter();
  const selectedLender = watch("lender");

  const onSubmit = (data) => {
    const payload = {
      ...data,
      lender: data.lender === "Other" ? data.otherLender : data.lender,
    };
    console.log("Mortgage data:", payload);
    router.push("/questionnaire/contact-info");
  };

  const lenderOptions = [
    "Royal Bank of Canada (RBC)",
    "Toronto-Dominion Bank (TD)",
    "Scotiabank",
    "Bank of Montreal (BMO)",
    "Canadian Imperial Bank of Commerce (CIBC)",
    "National Bank of Canada",
    "HSBC Canada",
    "Other",
  ];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8">
        {"Now let's learn about your mortgage"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Lender Select */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="lender" className="text-2xl">
              Who is the lender?
            </label>
            <button
              type="button"
              onClick={() => toggleHelp("lender")}
              className="p-1 rounded-full  hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
            >
              <HelpCircle className="w-6 h-6  " />
            </button>
          </div>
          {activeHelp === "lender" && (
            <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
              {helpTexts.lender}
            </div>
          )}
          <div className="relative border rounded-md border-gray-300 bg-white">
            <select
              id="lender"
              {...register("lender", { required: "Select a lender" })}
              className="appearance-none w-full bg-transparent py-4 pl-4 pr-10 text-lg rounded-md"
            >
              <option value="" disabled>
                Select your lender
              </option>
              {lenderOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          {errors.lender && (
            <p className="text-red-600 mt-1">{errors.lender.message}</p>
          )}

          {/* Conditional 'Other' Input */}
          {selectedLender === "Other" && (
            <div className="flex flex-col space-y-2 mt-4">
              <label htmlFor="otherLender" className="text-2xl">
                Please specify your lender
              </label>
              <input
                id="otherLender"
                type="text"
                {...register("otherLender", {
                  required: "Please specify your lender",
                })}
                className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
              />
              {errors.otherLender && (
                <p className="text-red-600 mt-1">
                  {errors.otherLender.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Current Mortgage Balance */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="mortgageBalance" className="text-2xl">
              Current mortgage balance?
            </label>
            <button
              type="button"
              onClick={() => toggleHelp("mortgageBalance")}
              className="p-1 rounded-full  hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
          {activeHelp === "mortgageBalance" && (
            <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
              {helpTexts.mortgageBalance}
            </div>
          )}
          <div className="relative border rounded-md border-gray-300 bg-white">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
              $
            </span>
            <input
              id="mortgageBalance"
              {...register("mortgageBalance", {
                required: "Mortgage balance is required",
                valueAsNumber: true,
              })}
              className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
            />
          </div>
          {errors.mortgageBalance && (
            <p className="text-red-600 mt-1">
              {errors.mortgageBalance.message}
            </p>
          )}
        </div>

        {/* Maturity Date */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="maturityDate" className="text-2xl">
              Maturity date
            </label>
            <button
              type="button"
              onClick={() => toggleHelp("maturityDate")}
              className="p-1 rounded-full  hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
            >
              <HelpCircle className="w-6 h-6 " />
            </button>
          </div>
          {activeHelp === "maturityDate" && (
            <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
              {helpTexts.maturityDate}
            </div>
          )}
          <input
            id="maturityDate"
            type="date"
            {...register("maturityDate", {
              required: "Maturity date is required",
            })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
          />
          {errors.maturityDate && (
            <p className="text-red-600 mt-1">{errors.maturityDate.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold py-3 px-12"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
