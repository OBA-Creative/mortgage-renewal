"use client";

import { create } from "zustand";

export const useMortgageStore = create((set) => ({
  formData: {
    propertyUsage: "",
    downpaymentValue: null, // Changed to number
    heloc: "",
    helocBalance: null, // Changed to number
    city: "",
    province: "",
    propertyValue: null, // Changed to number
    belowOneMillion: "",
    mortgageBalance: null, // Changed to number
    borrowAdditionalFunds: "",
    borrowAdditionalAmount: null, // Changed to number
    amortizationPeriod: null, // Changed to number
    lender: "",
    otherLender: "",
    maturityDate: "",
    name: "",
    phone: "",
    email: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () =>
    set({
      formData: {
        propertyUsage: "",
        downpaymentValue: null,
        heloc: "",
        helocBalance: null,
        city: "",
        province: "",
        propertyValue: null,
        belowOneMillion: "",
        mortgageBalance: null,
        borrowAdditionalFunds: "",
        borrowAdditionalAmount: null,
        amortizationPeriod: null,
        lender: "",
        otherLender: "",
        maturityDate: "",
        name: "",
        phone: "",
        email: "",
      },
    }),
}));
