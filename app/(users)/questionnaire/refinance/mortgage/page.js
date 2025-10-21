"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import DollarInput from "@/components/form-elements/dollar-input";
import MapRadio from "@/components/form-elements/map-radio";
import TextInput from "@/components/form-elements/text-input";
import FormDatePicker from "@/components/form-elements/form-date-picker";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";
import Dropdown from "@/components/form-elements/dropdown";
import BorrowAdditionalFunds from "@/components/form-elements/borrow-additional-funds";

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

  const { formData, setFormData } = useMortgageStore();

  // Initialize state variables with formatted values from store
  const [propertyInput, setPropertyInput] = useState("");
  const [balanceInput, setBalanceInput] = useState("");
  const [borrowInput, setBorrowInput] = useState("");
  const [helocBalanceInput, setHelocBalanceInput] = useState("");

  // Initialize input states with store values when component mounts or formData changes
  useEffect(() => {
    if (formData.propertyValue) {
      setPropertyInput(formatNumber(formData.propertyValue.toString()));
    }
    if (formData.mortgageBalance) {
      setBalanceInput(formatNumber(formData.mortgageBalance.toString()));
    }
    if (formData.borrowAdditionalAmount) {
      setBorrowInput(formatNumber(formData.borrowAdditionalAmount.toString()));
    }
    if (formData.helocBalance) {
      setHelocBalanceInput(formatNumber(formData.helocBalance.toString()));
    }
  }, [
    formData.propertyValue,
    formData.mortgageBalance,
    formData.borrowAdditionalAmount,
    formData.helocBalance,
  ]);

  const helpTexts = {
    heloc:
      "A Home Equity Line of Credit (HELOC) is a flexible borrowing option secured by your home's equity. Let us know if you currently have one.",
    helocBalance:
      "Enter your current HELOC balance. This is the amount you currently owe on your HELOC.",
    lender:
      "Select your current mortgage lender from the list. This helps us understand your current mortgage terms and available renewal options.",
    propertyValue:
      "Enter the current market value of your property. This can be based on a recent appraisal or your best estimate of current market conditions.",
    mortgageBalance:
      "Enter the remaining balance on your current mortgage. You can find this on your most recent mortgage statement or by contacting your lender.",
    borrowAdditionalFunds:
      "You may be eligible to borrow additional funds against your home's equity. This can be used for renovations, debt consolidation, or other financial needs.",
    borrowAdditionalAmount:
      "Enter the amount you'd like to borrow. The maximum is calculated based on 80% of your property value minus your current mortgage and HELOC balances.",
    amortizationPeriod:
      "Enter the number (between 0 and 30) of years left on your current amortization schedule. This affects your payment amount and available rates.",
    maturityDate:
      "This is the date when your current mortgage term expires and you'll need to renew. You can find this date on your mortgage documents or statement.",
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
      heloc: formData?.heloc || "",
      helocBalance: formData?.helocBalance || null,
      lender: formData?.lender || "",
      otherLender: formData?.otherLender || "",
      propertyValue: formData?.propertyValue || null,
      mortgageBalance: formData?.mortgageBalance || null,
      borrowAdditionalFunds: formData?.borrowAdditionalFunds || "",
      borrowAdditionalAmount: formData?.borrowAdditionalAmount || null,
      amortizationPeriod: formData?.amortizationPeriod || null,
      maturityDate: parseStoredDate(formData?.maturityDate),
    },
  });

  // Update form values when formData changes (e.g., when navigating back)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setValue("heloc", formData.heloc || "");
      setValue("helocBalance", formData.helocBalance || null);
      setValue("lender", formData.lender || "");
      setValue("otherLender", formData.otherLender || "");
      setValue("propertyValue", formData.propertyValue || null);
      setValue("mortgageBalance", formData.mortgageBalance || null);
      setValue("borrowAdditionalFunds", formData.borrowAdditionalFunds || "");
      setValue(
        "borrowAdditionalAmount",
        formData.borrowAdditionalAmount || null
      );
      setValue("amortizationPeriod", formData.amortizationPeriod || null);
      setValue("maturityDate", parseStoredDate(formData.maturityDate));
    }
  }, [formData, setValue]);

  const router = useRouter();
  const propertyValue = useWatch({ control, name: "propertyValue" });
  const mortgageBalance = useWatch({ control, name: "mortgageBalance" });
  const borrowSelection = useWatch({ control, name: "borrowAdditionalFunds" });
  const borrowAdditionalAmount = useWatch({
    control,
    name: "borrowAdditionalAmount",
  });

  const selectedLender = watch("lender");
  const heloc = watch("heloc");
  const helocBalance = watch("helocBalance");

  // Borrow options for styled radios
  const helocOptions = ["yes", "no"];

  // Calculate eligibility and limits
  const showBorrowQuestion =
    propertyValue && mortgageBalance && mortgageBalance < propertyValue * 0.8;

  const maxBorrow = showBorrowQuestion
    ? Math.floor(propertyValue * 0.8 - mortgageBalance - (helocBalance || 0))
    : 0;

  const formatedMortgageBalance = formatNumber(mortgageBalance?.toString());
  const formattedMaxBorrow = formatNumber(maxBorrow?.toString());
  const formattedborrowAdditionalAmount = formatNumber(
    borrowAdditionalAmount?.toString()
  );
  const totalMortgageAmount =
    (mortgageBalance || 0) + (borrowAdditionalAmount || 0);
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
        helocBalance: parseNumber(data.helocBalance),
      };
      setFormData({ ...formData, ...payload });
      console.log("Mortgage data:", payload);
      router.push("/questionnaire/refinance/rates");
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
    <div className="max-w-xl p-6 mx-auto">
      <h1 className="mb-8 text-4xl font-semibold text-center">
        {"Now let's learn about your mortgage"}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            defaultValue={formData?.propertyValue}
            placeholder="e.g. 850,000"
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
            defaultValue={formData?.mortgageBalance}
            placeholder="e.g. 600,000"
          />
        </div>

        {/* Lender Select */}
        <div className="flex flex-col space-y-8">
          <Dropdown
            id="lender"
            label="Who is the lender?"
            options={lenderOptions}
            disabledText="Select your lender"
            register={register}
            requiredText="Select a lender"
            helpTexts={helpTexts.lender}
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

        {/* HELOC Question */}
        <div className="flex flex-col space-y-8">
          <MapRadio
            id="heloc"
            register={register}
            requiredText="Select an option"
            label="Do you have a HELOC?"
            options={helocOptions}
            helpTexts={helpTexts.heloc}
            error={errors.heloc}
          />

          {heloc === "yes" && (
            <DollarInput
              id="helocBalance"
              setValue={setValue}
              label="What is your current HELOC balance?"
              valueState={helocBalanceInput}
              setValueState={setHelocBalanceInput}
              register={register}
              helpTexts={helpTexts.helocBalance}
              requiredText="Current HELOC balance is required"
              error={errors.helocBalance}
              defaultValue={formData?.helocBalance}
              placeholder="e.g. 75,000"
            />
          )}
        </div>

        {/* Borrow Additional Funds */}
        <BorrowAdditionalFunds
          register={register}
          setValue={setValue}
          errors={errors}
          borrowSelection={borrowSelection}
          borrowInput={borrowInput}
          setBorrowInput={setBorrowInput}
          propertyValue={propertyValue}
          mortgageBalance={mortgageBalance}
          maxBorrow={maxBorrow}
          formattedMaxBorrow={formattedMaxBorrow}
          formData={formData}
          helpTexts={helpTexts}
          showBorrowQuestion={showBorrowQuestion}
          // Pass current form values for heloc (not from store)
          currentHeloc={heloc}
          currentHelocBalance={helocBalance}
        />

        {/* Amortization Remaining */}
        <TextInput
          id="amortizationPeriod"
          label="What's the amortization remaining in years?"
          type="number"
          min={0}
          max={30}
          step="1"
          register={register}
          requiredText="Please enter remaining amortization"
          validationRules={{
            min: {
              value: 0,
              message: "Amortization must be at least 0 years",
            },
            max: {
              value: 30,
              message: "Amortization cannot exceed 30 years",
            },
            pattern: {
              value: /^\d+$/,
              message: "Please enter a whole number only",
            },
          }}
          helpTexts={helpTexts.amortizationPeriod}
          error={errors.amortizationPeriod}
          inputMode="numeric"
          realTimeValidation={true}
          onWheel={(e) => e.target.blur()}
          placeholder="e.g. 22"
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
