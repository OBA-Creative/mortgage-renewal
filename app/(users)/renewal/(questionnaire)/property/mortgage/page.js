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
import { formatNumber, parseNumber } from "@/lib/number-utils";

export default function MortgagePage() {
  const { formData, setFormData } = useMortgageStore();

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
    propertyValue:
      "Enter your estimate of the current market value. Your property assessment can be a helpful reference. This helps determine available mortgage rates.",
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
      "This is the date your current mortgage term expires and you'll need to renew. You can find it on your mortgage documents or statement.",
  };

  const router = useRouter();
  const selectedLender = watch("lender");
  const heloc = watch("heloc");
  const borrowSelection = watch("borrowAdditionalFunds");
  const watchedPropertyValue = watch("propertyValue");
  const watchedHelocBalance = watch("helocBalance");
  const watchedMaturityDate = watch("maturityDate");

  // Check if maturity date is more than 120 days from today
  const isDateBeyond120Days = (() => {
    if (!watchedMaturityDate) return false;
    const selected = new Date(watchedMaturityDate);
    if (isNaN(selected)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = selected.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 120;
  })();

  const [earlyRenewalAcknowledged, setEarlyRenewalAcknowledged] =
    useState(false);
  const [showLtvWarning, setShowLtvWarning] = useState(false);

  // Reset acknowledgement when date changes to within 120 days
  useEffect(() => {
    if (!isDateBeyond120Days) {
      setEarlyRenewalAcknowledged(false);
    }
  }, [isDateBeyond120Days]);

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

  // Calculate values for BorrowAdditionalFunds component
  const currentPropertyValue =
    parseNumber(propertyValue) || parseNumber(formData.propertyValue);
  const currentMortgageBalance =
    parseNumber(mortgageBalance) || parseNumber(formData.mortgageBalance);
  const currentHelocBalance =
    parseNumber(watchedHelocBalance) ||
    parseNumber(helocBalance) ||
    parseNumber(formData.helocBalance);

  // Show LTV warning popup when downpayment is 20%+ and mortgage balance >= 80% of property value
  useEffect(() => {
    if (
      formData.downpaymentValue === "20% or more" &&
      currentPropertyValue > 0 &&
      currentMortgageBalance > 0 &&
      currentMortgageBalance >= currentPropertyValue * 0.8
    ) {
      setShowLtvWarning(true);
    }
  }, [currentMortgageBalance, currentPropertyValue, formData.downpaymentValue]);

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

  // Block submission if downpayment is 20%+ and LTV is 80% or more
  const isLtvTooHigh =
    formData.downpaymentValue === "20% or more" &&
    currentPropertyValue > 0 &&
    currentMortgageBalance > 0 &&
    currentMortgageBalance >= currentPropertyValue * 0.8;

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
    router.push("/renewal/property/mortgage/rates");
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
        Tell us about your current mortgage
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

        {/* Early renewal warning — maturity date > 120 days out */}
        {isDateBeyond120Days && (
          <div className="p-4 border rounded-lg border-amber-300 bg-amber-50">
            <p className="text-sm font-medium text-amber-800 sm:text-base">
              Your renewal date is more than 120 days away. We cannot guarantee
              that the rates shown will still be available at that time, and
              breaking your current mortgage early may result in prepayment
              penalties from your lender.
            </p>
            <label className="flex items-start gap-3 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={earlyRenewalAcknowledged}
                onChange={(e) => setEarlyRenewalAcknowledged(e.target.checked)}
                className="w-5 h-5 mt-1 cursor-pointer accent-blue-600 shrink-0"
              />
              <span className="text-sm text-amber-900 sm:text-base">
                I understand — still show me the current renewal rates.
              </span>
            </label>
          </div>
        )}

        {/* Submit */}
        <div className="space-y-2">
          {!isValid && Object.keys(errors).length > 0 && (
            <p className="text-center text-red-600">
              Please complete all required fields to continue
              {errors.maturityDate && " (including maturity date)"}
            </p>
          )}
          {isDateBeyond120Days && !earlyRenewalAcknowledged && (
            <p className="text-center text-amber-600">
              Please acknowledge the early renewal notice above to continue
            </p>
          )}
          {isLtvTooHigh && (
            <p className="text-center text-red-600">
              Your mortgage balance exceeds 80% of your home's value. If
              accurate, switching lenders is not available. Please proceed with
              renewal through your current lender.
            </p>
          )}
          <NextButton
            label="Show me rates"
            disabled={
              (isDateBeyond120Days && !earlyRenewalAcknowledged) || isLtvTooHigh
            }
          />
        </div>
      </form>

      {/* LTV Warning Popup */}
      {showLtvWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center mb-4 space-x-2">
              <svg
                className="w-6 h-6 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                High Loan-to-Value
              </h3>
            </div>
            <p className="text-sm text-gray-700 sm:text-base">
              Based on the information provided, your mortgage balance appears
              to be above 80% of your home&apos;s value. If this is correct, you
              can look to renew with your currently lender as it would need to
              be under 80% to move lenders.
            </p>
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setShowLtvWarning(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
