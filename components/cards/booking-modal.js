"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { useMortgageStore } from "@/stores/useMortgageStore";

// Calendly inline scheduler inside our modal
const InlineWidget = dynamic(
  () => import("react-calendly").then((m) => m.InlineWidget),
  { ssr: false },
);

// Custom Input Component for Booking Modal
const BookingInput = ({
  id,
  label,
  type = "text",
  placeholder,
  register,
  requiredText,
  validationRules = {},
  error,
  inputMode,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`w-full px-3 py-2 h-12 border rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
        {...register(id, {
          required: requiredText,
          ...validationRules,
        })}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

// Custom Phone Input Component with +1 prefix and formatting
const PhoneInput = ({
  id,
  label,
  register,
  requiredText,
  error,
  setValue,
  watch,
}) => {
  const phoneValue = watch(id) || "";

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Always ensure we start with country code 1
    if (digits.length === 0) {
      return "+1 ";
    }

    // If digits start with 1, use it as country code
    const countryCode = digits.charAt(0) === "1" ? digits.slice(1) : digits;

    // Format based on remaining digits after country code
    if (countryCode.length === 0) {
      return "+1 ";
    } else if (countryCode.length <= 3) {
      return `+1 (${countryCode}`;
    } else if (countryCode.length <= 6) {
      return `+1 (${countryCode.slice(0, 3)}) ${countryCode.slice(3)}`;
    } else {
      return `+1 (${countryCode.slice(0, 3)}) ${countryCode.slice(3, 6)} ${countryCode.slice(6, 10)}`;
    }
  };

  const handleChange = (e) => {
    const input = e.target.value;

    // Always ensure minimum +1 format
    if (input.length < 3) {
      setValue(id, "+1 ", { shouldValidate: true });
      return;
    }

    const formatted = formatPhoneNumber(input);
    setValue(id, formatted, { shouldValidate: true });
  };

  const handleKeyDown = (e) => {
    // Prevent deletion of +1 prefix
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      phoneValue.length <= 4
    ) {
      e.preventDefault();
      setValue(id, "+1 ");
    }
  };

  const handleFocus = () => {
    // Ensure +1 is present when field is focused
    if (!phoneValue || phoneValue.length < 3) {
      setValue(id, "+1 ");
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-semibold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="tel"
        value={phoneValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="+1 (604) 778 8766"
        inputMode="tel"
        className={`w-full h-12 px-3 py-2 border rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - calendlyUrl: string  (e.g. "https://calendly.com/YOUR_ORG/YOUR_EVENT")
 * - selectedRate: object with { term, percentage, monthlyPayment, lender } (optional)
 */
export default function BookingModal({
  open,
  onClose,
  calendlyUrl,
  selectedRate,
}) {
  const [step, setStep] = useState(1); // 1=collect details, 2=calendly, 3=success confirmation

  const { formData, setFormData, touch } = useMortgageStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      phone: formData.phone || "+1 ",
    },
    mode: "onTouched",
  });

  // Register phone field with validation
  const phoneRegister = register("phone", {
    required: "Phone is required",
    pattern: {
      value: /^\+1 \(\d{3}\) \d{3} \d{4}$/,
      message: "Please enter a complete Canadian phone number",
    },
  });

  // Optional Calendly flags
  const url = useMemo(() => {
    const u = new URL(calendlyUrl);
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("hide_landing_page_details", "1");
    return u.toString();
  }, [calendlyUrl]);

  // Step 1 submit → persist to Zustand, send email, save to DB, then show Calendly
  const onLeadSubmit = async (data) => {
    try {
      // Update store with form data
      const leadData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      };

      setFormData(leadData);
      touch?.();

      // Get fresh store data — try getState() first, fall back to component-level formData
      const storeData = useMortgageStore.getState().formData || formData || {};

      // Combine all store data with contact info and selected rate for DB save
      const cleanedRate = selectedRate
        ? {
            term: selectedRate.term || "",
            percentage:
              parseFloat(
                String(selectedRate.percentage).replace(/[^0-9.]/g, ""),
              ) || null,
            monthlyPayment:
              parseFloat(
                String(selectedRate.monthlyPayment).replace(/[^0-9.]/g, ""),
              ) || null,
            lender: selectedRate.lender || "",
          }
        : {};

      const userData = {
        ...storeData,
        ...leadData,
        selectedRate: cleanedRate,
      };

      // Remove legacy 'name' field if present
      delete userData.name;

      console.log("[BookingModal] Store formData:", storeData);
      console.log("[BookingModal] Lead data:", leadData);
      console.log("[BookingModal] Combined userData:", userData);

      // Save user to database and send email in parallel
      const [userResponse, emailResponse] = await Promise.all([
        fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }),
        fetch("/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Contact details
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.phone,
            // All mortgage store data
            mortgageData: formData,
            // Selected rate information
            selectedRate: selectedRate,
          }),
        }),
      ]);

      const userResult = await userResponse.json();
      if (!userResponse.ok) {
        console.error(
          `Failed to save user to database — Status: ${userResponse.status} — Body: ${JSON.stringify(userResult)} — Sent data: ${JSON.stringify(userData)}`,
        );
      } else {
        console.log("User saved to database successfully:", userResult);
      }

      if (!emailResponse.ok) {
        console.error("Failed to send email notification");
      } else {
        console.log("Email notification sent successfully");
      }

      // Proceed to step 2 regardless of email status
      setStep(2);
    } catch (error) {
      console.error("Error in onLeadSubmit:", error);
      // Proceed to step 2 even if there's an error
      setStep(2);
    }
  };

  // Listen for Calendly schedule event to close modal (and you can POST to backend here)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e?.data?.event === "calendly.event_scheduled") {
        // e.data.payload has invitee + event (date/time, etc.)
        // Example: send to your API along with lead details from store:
        // fetch("/api/calendly-booked", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ lead: formData, calendly: e.data.payload }),
        // });

        setStep(3); // show success confirmation
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-100 bg-black/55 backdrop-blur-md">
      <div className="w-full max-w-3xl overflow-hidden bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between py-3 pl-6 pr-4 bg-blue-600 shadow-md">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center text-sm font-bold text-blue-600 bg-white rounded-full h-7 w-7">
              {step === 3 ? 2 : step}
            </span>
            <h2 className="text-lg font-semibold text-white">
              {step === 1
                ? "Your details"
                : step === 2
                  ? "Pick a time"
                  : "Confirmed"}
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              setStep(1);
            }}
            className="p-2 text-white rounded-md cursor-pointer hover:text-red-500 hover:bg-white"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleSubmit(onLeadSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <BookingInput
                  id="firstName"
                  label="First name"
                  register={register}
                  requiredText="First name is required"
                  error={errors.firstName}
                  placeholder="First name"
                />
                <BookingInput
                  id="lastName"
                  label="Last name"
                  register={register}
                  requiredText="Last name is required"
                  error={errors.lastName}
                  placeholder="Last name"
                />
              </div>

              <BookingInput
                id="email"
                type="email"
                label="Email"
                register={register}
                requiredText="Email is required"
                validationRules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                error={errors.email}
                placeholder="your.email@example.com"
                inputMode="email"
              />

              <PhoneInput
                id="phone"
                label="Phone"
                register={phoneRegister}
                requiredText="Phone is required"
                error={errors.phone}
                setValue={setValue}
                watch={watch}
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setStep(1);
                  }}
                  className="px-10 py-3 font-semibold transition-all duration-200 border border-gray-300 rounded-full cursor-pointer hover:border-gray-200 hover:bg-gray-200 hover:scale-110 hover:shadow-lg "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? "Sending..." : "Continue"}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-center text-gray-600 ">
                We'll prefill your details in Calendly. After you confirm the
                time, we'll record your booking.
              </p>

              <InlineWidget
                styles={{ height: "640px", width: "100%" }}
                url={url}
                pageSettings={{
                  hideEventTypeDetails: true,
                  hideLandingPageDetails: true,
                  primaryColor: "000000",
                }}
                prefill={{
                  name: `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
                  email: formData.email || "",
                  phone: formData.phone || "",
                  customAnswers: { a1: formData.phone || "" },
                }}
                utm={{
                  source: "mortgage-renewals",
                  medium: "modal",
                  campaign: "inquire",
                }}
              />

              <div>
                <button
                  onClick={() => setStep(1)}
                  className="px-10 py-3 font-semibold transition-all duration-200 border border-gray-300 rounded-full cursor-pointer hover:border-gray-200 hover:bg-gray-200 hover:scale-110 hover:shadow-lg "
                >
                  Back to details
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-10 space-y-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">
                You're all set!
              </h3>
              <p className="max-w-md text-gray-600">
                Your call has been booked successfully. We look forward to
                speaking with you!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setStep(1);
                }}
                className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
