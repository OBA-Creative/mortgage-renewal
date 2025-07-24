// /stores/useMortgageStore.js
import create from "zustand";

export const useMortgageStore = create((set) => ({
  formData: {
    lender: "",
    otherLender: "",
    mortgageBalance: "",
    maturityDate: null,
    name: "",
    email: "",
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () =>
    set({
      formData: {
        lender: "",
        otherLender: "",
        mortgageBalance: "",
        maturityDate: null,
        name: "",
        email: "",
      },
    }),
}));
