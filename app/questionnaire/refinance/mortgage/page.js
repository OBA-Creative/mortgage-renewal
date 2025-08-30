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
import Dropdown from "@/components/form-elements/dropdown";
import PlacesAutocompleteInput from "@/components/form-elements/places-autocomplete-input";
import AvailableEquityCard from "@/components/cards/available-equity-card";
import YourTotalMortgageCard from "@/components/cards/your-total-mortgage-card";

// Safe number formatting that handles both strings and numbers
const formatNumber = (value) => {
  if (!value && value !== 0) return "";

  // Convert to string and remove all non-digits
  const raw = String(value).replace(/\D/g, "");
  if (!raw) return "";

  // Add commas for thousands separator
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (formattedValue) => {
  // Remove commas and convert to number
  const raw = String(formattedValue).replace(/,/g, "");
  const parsed = parseFloat(raw);
  // Return 0 for invalid numbers instead of empty string, or the parsed number
  return isNaN(parsed) ? 0 : parsed;
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
  console.log(formData);

  // Helper function to convert string date to Date object
  const parseStoredDate = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: formData?.city,
      province: formData.province,
      lender: formData.lender,
      otherLender: formData.otherLender,
      propertyValue: formData.propertyValue,
      mortgageBalance: formData.mortgageBalance,
      borrowAdditionalFunds: formData.borrowAdditionalFunds,
      borrowAdditionalAmount: formData.borrowAdditionalAmount,
      amortizationPeriod: formData.amortizationPeriod,
      maturityDate: parseStoredDate(formData.maturityDate),
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
    ? Math.floor(propertyValue * 0.8 - mortgageBalance - formData.helocBalance)
    : 0;

  const formatedMortgageBalance = formatNumber(mortgageBalance?.toString());
  const formattedMaxBorrow = formatNumber(maxBorrow?.toString());
  const formattedborrowAdditionalAmount = formatNumber(
    borrowAdditionalAmount?.toString()
  );
  const totalMortgageAmount = mortgageBalance + borrowAdditionalAmount;
  const formattedTotalMortgageAmount = formatNumber(
    totalMortgageAmount.toString()
  );

  const onSubmit = useCallback(
    (data) => {
      // Safely handle maturityDate conversion
      let formattedDate = "";
      if (data.maturityDate) {
        if (data.maturityDate instanceof Date) {
          // If it's already a Date object
          formattedDate = data.maturityDate.toISOString().split("T")[0];
        } else if (typeof data.maturityDate === "string") {
          // If it's a string, try to parse it
          const parsedDate = new Date(data.maturityDate);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split("T")[0];
          }
        }
      }

      // Ensure numeric fields are stored as numbers
      const payload = {
        ...data,
        lender: data.lender === "Other" ? data.otherLender : data.lender,
        maturityDate: formattedDate,
        // Convert string/formatted values to numbers for calculations
        propertyValue: parseNumber(data.propertyValue),
        mortgageBalance: parseNumber(data.mortgageBalance),
        borrowAdditionalAmount: parseNumber(data.borrowAdditionalAmount),
        amortizationPeriod: parseNumber(data.amortizationPeriod),
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

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8">
        {"Now let's learn about your mortgage"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* City & Province */}
        <PlacesAutocompleteInput
          label="City"
          id="city"
          register={register}
          requiredText="City is required"
          error={errors.city}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          provinceFieldId="province" // 👈 hidden field name
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
              <AvailableEquityCard
                propertyValue={propertyValue}
                mortgageBalance={mortgageBalance}
                heloc={formData.heloc === "yes"}
                helocBalance={parseFloat(formData?.helocBalance)}
              />
            )}

            {/* Conditional borrow amount field */}
            {borrowSelection === "yes" && (
              <DollarInput
                id="borrowAdditionalAmount"
                setValue={setValue}
                label={`Up to ${formattedMaxBorrow}, how much do you want to borrow?`}
                valueState={
                  parseNumber(borrowInput) < parseNumber(maxBorrow)
                    ? borrowInput
                    : formattedMaxBorrow
                }
                setValueState={setBorrowInput}
                register={register}
                requiredText="Current mortgage balance is required"
                error={errors.borrowAdditionalAmount}
              />
            )}
            {/* Conditional borrow table*/}
            {borrowSelection === "yes" && (
              <YourTotalMortgageCard
                mortgageBalance={mortgageBalance}
                borrowAdditionalAmount={
                  parseNumber(borrowInput) < parseNumber(maxBorrow)
                    ? borrowInput
                    : formattedMaxBorrow
                }
              />
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
