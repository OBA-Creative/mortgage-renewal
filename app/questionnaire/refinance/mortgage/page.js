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
      belowOneMillion: "no",
      lender: "",
      maturityDate: "",
    },
  });

  const router = useRouter();

  const onSubmit = (data) => {
    console.log("Mortgage data:", data);
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
