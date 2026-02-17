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
  firstName: "",
  lastName: "",
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
        all: [], // All active lender objects
        rental: [], // Lender objects supporting rental properties
        allNames: [], // All active lender names (for backward compatibility)
        rentalNames: [], // Lender names supporting rental properties (for backward compatibility)
        loading: false,
        error: null,
        lastFetched: null,
      },

      // Fetch lenders from API
      fetchLenders: async (forceRefresh = false) => {
        const currentState = get();

        if (!forceRefresh) {
          // Check if we have recent data (cache for 5 minutes)
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          const hasRecentData =
            currentState.lenders.lastFetched &&
            currentState.lenders.lastFetched > fiveMinutesAgo;
          const hasExistingData = currentState.lenders.all.length > 0;

          if (hasRecentData && hasExistingData) {
            return;
          }
        } else {
          // Force refresh requested, bypassing cache
        }

        set((state) => ({
          lenders: { ...state.lenders, loading: true, error: null },
        }));

        try {
          // Fetch all active lenders
          const response = await fetch("/api/admin/lenders?activeOnly=true");
          const data = await response.json();

          if (data.success) {
            // Store full lender objects and extract names for backward compatibility
            const allLenders = data.lenders;
            // All lenders are available for both regular and rental properties
            const allLenderNames = data.lenders.map(
              (lender) => lender.lenderName,
            );

            set((state) => ({
              lenders: {
                ...state.lenders,
                all: allLenders,
                rental: allLenders, // Same as all lenders
                allNames: allLenderNames,
                rentalNames: allLenderNames, // Same as all lender names
                loading: false,
                lastFetched: Date.now(),
              },
            }));
          } else {
            throw new Error(data.message || "Failed to fetch lenders");
          }
        } catch (error) {
          // Fallback to hardcoded lenders
          const fallbackLenderNames = [
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
            "B2B Bank",
            "CMLS",
            "Equitable Bank",
          ];

          set((state) => ({
            lenders: {
              ...state.lenders,
              all: [],
              rental: [],
              allNames: fallbackLenderNames,
              rentalNames: fallbackLenderNames, // Same list for rental
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
        return isRental ? state.lenders.rentalNames : state.lenders.allNames;
      },

      // Get full lender objects based on rental property context
      getLenderObjects: (isRental = false) => {
        const state = get();
        return isRental ? state.lenders.rental : state.lenders.all;
      },

      // Clear lender cache (useful for admin updates)
      clearLenderCache: () => {
        set((state) => ({
          lenders: {
            ...state.lenders,
            all: [],
            rental: [],
            allNames: [],
            rentalNames: [],
            lastFetched: null,
          },
        }));
      },

      // Force clear localStorage lender data
      clearPersistedLenderData: () => {
        const stored = localStorage.getItem("mortgage-form-v3");
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.state && data.state.lenders) {
              delete data.state.lenders;
              localStorage.setItem("mortgage-form-v3", JSON.stringify(data));
            }
          } catch (e) {
            // Silently handle error
          }
        }
      },

      // optional: track last update (handy for TTL or debugging)
      updatedAt: null,
      touch: () => set({ updatedAt: Date.now() }),
    }),
    {
      name: "mortgage-form-v3", // Updated version for new lender fields
      version: 2,
      // only persist what you need (exclude loading states and lender data)
      partialize: (state) => ({
        formData: state.formData,
        updatedAt: state.updatedAt,
        // Exclude lenders from persistence - they should always be fresh from DB
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
              allNames: [],
              rentalNames: [],
              loading: false,
              error: null,
              lastFetched: null,
            },
          };
        }
        return persistedState;
      },
    },
  ),
);
