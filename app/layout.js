import "./globals.css";

export const metadata = {
  title: "Mortgage Renewals",
  description: "Mortgage renewal questionnaire and rate comparison",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/uzv7jan.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
