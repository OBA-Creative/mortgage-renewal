"use client";

import { useState, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HelpCircle } from "lucide-react";

// TODO: Consider using Intl.NumberFormat for localization instead of a custom regex formatter
const formatNumber = (value) => {
  const raw = value.replace(/\D/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function MortgagePage() {
  const [activeHelp, setActiveHelp] = useState(null);
  const [propertyInput, setPropertyInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");
  const [borrowInput, setBorrowInput] = useState("");

  const helpTexts = {
    lender:
      "Select your current lender from the list, or pick 'Other' to specify a different one.",
    mortgageBalance:
      "Enter your outstanding mortgage balance at the time of renewal.",
    maturityDate: "Provide the date when your current mortgage term expires.",
    propertyValue: "Enter the current market value of your property.",
  };

  const toggleHelp = useCallback(
    (key) => setActiveHelp((prev) => (prev === key ? null : key)),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: "",
      province: "",
      lender: "",
      otherLender: "",
      propertyValue: "",
      mortgageBalance: "",
      borrowAdditionalFunds: "",
      borrowAmount: "",
      amortizationYears: "",
      maturityDate: null,
    },
  });

  const router = useRouter();
  const propertyValue = useWatch({ control, name: "propertyValue" });
  const mortgageBalance = useWatch({ control, name: "mortgageBalance" });
  const borrowSelection = useWatch({ control, name: "borrowAdditionalFunds" });
  const borrowAmount = useWatch({ control, name: "borrowAmount" });

  const selectedLender = watch("lender");

  // Borrow options for styled radios
  const helocOptions = ["yes", "no"];

  // Calculate eligibility and limits
  const showBorrowQuestion =
    propertyValue && mortgageBalance && mortgageBalance < propertyValue * 0.8;
  const maxBorrow = showBorrowQuestion
    ? Math.floor(propertyValue * 0.8 - mortgageBalance)
    : 0;

  const formatedPropertyValue = formatNumber(propertyValue.toString());
  const formatedMortgageBalance = formatNumber(mortgageBalance.toString());
  const maxLoanAmount = propertyValue * 0.8;
  const formatedMaxLoanAmount = formatNumber(maxLoanAmount.toString());
  const formattedMaxBorrow = formatNumber(maxBorrow.toString());
  const formattedBorrowAmount = formatNumber(borrowAmount.toString());
  const totalMortgageAmount = mortgageBalance + (borrowAmount || 0);
  const formattedTotalMortgageAmount = formatNumber(
    totalMortgageAmount.toString()
  );

  const onSubmit = useCallback(
    (data) => {
      const formattedDate = data.maturityDate
        ? data.maturityDate.toISOString().split("T")[0]
        : "";
      const payload = {
        ...data,
        lender: data.lender === "Other" ? data.otherLender : data.lender,
        maturityDate: formattedDate,
      };
      console.log("Mortgage data:", payload);
      router.push("/questionnaire/contact-info");
    },
    [router]
  );

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

  const provinceOptions = [
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "ON",
    "PE",
    "QC",
    "SK",
    "NT",
    "NU",
    "YT",
  ];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8">
        {"Now let's learn about your mortgage"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* City & Province */}
        <div className="space-y-3">
          <p htmlFor="city" className="text-xl font-semibold">
            What city and province is your property in?
          </p>
          <div className="flex space-x-4">
            <div className="flex flex-col w-3/4 space-y-2">
              <input
                id="city"
                type="text"
                placeholder="Enter city"
                {...register("city", { required: "City is required" })}
                className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
              />
              {errors.city && (
                <p className="text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>
            <div className="flex flex-col w-1/4 space-y-2">
              <div className="relative border rounded-md border-gray-300 bg-white">
                <select
                  id="province"
                  {...register("province", {
                    required: "Province is required",
                  })}
                  className="appearance-none w-full bg-transparent py-4 pl-4 pr-10 text-lg rounded-md"
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {provinceOptions.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              {errors.province && (
                <p className="text-red-600 mt-1">{errors.province.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Lender Select */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="lender" className="text-xl font-semibold">
              Who is the lender?
            </label>
            <button
              type="button"
              onClick={() => toggleHelp("lender")}
              className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
            >
              <HelpCircle className="w-6 h-6" />
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

        {/* Property & Balance */}
        <div className="space-y-8">
          {/* Property Value */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="propertyValue" className="text-xl font-semibold">
                Current property value?
              </label>
              <button
                type="button"
                onClick={() => toggleHelp("propertyValue")}
                className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
            {activeHelp === "propertyValue" && (
              <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
                {helpTexts.propertyValue}
              </div>
            )}
            <div className="relative border rounded-md border-gray-300 bg-white">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
                $
              </span>
              <input
                id="propertyValue"
                type="text"
                value={propertyInput}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  setPropertyInput(formatted);
                  const numeric = formatted.replace(/,/g, "");
                  setValue("propertyValue", numeric ? parseFloat(numeric) : "");
                }}
                placeholder="0"
                className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
              />
            </div>
            {errors.propertyValue && (
              <p className="text-red-600 mt-1">
                {errors.propertyValue.message}
              </p>
            )}
          </div>
          {/* Mortgage Balance */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mortgageBalance"
                className="text-xl font-semibold"
              >
                Current mortgage balance?
              </label>
              <button
                type="button"
                onClick={() => toggleHelp("mortgageBalance")}
                className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
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
                type="text"
                value={balanceInput}
                onChange={(e) => {
                  const formatted = formatNumber(e.target.value);
                  setBalanceInput(formatted);
                  const numeric = formatted.replace(/,/g, "");
                  setValue(
                    "mortgageBalance",
                    numeric ? parseFloat(numeric) : ""
                  );
                }}
                placeholder="0"
                className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
              />
            </div>
            {errors.mortgageBalance && (
              <p className="text-red-600 mt-1">
                {errors.mortgageBalance.message}
              </p>
            )}
          </div>
        </div>

        {/* Borrow Additional Funds */}
        {showBorrowQuestion && (
          <div className="flex flex-col space-y-4">
            <label className="text-xl font-semibold">
              Do you want to borrow additional funds?
            </label>
            <div className="grid grid-cols-2 gap-4">
              {helocOptions.map((option) => (
                <label key={option} className="block">
                  <input
                    type="radio"
                    value={option}
                    {...register("borrowAdditionalFunds", {
                      required: "Select an option",
                    })}
                    className="sr-only peer"
                  />
                  <div className="cursor-pointer rounded-md border bg-white border-gray-300 p-4 peer-checked:border-blue-600 peer-checked:ring ring-blue-600 peer-checked:bg-blue-100 hover:bg-blue-100 text-center">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </div>
                </label>
              ))}
            </div>
            {errors.borrowAdditionalFunds && (
              <p className="text-red-600 mt-1">
                {errors.borrowAdditionalFunds.message}
              </p>
            )}
            {/* Conditional borrow table*/}
            {borrowSelection === "yes" && (
              <div className="border rounded-md border-blue-600 mt-4">
                <div className="w-full p-4 text-blue-700 font-semibold text-2xl text-center border-b ">
                  <p>Your total available equity</p>
                </div>
                <div className="py-8 px-12 text-xl font-light text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <p>Current home value</p>
                    <p>${formatedPropertyValue}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Max loan amount</p>
                    <p>${formatedMaxLoanAmount}</p>
                  </div>
                  <div className="flex justify-between w-full">
                    <p>Current mortgage balance</p>
                    <p>${formatedMortgageBalance}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xl py-4 px-12 font-semibold border-t border-blue-600 bg-blue-100 rounded-b-md">
                  <p>Borrow up to an additional</p>
                  <p>${formattedMaxBorrow}</p>
                </div>
              </div>
            )}

            {/* Conditional borrow amount field */}
            {borrowSelection === "yes" && (
              <div className="flex flex-col space-y-2 mt-4">
                <label htmlFor="borrowAmount" className="text-xl font-semibold">
                  Up to ${formattedMaxBorrow}, how much do you want to borrow?
                </label>
                <div className="relative border rounded-md border-gray-300 bg-white">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
                    $
                  </span>
                  <input
                    id="borrowAmount"
                    type="text"
                    value={borrowInput}
                    onChange={(e) => {
                      const rawFormatted = formatNumber(e.target.value);
                      const rawNumeric = rawFormatted.replace(/,/g, "");
                      const num = rawNumeric ? parseFloat(rawNumeric) : 0;
                      const clamped = num > maxBorrow ? maxBorrow : num;
                      const display = formatNumber(clamped.toString());
                      setBorrowInput(display);
                      setValue("borrowAmount", clamped);
                    }}
                    placeholder="0"
                    className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
                  />
                </div>
              </div>
            )}
            {/* Conditional borrow table*/}
            {borrowSelection === "yes" && (
              <div className="border rounded-md border-blue-600 mt-4">
                <div className="w-full p-4 text-blue-700 font-semibold text-2xl text-center border-b ">
                  <p>Your total mortgage amount</p>
                </div>
                <div className="py-8 px-12 text-xl font-light text-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <p>Current mortgage balance</p>
                    <p>${formatedMortgageBalance}</p>
                  </div>

                  <div className="flex justify-between">
                    <p>+ Additional equity</p>
                    <p>${formattedBorrowAmount ? formattedBorrowAmount : 0}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xl py-4 px-12 font-semibold border-t border-blue-600 bg-blue-100 rounded-b-md">
                  <p>Total mortgage required</p>
                  <p>${formattedTotalMortgageAmount}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Amortization Remaining */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="amortizationYears" className="text-xl font-semibold">
            {"What's the amortization remaining in years?"}
          </label>
          <input
            id="amortizationYears"
            type="number"
            {...register("amortizationYears", {
              required: "Please enter remaining amortization",
              min: { value: 0, message: "Cannot be negative" },
              max: { value: 30, message: "Maximum is 30 years" },
            })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg "
          />
          {errors.amortizationYears && (
            <p className="text-red-600 mt-1">
              {errors.amortizationYears.message}
            </p>
          )}
        </div>

        {/* Maturity Date */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="maturityDate" className="text-xl font-semibold">
              Maturity date
            </label>
            <button
              type="button"
              onClick={() => toggleHelp("maturityDate")}
              className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
          {activeHelp === "maturityDate" && (
            <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
              {helpTexts.maturityDate}
            </div>
          )}
          <Controller
            control={control}
            name="maturityDate"
            rules={{ required: "Maturity date is required" }}
            render={({ field }) => (
              <DatePicker
                id="maturityDate"
                placeholderText="MM‑DD‑YYYY"
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                dateFormat="MM-dd-yyyy"
                className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
              />
            )}
          />
          {errors.maturityDate && (
            <p className="text-red-600 mt-1">{errors.maturityDate.message}</p>
          )}
        </div>

        {/* Submit Button */}
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
