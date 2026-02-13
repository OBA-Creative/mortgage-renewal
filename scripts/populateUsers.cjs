const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const userSchema = new mongoose.Schema(
  {
    path: { type: String, enum: ["renew", "refinance", ""], default: "" },
    propertyUsage: { type: String, default: "" },
    downpaymentValue: { type: String, default: "" },
    heloc: { type: String, default: "" },
    helocBalance: { type: Number, default: null },
    city: { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "" },
    propertyValue: { type: Number, default: null },
    belowOneMillion: { type: String, default: "" },
    mortgageBalance: { type: Number, default: null },
    borrowAdditionalFunds: { type: String, default: "" },
    borrowAdditionalAmount: { type: Number, default: null },
    amortizationPeriod: { type: Number, default: null },
    lender: { type: String, trim: true, default: "" },
    otherLender: { type: String, trim: true, default: "" },
    maturityDate: { type: String, default: "" },
    name: { type: String, trim: true },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, required: true, lowercase: true },
    selectedRate: {
      term: { type: String, default: "" },
      percentage: { type: Number, default: null },
      monthlyPayment: { type: Number, default: null },
      lender: { type: String, default: "" },
    },
    isHighlighted: { type: Boolean, default: false },
  },
  { collection: "Users", timestamps: true },
);

const User = mongoose.model("User", userSchema);

// ── helpers ──────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) =>
  +(Math.random() * (max - min) + min).toFixed(decimals);

const firstNames = [
  "James",
  "Mary",
  "Robert",
  "Patricia",
  "John",
  "Jennifer",
  "Michael",
  "Linda",
  "David",
  "Elizabeth",
  "William",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Christopher",
  "Karen",
  "Daniel",
  "Lisa",
  "Matthew",
  "Nancy",
  "Anthony",
  "Betty",
  "Mark",
  "Margaret",
  "Donald",
  "Sandra",
  "Steven",
  "Ashley",
  "Andrew",
  "Dorothy",
  "Paul",
  "Kimberly",
  "Joshua",
  "Emily",
  "Kenneth",
  "Donna",
  "Kevin",
  "Michelle",
  "Brian",
  "Carol",
  "George",
  "Amanda",
  "Timothy",
  "Melissa",
  "Ronald",
  "Deborah",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
];

const cities = [
  { city: "Vancouver", province: "BC" },
  { city: "Victoria", province: "BC" },
  { city: "Surrey", province: "BC" },
  { city: "Burnaby", province: "BC" },
  { city: "Toronto", province: "ON" },
  { city: "Ottawa", province: "ON" },
  { city: "Mississauga", province: "ON" },
  { city: "Hamilton", province: "ON" },
  { city: "Calgary", province: "AB" },
  { city: "Edmonton", province: "AB" },
  { city: "Montreal", province: "QC" },
  { city: "Quebec City", province: "QC" },
  { city: "Halifax", province: "NS" },
  { city: "Winnipeg", province: "MB" },
  { city: "Saskatoon", province: "SK" },
  { city: "Regina", province: "SK" },
  { city: "St. John's", province: "NL" },
  { city: "Fredericton", province: "NB" },
  { city: "Charlottetown", province: "PE" },
];

const lenders = [
  "Royal Bank of Canada (RBC)",
  "Toronto-Dominion Bank (TD)",
  "Scotiabank",
  "Bank of Montreal (BMO)",
  "Canadian Imperial Bank of Commerce (CIBC)",
  "National Bank of Canada",
  "HSBC Canada",
  "First National",
  "MCAP",
  "Equitable Bank",
  "B2B Bank",
];

const usageOptions = [
  "Primary Residence",
  "Second home",
  "Owner-occupied and Rental",
  "Rental / Investment",
];

const downpaymentOptions = ["20% or more", "Less than 20%"];

const rateTerms = [
  "3-Year Fixed",
  "4-Year Fixed",
  "5-Year Fixed",
  "3-Year Variable",
  "5-Year Variable",
];

const rateLenders = [
  "Best Rate",
  "TD Bank",
  "RBC",
  "BMO",
  "Scotiabank",
  "CIBC",
  "First National",
  "MCAP",
];

function generateUser(index) {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  const areaCode = pick([
    "604",
    "778",
    "416",
    "647",
    "403",
    "587",
    "514",
    "613",
    "902",
  ]);
  const phone = `+1 (${areaCode}) ${randInt(100, 999)} ${randInt(1000, 9999)}`;

  const location = pick(cities);
  const path = pick(["renew", "refinance"]);
  const propertyValue = randInt(3, 25) * 100000; // 300k – 2.5M
  const mortgageBalance = Math.round(propertyValue * randFloat(0.3, 0.8, 2));
  const amortization = pick([15, 20, 25, 30]);

  // Build a maturity date between now and 2 years from now
  const maturityMonth = randInt(1, 12);
  const maturityYear = pick([2026, 2027]);
  const maturityDate = `${maturityYear}-${String(maturityMonth).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`;

  const ratePercentage = randFloat(3.5, 6.5, 2);
  const monthlyPayment = Math.round(
    (mortgageBalance * (ratePercentage / 100 / 12)) /
      (1 - Math.pow(1 + ratePercentage / 100 / 12, -(amortization * 12))),
  );

  // Spread createdAt across the last 90 days for variety
  const daysAgo = randInt(0, 90);
  const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    path,
    propertyUsage: pick(usageOptions),
    downpaymentValue: pick(downpaymentOptions),
    heloc: pick(["yes", "no"]),
    helocBalance: Math.random() > 0.6 ? randInt(1, 10) * 10000 : null,
    city: `${location.city}, ${location.province}`,
    province: location.province,
    propertyValue,
    belowOneMillion: propertyValue < 1000000 ? "yes" : "no",
    mortgageBalance,
    borrowAdditionalFunds: pick(["yes", "no"]),
    borrowAdditionalAmount: Math.random() > 0.7 ? randInt(1, 10) * 10000 : null,
    amortizationPeriod: amortization,
    lender: pick(lenders),
    otherLender: "",
    maturityDate,
    firstName,
    lastName,
    phone,
    email,
    selectedRate: {
      term: pick(rateTerms),
      percentage: ratePercentage,
      monthlyPayment,
      lender: pick(rateLenders),
    },
    isHighlighted: false,
    createdAt,
    updatedAt: createdAt,
  };
}

// ── main ─────────────────────────────────────────────────
async function main() {
  const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.newjce6.mongodb.net/MortgageRenewals?retryWrites=true&w=majority&appName=Cluster0`;

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  console.log("Cleared existing users");

  const users = Array.from({ length: 50 }, (_, i) => generateUser(i + 1));

  const result = await User.insertMany(users);
  console.log(
    `Successfully inserted ${result.length} users into the Users collection`,
  );

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
