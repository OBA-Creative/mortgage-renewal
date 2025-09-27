import "./globals.css";

export const metadata = {
  title: "Mortgage Renewals",
  description: "Mortgage renewal questionnaire and rate comparison",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
