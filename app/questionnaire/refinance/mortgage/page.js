"use client";

import { useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";

import DollarInput from "@/components/form-elements/dollar-input";
import MapRadio from "@/components/form-elements/map-radio";
import TextInput from "@/components/form-elements/text-input";
import FormDatePicker from "@/components/form-elements/form-date-picker";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";
import LocationInput from "@/components/form-elements/location-input";
import Dropdown from "@/components/form-elements/dropdown";

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

  const { formData, setFormData } = useMortgageStore();

  const helpTexts = {
    lender:
      "Select your current lender from the list, or pick 'Other' to specify a different one.",
    propertyValue: "Enter the current market value of your property.",
    mortgageBalance:
      "Enter your outstanding mortgage balance at the time of renewal.",
    maturityDate: "Provide the date when your current mortgage term expires.",
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
      borrowAdditionalAmount: "",
      amortizationPeriod: null,
      maturityDate: null,
    },
  });

  const router = useRouter();
  const propertyValue = useWatch({ control, name: "propertyValue" });
  const mortgageBalance = useWatch({ control, name: "mortgageBalance" });
  const borrowSelection = useWatch({ control, name: "borrowAdditionalFunds" });
  const borrowAdditionalAmount = useWatch({
    control,
    name: "borrowAdditionalAmount",
  });

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
  const formattedborrowAdditionalAmount = formatNumber(
    borrowAdditionalAmount.toString()
  );
  const totalMortgageAmount = mortgageBalance + (borrowAdditionalAmount || 0);
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
      setFormData({ ...formData, ...payload });
      console.log("Mortgage data:", payload);
      router.push("/questionnaire/rates");
    },
    [formData, router, setFormData]
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
        <LocationInput
          register={register}
          errorCity={errors.city}
          errorProvince={errors.province}
        />

        {/* Lender Select */}
        <div className="flex flex-col space-y-8">
          <Dropdown
            id="lender"
            label="Who is the lender?"
            options={lenderOptions}
            disabledText="Select your lender"
            register={register}
            requiredText="Select a lender"
            error={errors.lender}
          />

          {/* Conditional 'Other' Input */}
          {selectedLender === "Other" && (
            <TextInput
              id="otherLender"
              type="text"
              label="Please specify your lender"
              register={register}
              requiredText="Please specify your lender"
              error={errors.otherLender}
            />
          )}
        </div>

        {/* Property & Balance */}
        <div className="space-y-8">
          {/* Property Value */}
          <DollarInput
            id="propertyValue"
            setValue={setValue}
            label="Current property value?"
            valueState={propertyInput}
            setValueState={setPropertyInput}
            register={register}
            helpTexts={helpTexts.propertyValue}
            requiredText="Property value is required"
            error={errors.propertyValue}
          />
          {/* Mortgage Balance */}
          <DollarInput
            id="mortgageBalance"
            setValue={setValue}
            label="Current mortgage balance?"
            valueState={balanceInput}
            setValueState={setBalanceInput}
            register={register}
            helpTexts={helpTexts.mortgageBalance}
            requiredText="Current mortgage balance is required"
            error={errors.mortgageBalance}
          />
        </div>

        {/* Borrow Additional Funds */}
        {showBorrowQuestion && (
          <div className="flex flex-col space-y-4">
            <MapRadio
              id="borrowAdditionalFunds"
              label="Do you want to borrow additional funds?"
              register={register}
              requiredText="Select an option"
              options={helocOptions}
              error={errors.borrowAdditionalFunds}
            />
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
              <DollarInput
                id="borrowAdditionalAmount"
                setValue={setValue}
                label={`Up to ${formattedMaxBorrow}, how much do you want to borrow?`}
                valueState={borrowInput}
                setValueState={setBorrowInput}
                register={register}
                requiredText="Current mortgage balance is required"
                error={errors.borrowAdditionalAmount}
              />
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
                    <p>
                      $
                      {formattedborrowAdditionalAmount
                        ? formattedborrowAdditionalAmount
                        : 0}
                    </p>
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
        <TextInput
          id="amortizationPeriod"
          label="What's the amortization remaining in years?"
          type="number"
          register={register}
          requiredText="Please enter remaining amortization"
          error={errors.amortizationPeriod}
        />

        {/* Maturity Date */}
        <FormDatePicker
          id="maturityDate"
          label="Maturity date"
          requiredText="Please enter a maturity date"
          control={control}
          activeHelp={activeHelp}
          toggleHelp={toggleHelp}
          helpTexts={helpTexts.maturityDate}
          error={errors.maturityDate}
        />

        {/* Submit Button */}
        <NextButton label="Show me rates" />
      </form>
    </div>
  );
}
