import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Lender from "@/models/lenderModel";

export async function GET() {
  try {
    await connectToDatabase();

    const lenders = await Lender.find({ isActive: true })
      .sort({ displayOrder: 1, lenderName: 1 })
      .select("lenderName")
      .lean();

    const lenderNames = lenders.map((l) => l.lenderName);

    // Always include "Other" as the last option
    if (!lenderNames.includes("Other")) {
      lenderNames.push("Other");
    }

    return NextResponse.json(
      { success: true, lenders: lenderNames },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching lenders:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
