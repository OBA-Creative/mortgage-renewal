"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
import { useState, useEffect } from "react";
import FormDatePicker from "@/components/form-elements/form-date-picker";
import Dropdown from "@/components/form-elements/dropdown";
import TextInput from "@/components/form-elements/text-input";
import NextButton from "@/components/form-elements/next-button";
import BorrowAdditionalFunds from "@/components/form-elements/borrow-additional-funds";
import { useMortgageStore } from "@/stores/useMortgageStore";

export default function MortgagePage() {
  const { formData, setFormData } = useMortgageStore();

  // Parse numeric values for calculations
  const parseNumber = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(/,/g, "")) || 0;
  };

  // Initialize state variables from store if they exist
  const [mortgageBalance, setMortgageBalance] = useState(
    formData.mortgageBalance ? formData.mortgageBalance.toLocaleString() : "",
  );
  const [propertyValue, setPropertyValue] = useState(
    formData.propertyValue ? formData.propertyValue.toLocaleString() : "",
  );
  const [helocBalance, setHelocBalance] = useState(
    formData.helocBalance ? formData.helocBalance.toLocaleString() : "",
  );
  const [borrowInput, setBorrowInput] = useState(
    formData.borrowAdditionalAmount
      ? formData.borrowAdditionalAmount.toLocaleString()
      : "",
  );

  const [showBelowOneMillion, setShowBelowOneMillion] = useState(
    formData.propertyValue &&
      parseNumber(formData.propertyValue.toString()) < 1000000 &&
      parseNumber(formData.propertyValue.toString()) > 0,
  );
  const [lenderOptions, setLenderOptions] = useState([]);

  // Fetch active lenders from the database
  useEffect(() => {
    async function fetchLenders() {
      try {
        const res = await fetch("/api/lenders");
        const data = await res.json();
        if (data.success && data.lenders.length > 0) {
          setLenderOptions(data.lenders);
        } else {
          setLenderOptions(["Other"]);
        }
      } catch (err) {
        setLenderOptions(["Other"]);
      }
    }
    fetchLenders();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      propertyValue: formData.propertyValue
        ? formData.propertyValue.toLocaleString()
        : "",
      heloc: formData.heloc || "",
      helocBalance: formData.helocBalance
        ? formData.helocBalance.toLocaleString()
        : "",
      borrowAdditionalFunds: formData.borrowAdditionalFunds || "",
      borrowAdditionalAmount: formData.borrowAdditionalAmount
        ? formData.borrowAdditionalAmount.toLocaleString()
        : "",
      belowOneMillion: formData.belowOneMillion || "",
      lender: formData.lender || "",
      mortgageBalance: formData.mortgageBalance
        ? formData.mortgageBalance.toLocaleString()
        : "",
      otherLender: formData.otherLender || "",
      amortizationPeriod: formData.amortizationPeriod || "",
      maturityDate: formData.maturityDate || "", // Use empty string for dates
    },
  });

  const helpTexts = {
    propertyValue: "Enter the estimated current market value of your property.",
    heloc:
      "A Home Equity Line of Credit (HELOC) is a revolving credit line secured by your home's equity. Let us know if you currently have one.",
    helocBalance:
      "Enter the current outstanding balance on your HELOC. This will be included in your total debt calculations.",
    borrowAdditionalFunds:
      "Would you like to borrow additional funds on top of your current mortgage? This can be used for renovations, investments, or other purposes.",
    borrowAdditionalAmount:
      "Enter the amount you'd like to borrow in addition to your current mortgage balance.",
    belowOneMillion:
      "This information helps determine which mortgage stress test rules apply to you. Properties under $1M have different qualification requirements.",
    lender:
      "Select your current mortgage lender from the list. This helps us understand your mortgage terms and available renewal options.",
    mortgageBalance:
      "Enter the remaining balance on your mortgage. You can find this on your most recent statement or by contacting your lender.",
    otherLender:
      "Enter the name of your mortgage lender if it wasn't listed in the dropdown menu above.",
    amortizationPeriod:
      "Enter the number of years remaining on your amortization (between 1 and 30). This affects your payment amount and available rates.",
    maturityDate:
      "This is the date your current mortgage term expires and you’ll need to renew. You can find it on your mortgage documents or statement.",
  };

  const router = useRouter();
  const selectedLender = watch("lender");
  const heloc = watch("heloc");
  const borrowSelection = watch("borrowAdditionalFunds");
  const watchedPropertyValue = watch("propertyValue");
  const watchedHelocBalance = watch("helocBalance");

  // Function to check and update belowOneMillion visibility
  const checkBelowOneMillionVisibility = (value) => {
    const numericValue = parseNumber(value);
    const shouldShow = numericValue >= 1000000;
    setShowBelowOneMillion(shouldShow);
  };

  // Helper function to safely parse form values that could be strings or numbers
  const safeParseNumber = (value) => {
    if (!value) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "");
      return parseFloat(cleaned) || null;
    }
    return null;
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    const raw = String(value).replace(/\D/g, "");
    if (!raw) return "";
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate values for BorrowAdditionalFunds component
  const currentPropertyValue =
    parseNumber(propertyValue) || parseNumber(formData.propertyValue);
  const currentMortgageBalance =
    parseNumber(mortgageBalance) || parseNumber(formData.mortgageBalance);
  const currentHelocBalance =
    parseNumber(watchedHelocBalance) ||
    parseNumber(helocBalance) ||
    parseNumber(formData.helocBalance);

  // Calculate max borrow (80% of property value minus mortgage and heloc)
  const maxBorrow = Math.max(
    0,
    currentPropertyValue * 0.8 - currentMortgageBalance - currentHelocBalance,
  );
  const formattedMaxBorrow = formatNumber(maxBorrow);

  // Show borrow question only if we have property value and mortgage balance
  const showBorrowQuestion =
    currentPropertyValue > 0 &&
    currentMortgageBalance > 0 &&
    currentMortgageBalance < currentPropertyValue * 0.8;

  const onSubmit = (data) => {
    // Validate that maturity date is provided
    if (!data.maturityDate || data.maturityDate.trim() === "") {
      // Don't proceed with form submission if maturity date is missing
      return;
    }

    // If 'Other' is selected, use the custom lender value
    const finalLender =
      data.lender === "Other" ? data.otherLender : data.lender;

    // Parse and validate all numeric fields using helper function
    const parsedPropertyValue = safeParseNumber(data.propertyValue);
    const parsedHelocBalance = safeParseNumber(data.helocBalance);
    const parsedBorrowAmount = safeParseNumber(data.borrowAdditionalAmount);
    const parsedMortgageBalance = safeParseNumber(data.mortgageBalance);

    const parsedAmortizationPeriod = data.amortizationPeriod
      ? parseInt(data.amortizationPeriod)
      : null;

    // Save all data to store
    const updatedFormData = {
      propertyValue: parsedPropertyValue,
      heloc: data.heloc || "",
      helocBalance: parsedHelocBalance,
      borrowAdditionalFunds: data.borrowAdditionalFunds || "",
      borrowAdditionalAmount: parsedBorrowAmount,
      belowOneMillion: data.belowOneMillion || "",
      lender: finalLender || "",
      mortgageBalance: parsedMortgageBalance,
      otherLender: data.otherLender || "",
      amortizationPeriod: parsedAmortizationPeriod,
      maturityDate: data.maturityDate || "",
    };

    setFormData(updatedFormData);
    router.push("/rates/renew");
  };

  const yesNoOptions = ["yes", "no"];
  const helocOptions = ["yes", "no"];

  const helocCondition =
    formData.downpaymentValue === "20% or more"
      ? formData.propertyUsage === "Primary Residence" ||
        formData.propertyUsage === "Second home"
      : false;

  return (
    <div className="w-full">
      <h1 className="mb-8 text-4xl font-semibold text-center">
        {"Now let's learn about your mortgage"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
        {/* Property Value */}
        <DollarInput
          id="propertyValue"
          label="Current property value?"
          setValue={setValue}
          valueState={propertyValue}
          setValueState={(value) => {
            setPropertyValue(value);
          }}
          onBlur={(numericValue) =>
            checkBelowOneMillionVisibility(numericValue)
          }
          register={register}
          helpTexts={helpTexts.propertyValue}
          requiredText="Property value is required"
          error={errors.propertyValue}
        />
        {/* Current Mortgage Balance */}
        <DollarInput
          id="mortgageBalance"
          label="Current mortgage balance?"
          setValue={setValue}
          valueState={mortgageBalance}
          setValueState={setMortgageBalance}
          register={register}
          helpTexts={helpTexts.mortgageBalance}
          requiredText="Mortgage balance is required"
          error={errors.mortgageBalance}
        />
        {/* Below One Million Radio - only show if property value is under $1M */}
        {showBelowOneMillion && (
          <MapRadio
            id="belowOneMillion"
            register={register}
            requiredText="Select yes or no"
            label="Was the property value below $1M at purchase?"
            options={yesNoOptions}
            helpTexts={helpTexts.belowOneMillion}
            error={errors.belowOneMillion}
          />
        )}
        {/* Lender Select */}
        <div className="flex flex-col space-y-8">
          <Dropdown
            id="lender"
            label="Who is your current lender?"
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
              helpTexts={helpTexts.otherLender}
              error={errors.otherLender}
            />
          )}
        </div>
        {/* HELOC Questions - only show for Primary Residence or Second home */}
        {helocCondition && (
          <div className="flex flex-col space-y-4">
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
                label="What is your current HELOC balance?"
                setValue={setValue}
                valueState={helocBalance}
                setValueState={setHelocBalance}
                register={register}
                requiredText="HELOC balance is required"
                helpTexts={helpTexts.helocBalance}
                error={errors.helocBalance}
                placeholder="e.g. 75,000"
              />
            )}
          </div>
        )}
        {/* Borrow Additional Funds */}
        <BorrowAdditionalFunds
          register={register}
          setValue={setValue}
          errors={errors}
          borrowSelection={borrowSelection}
          borrowInput={borrowInput}
          setBorrowInput={setBorrowInput}
          propertyValue={currentPropertyValue}
          mortgageBalance={currentMortgageBalance}
          maxBorrow={maxBorrow}
          formattedMaxBorrow={formattedMaxBorrow}
          formData={formData}
          helpTexts={helpTexts}
          showBorrowQuestion={showBorrowQuestion}
          // Pass current form values for heloc (not from store)
          currentHeloc={heloc}
          currentHelocBalance={currentHelocBalance}
        />
        {/* Amortization Remaining */}
        <TextInput
          id="amortizationPeriod"
          label="What is the remaining amortization (in years)?"
          type="number"
          min={1}
          max={30}
          step="1"
          register={register}
          requiredText="Please enter remaining amortization"
          validationRules={{
            min: {
              value: 1,
              message: "Amortization must be at least 1 year",
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
          placeholder="Enter years"
        />
        {/* Maturity Date */}
        <FormDatePicker
          id="maturityDate"
          label="Renewal date"
          requiredText="Enter your renewal date"
          control={control}
          error={errors.maturityDate}
          helpTexts={helpTexts.maturityDate}
        />
        {/* Submit */}
        <div className="space-y-2">
          {!isValid && Object.keys(errors).length > 0 && (
            <p className="text-center text-red-600">
              Please complete all required fields to continue
              {errors.maturityDate && " (including maturity date)"}
            </p>
          )}
          <NextButton label="Show me rates" />
        </div>
      </form>
    </div>
  );
}
