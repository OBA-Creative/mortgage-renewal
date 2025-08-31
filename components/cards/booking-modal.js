"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { useMortgageStore } from "@/stores/useMortgageStore";
import TextInput from "@/components/form-elements/text-input";

// Calendly inline scheduler inside our modal
const InlineWidget = dynamic(
  () => import("react-calendly").then((m) => m.InlineWidget),
  { ssr: false }
);

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - calendlyUrl: string  (e.g. "https://calendly.com/YOUR_ORG/YOUR_EVENT")
 */
export default function BookingModal({ open, onClose, calendlyUrl }) {
  const [step, setStep] = useState(1); // 1=collect details, 2=calendly

  const { formData, setFormData, touch } = useMortgageStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
    },
    mode: "onTouched",
  });

  // Optional Calendly flags
  const url = useMemo(() => {
    const u = new URL(calendlyUrl);
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("hide_landing_page_details", "1");
    return u.toString();
  }, [calendlyUrl]);

  // Step 1 submit → persist to Zustand, then show Calendly
  const onLeadSubmit = (data) => {
    setFormData({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
    });
    touch?.();
    setStep(2);
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

        onClose(); // close modal
        setStep(1); // reset to first step for next open
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 font-bold text-sm">
              {step}
            </span>
            <h2 className="text-lg font-semibold text-white">
              {step === 1 ? "Your details" : "Pick a time"}
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              setStep(1);
            }}
            className="text-white hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleSubmit(onLeadSubmit)}>
              <TextInput
                id="name"
                label="Full name"
                register={register}
                requiredText="Name is required"
                error={errors.name}
              />

              <TextInput
                id="email"
                type="email"
                label="Email"
                register={register}
                requiredText="Email is required"
                validationRules={{
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email",
                  },
                }}
                error={errors.email}
              />

              <TextInput
                id="phone"
                type="tel"
                label="Phone"
                register={register}
                requiredText="Phone is required"
                validationRules={{
                  minLength: { value: 7, message: "Too short" },
                }}
                error={errors.phone}
                placeholder="+1 604 555 1234"
                inputMode="tel"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setStep(1);
                  }}
                  className="px-10 py-3 border border-gray-300 rounded-full hover:bg-gray-100 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className=" text-gray-600 text-center">
                We’ll prefill your details in Calendly. After you confirm the
                time, we’ll record your booking.
              </p>

              <InlineWidget
                styles={{ height: "680px", width: "100%" }}
                url={url}
                pageSettings={{
                  hideEventTypeDetails: true,
                  hideLandingPageDetails: true,
                  primaryColor: "000000",
                }}
                prefill={{
                  // Calendly supports these directly:
                  name: formData.name || "",
                  email: formData.email || "",
                  phone: formData.phone || "",
                  // For phone: add a custom question to your Calendly event type.
                  // If it's the FIRST question, pass a1. If second, use a2, etc.
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
                  className="px-10 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
                >
                  Back to details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
