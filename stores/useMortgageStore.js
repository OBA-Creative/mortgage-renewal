"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const emptyForm = () => ({
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
});

export const useMortgageStore = create(
  persist(
    (set, get) => ({
      formData: emptyForm(),
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetForm: () => set({ formData: emptyForm() }),

      // optional: track last update (handy for TTL or debugging)
      updatedAt: null,
      touch: () => set({ updatedAt: Date.now() }),
    }),
    {
      name: "mortgage-form-v2", // storage key
      version: 1,
      // only persist what you need
      partialize: (state) => ({
        formData: state.formData,
        updatedAt: state.updatedAt,
      }),
      // localStorage persists across browser restarts; swap to sessionStorage if you prefer
      storage: createJSONStorage(() => localStorage),
      // migrate: (persistedState, version) => persistedState, // add if you change shapes later
    }
  )
);
