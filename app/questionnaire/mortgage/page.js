"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function MortgagePage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      belowOneMillion: "",
      lender: "",
      mortgageBalance: "",
      otherLender: "",
      maturityDate: "",
    },
  });

  const router = useRouter();
  const selectedLender = watch("lender");

  const onSubmit = (data) => {
    // If 'Other' is selected, use the custom lender value
    const payload = {
      ...data,
      lender: data.lender === "Other" ? data.otherLender : data.lender,
    };
    console.log("Mortgage data:", payload);
    router.push("/questionnaire/contact-info");
  };

  const yesNoOptions = ["yes", "no"];
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
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        {"Now let's learn about your mortgage"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Below One Million Radio */}
        <div className="flex flex-col space-y-4">
          <p className="text-2xl">
            Was the property value below $1M at purchase?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {yesNoOptions.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  value={option}
                  {...register("belowOneMillion", {
                    required: "Select yes or no",
                  })}
                  className="sr-only peer"
                />
                <div className="cursor-pointer rounded-md border bg-white border-gray-300 p-4 peer-checked:border-blue-600 peer-checked:ring ring-blue-600 peer-checked:bg-blue-100 hover:bg-blue-100 text-center">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </div>
              </label>
            ))}
          </div>
          {errors.belowOneMillion && (
            <p className="text-red-600 mt-1">
              {errors.belowOneMillion.message}
            </p>
          )}
        </div>

        {/* Current Mortgage Balance */}
        <div className="flex flex-col space-y-4">
          <label htmlFor="purchasePrice" className="text-2xl">
            Current mortgage balance?
          </label>
          <div className="relative border rounded-md border-gray-300 bg-white">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
              $
            </span>
            <input
              id="mortgageBalance"
              {...register("mortgageBalance", {
                required: "Purchase price is required",
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

        {/* Lender Select */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="lender" className="text-2xl">
            Who is the lender?
          </label>
          <div className="relative border rounded-md border-gray-300 bg-white">
            <select
              id="lender"
              {...register("lender", { required: "Select a lender" })}
              className="appearance-none w-full bg-transparent py-4 pl-4 pr-10 text-lg rounded-md"
            >
              <option value="" disabled>
                Select your lender
              </option>
              {lenderOptions.map((lender) => (
                <option key={lender} value={lender}>
                  {lender}
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
            <div className="flex flex-col space-y-2 mt-8">
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

        {/* Maturity Date */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="maturityDate" className="text-2xl">
            Maturity date
          </label>
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
