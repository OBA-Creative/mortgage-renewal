import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// HTML email generator function
function generateEmailHTML({
  firstName,
  lastName,
  email,
  phone,
  mortgageData,
  selectedRate,
}) {
  const fullName = `${firstName} ${lastName}`.trim();

  // Helper functions
  const formatCurrency = (value) => {
    if (!value) return "Not specified";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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

  const sectionStyle = `
    background-color: white;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Your Mortgage Inquiry</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background-color: #2563eb; color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 26px;">Hi Z!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have received a new mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"} inquiry</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; margin-bottom: 25px;">
            We've received the following detailed mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"} information from a potential client.
          </p>
          
          ${
            mortgageData.path
              ? `
          <!-- Client Interest Type -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">🎯 Client Interest</h3>
            <div style="background-color: ${mortgageData.path === "refinance" ? "#fef3c7" : "#d1fae5"}; padding: 15px; border-radius: 6px; border-left: 4px solid ${mortgageData.path === "refinance" ? "#f59e0b" : "#10b981"};">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${mortgageData.path === "refinance" ? "#92400e" : "#065f46"};">
                ${mortgageData.path === "refinance" ? "🏠 REFINANCE INQUIRY" : "🔄 RENEWAL INQUIRY"}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                ${mortgageData.path === "refinance" ? "Client is looking to refinance their existing mortgage, potentially to access equity or get better terms." : "Client is looking to renew their existing mortgage term with competitive rates and terms."}
              </p>
            </div>
          </div>
          `
              : ""
          }

          <!-- Contact Information -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">📞 Contact Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || "Not provided"}</p>
          </div>

          ${
            selectedRate
              ? `
          <!-- Selected Rate Information -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">💳 Rate of Interest</h3>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Selected Term:</strong> ${selectedRate.term}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Interest Rate:</strong> ${selectedRate.percentage}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Monthly Payment:</strong> ${selectedRate.monthlyPayment}</p>
              ${selectedRate.lender ? `<p style="margin: 5px 0; font-size: 16px;"><strong>Lender:</strong> ${selectedRate.lender}</p>` : ""}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280; font-style: italic;">This rate was of particular interest during their inquiry.</p>
          </div>
          `
              : ""
          }

          ${
            mortgageData.propertyUsage ||
            mortgageData.city ||
            mortgageData.province ||
            mortgageData.propertyValue
              ? `
          <!-- Property Information -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">🏠 Property Information</h3>
            ${mortgageData.propertyUsage ? `<p style="margin: 5px 0;"><strong>Property Usage:</strong> ${capitalize(mortgageData.propertyUsage)}</p>` : ""}
            ${mortgageData.city || mortgageData.province ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${[mortgageData.city, mortgageData.province].filter(Boolean).join(", ")}</p>` : ""}
            ${mortgageData.propertyValue ? `<p style="margin: 5px 0;"><strong>Property Value:</strong> ${formatCurrency(mortgageData.propertyValue)}</p>` : ""}
            ${mortgageData.downpaymentValue ? `<p style="margin: 5px 0;"><strong>Down Payment:</strong> ${formatCurrency(mortgageData.downpaymentValue)}</p>` : ""}
          </div>
          `
              : ""
          }

          ${
            mortgageData.mortgageBalance ||
            mortgageData.lender ||
            mortgageData.maturityDate ||
            mortgageData.amortizationPeriod
              ? `
          <!-- Current Mortgage Information -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">💰 Current Mortgage Details</h3>
            ${mortgageData.mortgageBalance ? `<p style="margin: 5px 0;"><strong>Current Balance:</strong> ${formatCurrency(mortgageData.mortgageBalance)}</p>` : ""}
            ${mortgageData.lender ? `<p style="margin: 5px 0;"><strong>Current Lender:</strong> ${mortgageData.lender}</p>` : ""}
            ${mortgageData.otherLender ? `<p style="margin: 5px 0;"><strong>Other Lender:</strong> ${mortgageData.otherLender}</p>` : ""}
            ${mortgageData.maturityDate ? `<p style="margin: 5px 0;"><strong>Maturity Date:</strong> ${formatDate(mortgageData.maturityDate)}</p>` : ""}
            ${mortgageData.amortizationPeriod ? `<p style="margin: 5px 0;"><strong>Amortization:</strong> ${mortgageData.amortizationPeriod} years</p>` : ""}
          </div>
          `
              : ""
          }

          ${
            mortgageData.heloc || mortgageData.helocBalance
              ? `
          <!-- HELOC Information -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">🏦 HELOC Information</h3>
            ${mortgageData.heloc ? `<p style="margin: 5px 0;"><strong>Has HELOC:</strong> ${capitalize(mortgageData.heloc)}</p>` : ""}
            ${mortgageData.helocBalance ? `<p style="margin: 5px 0;"><strong>HELOC Balance:</strong> ${formatCurrency(mortgageData.helocBalance)}</p>` : ""}
          </div>
          `
              : ""
          }

          ${
            mortgageData.borrowAdditionalFunds ||
            mortgageData.borrowAdditionalAmount
              ? `
          <!-- Additional Funds -->
          <div style="${sectionStyle}">
            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px;">📈 Additional Funding</h3>
            ${mortgageData.borrowAdditionalFunds ? `<p style="margin: 5px 0;"><strong>Additional Funds:</strong> ${capitalize(mortgageData.borrowAdditionalFunds)}</p>` : ""}
            ${mortgageData.borrowAdditionalAmount ? `<p style="margin: 5px 0;"><strong>Amount Needed:</strong> ${formatCurrency(mortgageData.borrowAdditionalAmount)}</p>` : ""}
          </div>
          `
              : ""
          }

          <!-- Next Steps -->
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 25px 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e40af; font-size: 16px;">🚀 Next Steps:</p>
            <ul style="margin: 15px 0 0 0; padding-left: 20px;">
              <li>A mortgage specialist will contact you within 24 hours</li>
              <li>We'll review your current mortgage details and property information</li>
              ${
                mortgageData.path === "refinance"
                  ? "<li>Explore refinancing options to access equity or improve terms</li><li>Calculate potential savings and available equity</li>"
                  : "<li>Receive personalized renewal options with competitive rates</li><li>Compare renewal terms from multiple lenders</li>"
              }
              <li>Get expert advice on optimizing your mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"}</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
            If you have any urgent questions or need to update any information, feel free to reply to this email or call us directly. We're here to help make your mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"} as smooth as possible.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">

          <div style="text-align: center;">
            <p style="margin-bottom: 5px; font-size: 16px;"><strong>Best regards,</strong></p>
            <p style="margin: 0; color: #2563eb; font-weight: bold; font-size: 16px;">The Mortgage ${mortgageData.path === "refinance" ? "Refinance" : "Renewals"} Team</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Your trusted mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"} specialists</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, mortgageData, selectedRate } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Split name into first and last name for the template
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Generate HTML email content
    const emailHtml = generateEmailHTML({
      firstName,
      lastName,
      email,
      phone,
      mortgageData: mortgageData || {},
      selectedRate: selectedRate || null,
    });

    // Send confirmation email to user
    // NOTE: In testing mode, Resend only allows sending to verified email address
    // For production, set up a verified domain at resend.com/domains
    const isTestMode =
      process.env.NODE_ENV === "development" || !process.env.RESEND_DOMAIN;
    const recipientEmail = isTestMode ? "uros@obacreative.ca" : email;

    const { data: userData, error: userError } = await resend.emails.send({
      from: "Mortgage Renewals <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Thank you for your mortgage ${mortgageData.path === "refinance" ? "refinance" : "renewal"} inquiry ${isTestMode ? `(Test - for: ${email})` : ""}`,
      html: emailHtml,
    });

    if (userError) {
      console.error("Resend API error (user email):", userError);
      return NextResponse.json(userError, { status: 400 });
    }

    // Send notification email to business (optional - only if BUSINESS_EMAIL is set)
    let businessData = null;
    const businessEmail = process.env.BUSINESS_EMAIL || "uros@obacreative.ca";

    if (businessEmail) {
      try {
        const fullName = `${firstName} ${lastName}`.trim();
        const businessRecipient = isTestMode
          ? "uros@obacreative.ca"
          : businessEmail;

        const { data: bizData, error: bizError } = await resend.emails.send({
          from: "Mortgage Renewals <onboarding@resend.dev>",
          to: [businessRecipient],
          subject: `New Mortgage ${mortgageData.path === "refinance" ? "Refinance" : "Renewal"} Inquiry from ${fullName} ${isTestMode ? `(Test - original: ${email})` : ""}`,
          html: emailHtml,
        });

        if (bizError) {
          console.error("Business notification email failed:", bizError);
          // Don't fail the whole request if business email fails
        } else {
          businessData = bizData;
          console.log("Business notification sent successfully");
        }
      } catch (bizError) {
        console.error("Business email error:", bizError);
        // Continue even if business email fails
      }
    }

    console.log("User email sent successfully:", userData);
    return NextResponse.json({
      success: true,
      userEmail: userData,
      businessEmail: businessData,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
