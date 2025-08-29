"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
import { useState } from "react";
import FormDatePicker from "@/components/form-elements/form-date-picker";
import Dropdown from "@/components/form-elements/dropdown";
import TextInput from "@/components/form-elements/text-input";
import NextButton from "@/components/form-elements/next-button";

export default function MortgagePage() {
  const [mortgageBalance, setMortgageBalance] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const helpTexts = {
    belowOneMillion: "Select yes or no",
    lender: "Select your lender",
    mortgageBalance: "Enter your current mortgage balance",
    otherLender: "Enter the name of your lender",
    maturityDate: "Enter the maturity date of your mortgage",
  };

  const router = useRouter();
  const selectedLender = watch("lender");

  const onSubmit = (data) => {
    // If 'Other' is selected, use the custom lender value
    const payload = {
      ...data,
      lender: data.lender === "Other" ? data.otherLender : data.lender,
    };
    console.log("Mortgage data:", payload);
    router.push("/questionnaire/rates");
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
        <MapRadio
          id="belowOneMillion"
          register={register}
          requiredText="Select yes or no"
          label="Was the property value below $1M at purchase?"
          options={yesNoOptions}
          error={errors.belowOneMillion}
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

        {/* Maturity Date */}
        <FormDatePicker
          id="maturityDate"
          label="Maturity date"
          requiredText="Maturity date is required"
          control={control}
          error={errors.maturityDate}
          helpTexts={helpTexts.maturityDate}
        />

        {/* Submit */}
        <NextButton label="Show me rates" />
      </form>
    </div>
  );
}
