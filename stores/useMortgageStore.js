"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const emptyForm = () => ({
  path: "", // "renew" or "refinance"
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
      setPath: (path) =>
        set((state) => ({
          formData: { ...state.formData, path },
        })),
      resetForm: () => set({ formData: emptyForm() }),

      // Lender management
      lenders: {
        all: [], // All active lenders
        rental: [], // Lenders supporting rental properties
        loading: false,
        error: null,
        lastFetched: null,
      },

      // Fetch lenders from API
      fetchLenders: async () => {
        const currentState = get();

        // Check if we have recent data (cache for 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        if (
          currentState.lenders.lastFetched &&
          currentState.lenders.lastFetched > fiveMinutesAgo &&
          currentState.lenders.all.length > 0
        ) {
          console.log("Using cached lender data");
          return;
        }

        set((state) => ({
          lenders: { ...state.lenders, loading: true, error: null },
        }));

        try {
          // Fetch all active lenders
          const response = await fetch("/api/admin/lenders?activeOnly=true");
          const data = await response.json();

          if (data.success) {
            // Extract lender names and separate rental-supporting lenders
            const allLenders = data.lenders.map((lender) => lender.lenderName);
            const rentalLenders = data.lenders
              .filter((lender) => lender.supportsRental)
              .map((lender) => lender.lenderName);

            set((state) => ({
              lenders: {
                ...state.lenders,
                all: allLenders,
                rental: rentalLenders,
                loading: false,
                lastFetched: Date.now(),
              },
            }));

            console.log(
              `Fetched ${allLenders.length} lenders (${rentalLenders.length} support rentals)`
            );
          } else {
            throw new Error(data.message || "Failed to fetch lenders");
          }
        } catch (error) {
          console.error("Error fetching lenders:", error);

          // Fallback to hardcoded lenders
          const fallbackLenders = [
            "TD Bank",
            "RBC",
            "BMO",
            "Scotiabank",
            "CIBC",
            "National Bank",
            "Credit Union",
            "Alternative Lender",
            "First National",
            "MCAP",
            "Dominion Lending",
          ];
          const fallbackRentalLenders = [
            ...fallbackLenders,
            "B2B Bank",
            "CMLS",
            "Equitable Bank",
          ];

          set((state) => ({
            lenders: {
              ...state.lenders,
              all: fallbackLenders,
              rental: fallbackRentalLenders,
              loading: false,
              error: error.message,
              lastFetched: Date.now(),
            },
          }));
        }
      },

      // Get lenders based on rental property context
      getLenders: (isRental = false) => {
        const state = get();
        return isRental ? state.lenders.rental : state.lenders.all;
      },

      // Clear lender cache (useful for admin updates)
      clearLenderCache: () => {
        set((state) => ({
          lenders: {
            ...state.lenders,
            lastFetched: null,
          },
        }));
      },

      // optional: track last update (handy for TTL or debugging)
      updatedAt: null,
      touch: () => set({ updatedAt: Date.now() }),
    }),
    {
      name: "mortgage-form-v3", // Updated version for new lender fields
      version: 2,
      // only persist what you need (exclude loading states)
      partialize: (state) => ({
        formData: state.formData,
        updatedAt: state.updatedAt,
        lenders: {
          all: state.lenders.all,
          rental: state.lenders.rental,
          lastFetched: state.lenders.lastFetched,
        },
      }),
      // localStorage persists across browser restarts; swap to sessionStorage if you prefer
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Initialize lender data for existing users
          return {
            ...persistedState,
            lenders: {
              all: [],
              rental: [],
              loading: false,
              error: null,
              lastFetched: null,
            },
          };
        }
        return persistedState;
      },
    }
  )
);
