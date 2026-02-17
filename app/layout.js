import "./globals.css";

export const metadata = {
  title: {
    default: "Mortgage Renewal & Refinance Rates | Compare Today's Best Rates",
    template: "%s | Mortgage Renewals",
  },
  description:
    "Compare the best mortgage renewal and refinance rates across Canada. Lock in today's lowest rates and save thousands on your mortgage. Free, no-obligation rate comparison.",
  keywords: [
    "mortgage renewal",
    "mortgage refinance",
    "best mortgage rates",
    "mortgage rates Canada",
    "refinance mortgage",
    "compare mortgage rates",
    "low mortgage rates",
    "mortgage rate lock",
  ],
  openGraph: {
    title: "Compare Today's Best Mortgage Renewal & Refinance Rates",
    description:
      "Lock in the lowest mortgage rates in Canada. Compare renewal and refinance options — free, no-obligation rate comparison.",
    type: "website",
    locale: "en_CA",
    siteName: "Mortgage Renewals",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Today's Best Mortgage Renewal & Refinance Rates",
    description:
      "Lock in the lowest mortgage rates in Canada. Compare renewal and refinance options — free, no-obligation rate comparison.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
