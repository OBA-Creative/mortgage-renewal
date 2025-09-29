// NOTE: This React email template is currently not in use
// Email generation has been moved to HTML format in /api/send/route.js
// to avoid React Email render dependencies. This file is kept as a backup.

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";

export default function UserSubmitEmail({
  firstName,
  lastName,
  email,
  phone,
  mortgageData = {},
}) {
  const fullName = `${firstName} ${lastName}`.trim();

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value) return "Not specified";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return "Not specified";
    return (
      str.charAt(0).toUpperCase() +
      str
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .trim()
    );
  };

  const sectionStyle = {
    backgroundColor: "white",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  };

  const labelStyle = {
    fontWeight: "bold",
    color: "#374151",
    display: "inline-block",
    width: "180px",
  };

  const valueStyle = {
    color: "#1f2937",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        color: "#333",
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          padding: "25px",
          borderRadius: "8px 8px 0 0",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: "0", fontSize: "26px" }}>Hi Z!</h1>
        <p style={{ margin: "10px 0 0 0", opacity: "0.9" }}>
          You have received a new mortgage renewal inquiry
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "30px",
          borderRadius: "0 0 8px 8px",
          border: "1px solid #e2e8f0",
          borderTop: "none",
        }}
      >
        <p style={{ fontSize: "16px", marginBottom: "25px" }}>
          We&apos;ve received following detailed mortgage information.
        </p>

        {/* Contact Information */}
        <div style={sectionStyle}>
          <h3
            style={{ margin: "0 0 15px 0", color: "#1e293b", fontSize: "18px" }}
          >
            📞 Contact Information
          </h3>
          <p style={{ margin: "5px 0" }}>
            <span style={labelStyle}>Name:</span>
            <span style={valueStyle}>{fullName}</span>
          </p>
          <p style={{ margin: "5px 0" }}>
            <span style={labelStyle}>Email:</span>
            <span style={valueStyle}>{email}</span>
          </p>
          <p style={{ margin: "5px 0" }}>
            <span style={labelStyle}>Phone:</span>
            <span style={valueStyle}>{phone || "Not provided"}</span>
          </p>
        </div>

        {/* Property Information */}
        {(mortgageData.propertyUsage ||
          mortgageData.city ||
          mortgageData.province ||
          mortgageData.propertyValue) && (
          <div style={sectionStyle}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#1e293b",
                fontSize: "18px",
              }}
            >
              🏠 Property Information
            </h3>
            {mortgageData.propertyUsage && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Property Usage:</span>
                <span style={valueStyle}>
                  {capitalize(mortgageData.propertyUsage)}
                </span>
              </p>
            )}
            {(mortgageData.city || mortgageData.province) && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Location:</span>
                <span style={valueStyle}>
                  {[mortgageData.city, mortgageData.province]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}
            {mortgageData.propertyValue && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Property Value:</span>
                <span style={valueStyle}>
                  {formatCurrency(mortgageData.propertyValue)}
                </span>
              </p>
            )}
            {mortgageData.downpaymentValue && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Down Payment:</span>
                <span style={valueStyle}>
                  {formatCurrency(mortgageData.downpaymentValue)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Current Mortgage Information */}
        {(mortgageData.mortgageBalance ||
          mortgageData.lender ||
          mortgageData.maturityDate ||
          mortgageData.amortizationPeriod) && (
          <div style={sectionStyle}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#1e293b",
                fontSize: "18px",
              }}
            >
              💰 Current Mortgage Details
            </h3>
            {mortgageData.mortgageBalance && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Current Balance:</span>
                <span style={valueStyle}>
                  {formatCurrency(mortgageData.mortgageBalance)}
                </span>
              </p>
            )}
            {mortgageData.lender && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Current Lender:</span>
                <span style={valueStyle}>{mortgageData.lender}</span>
              </p>
            )}
            {mortgageData.otherLender && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Other Lender:</span>
                <span style={valueStyle}>{mortgageData.otherLender}</span>
              </p>
            )}
            {mortgageData.maturityDate && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Maturity Date:</span>
                <span style={valueStyle}>
                  {formatDate(mortgageData.maturityDate)}
                </span>
              </p>
            )}
            {mortgageData.amortizationPeriod && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Amortization:</span>
                <span style={valueStyle}>
                  {mortgageData.amortizationPeriod} years
                </span>
              </p>
            )}
          </div>
        )}

        {/* HELOC Information */}
        {(mortgageData.heloc || mortgageData.helocBalance) && (
          <div style={sectionStyle}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#1e293b",
                fontSize: "18px",
              }}
            >
              🏦 HELOC Information
            </h3>
            {mortgageData.heloc && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Has HELOC:</span>
                <span style={valueStyle}>{capitalize(mortgageData.heloc)}</span>
              </p>
            )}
            {mortgageData.helocBalance && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>HELOC Balance:</span>
                <span style={valueStyle}>
                  {formatCurrency(mortgageData.helocBalance)}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Additional Funds */}
        {(mortgageData.borrowAdditionalFunds ||
          mortgageData.borrowAdditionalAmount) && (
          <div style={sectionStyle}>
            <h3
              style={{
                margin: "0 0 15px 0",
                color: "#1e293b",
                fontSize: "18px",
              }}
            >
              📈 Additional Funding
            </h3>
            {mortgageData.borrowAdditionalFunds && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Additional Funds:</span>
                <span style={valueStyle}>
                  {capitalize(mortgageData.borrowAdditionalFunds)}
                </span>
              </p>
            )}
            {mortgageData.borrowAdditionalAmount && (
              <p style={{ margin: "5px 0" }}>
                <span style={labelStyle}>Amount Needed:</span>
                <span style={valueStyle}>
                  {formatCurrency(mortgageData.borrowAdditionalAmount)}
                </span>
              </p>
            )}
          </div>
        )}

        <div
          style={{
            backgroundColor: "#dbeafe",
            padding: "20px",
            borderRadius: "6px",
            marginTop: "25px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              margin: "0",
              fontWeight: "bold",
              color: "#1e40af",
              fontSize: "16px",
            }}
          >
            🚀 Next Steps:
          </p>
          <ul style={{ margin: "15px 0 0 0", paddingLeft: "20px" }}>
            <li>A mortgage specialist will contact you within 24 hours</li>
            <li>
              We&apos;ll review your current mortgage details and property
              information
            </li>
            <li>Receive personalized renewal options with competitive rates</li>
            <li>Get expert advice on optimizing your mortgage terms</li>
          </ul>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
          If you have any urgent questions or need to update any information,
          feel free to reply to this email or call us directly. We&apos;re here
          to help make your mortgage renewal as smooth as possible.
        </p>

        <hr
          style={{
            margin: "30px 0",
            border: "none",
            borderTop: "1px solid #e2e8f0",
          }}
        />

        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "5px", fontSize: "16px" }}>
            <strong>Best regards,</strong>
          </p>
          <p
            style={{
              margin: "0",
              color: "#2563eb",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            The Mortgage Renewals Team
          </p>
          <p
            style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#6b7280" }}
          >
            Your trusted mortgage renewal specialists
          </p>
        </div>
      </div>
    </div>
  );
}
