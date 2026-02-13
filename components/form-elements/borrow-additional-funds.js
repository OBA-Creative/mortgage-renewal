import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
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

export default function BorrowAdditionalFunds({
  // Form props
  register,
  setValue,
  errors,
  // Watch values
  borrowSelection,
  // Input states
  borrowInput,
  setBorrowInput,
  // Calculation values
  propertyValue,
  mortgageBalance,
  maxBorrow,
  formattedMaxBorrow,
  // Store data
  formData,
  // Help texts
  helpTexts,
  // Show condition
  showBorrowQuestion,
  // Current form values for dynamic updates
  currentHeloc,
  currentHelocBalance,
}) {
  const helocOptions = ["yes", "no"];

  if (!showBorrowQuestion) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-8">
      <MapRadio
        id="borrowAdditionalFunds"
        label="Do you want to borrow additional funds?"
        register={register}
        requiredText="Select an option"
        options={helocOptions}
        helpTexts={helpTexts.borrowAdditionalFunds}
        error={errors.borrowAdditionalFunds}
      />

      {/* Conditional borrow table */}
      {borrowSelection === "yes" && (
        <AvailableEquityCard
          propertyValue={propertyValue}
          mortgageBalance={mortgageBalance}
          heloc={currentHeloc === "yes"}
          helocBalance={currentHelocBalance}
        />
      )}

      {/* Conditional borrow amount field */}
      {borrowSelection === "yes" && (
        <DollarInput
          id="borrowAdditionalAmount"
          setValue={setValue}
          label={`Up to ${formattedMaxBorrow}, how much do you want to borrow?`}
          valueState={borrowInput}
          setValueState={(value) => {
            const numericValue = parseNumber(value);
            const maxNumeric = parseNumber(maxBorrow);

            // Always update the input state to allow typing
            setBorrowInput(value);

            // Set form value and validate
            if (numericValue <= maxNumeric) {
              setValue("borrowAdditionalAmount", numericValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            } else {
              // Set to max value but keep the typed value in display for user feedback
              setValue("borrowAdditionalAmount", numericValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }}
          register={register}
          requiredText="Borrow amount is required"
          validationRules={{
            required: "Borrow amount is required",
            min: {
              value: 1,
              message: "Borrow amount must be greater than $0",
            },
            max: {
              value: parseNumber(maxBorrow),
              message: "You can only borrow up to 80% of your property value.",
            },
            validate: (value) => {
              const numericValue = parseNumber(value);
              const maxNumeric = parseNumber(maxBorrow);
              if (numericValue > maxNumeric) {
                return "You can only borrow up to 80% of your property value.";
              }
              return true;
            },
          }}
          helpTexts={helpTexts.borrowAdditionalAmount}
          error={errors.borrowAdditionalAmount}
          defaultValue={formData?.borrowAdditionalAmount}
          placeholder="e.g. 100,000"
        />
      )}

      {/* Conditional borrow table */}
      {borrowSelection === "yes" && (
        <YourTotalMortgageCard
          mortgageBalance={mortgageBalance}
          borrowAdditionalAmount={borrowInput}
          helocBalance={currentHelocBalance}
        />
      )}
    </div>
  );
}
