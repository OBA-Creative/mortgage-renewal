import ResultsWrapper from "@/components/layout/results-wrapper";

export const metadata = {
  title: "Your Personalized Mortgage Rates",
  description:
    "View the best mortgage renewal and refinance rates customized to your profile. Lock in today's rate and protect against future increases for 120 days.",
};

export default function RenewLayout({ children }) {
  return <ResultsWrapper>{children}</ResultsWrapper>;
}
