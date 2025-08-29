"use client";

import { create } from "zustand";

export const useMortgageStore = create((set) => ({
  formData: {
    propertyUsage: "",
    downpaymentValue: "",
    heloc: "",
    helocBalance: "",
    city: "",
    province: "",
    propertyValue: "",
    belowOneMillion: "",
    mortgageBalance: "",
    borrowAdditionalFunds: "",
    borrowAdditionalAmount: "",
    amortizationPeriod: null,
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
        downpaymentValue: "",
        heloc: "",
        helocBalance: "",
        city: "",
        province: "",
        propertyValue: "",
        belowOneMillion: "",
        mortgageBalance: "",
        borrowAdditionalFunds: "",
        borrowAdditionalAmount: "",
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
