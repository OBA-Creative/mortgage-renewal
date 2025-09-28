import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Lender from "@/models/lenderModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters for filtering
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("activeOnly") !== "false"; // Default to true
    const rentalOnly = url.searchParams.get("rental") === "true";
    const category = url.searchParams.get("category");

    // Build query
    let query = {};

    if (activeOnly) {
      query.isActive = true;
    }

    if (rentalOnly) {
      query.supportsRental = true;
    }

    if (category) {
      query.category = category;
    }

    // Fetch lenders sorted by display order first, then by name
    const lenders = await Lender.find(query)
      .sort({ displayOrder: 1, lenderName: 1 })
      .select(
        "lenderName category supportsRental displayOrder description isActive createdAt updatedAt"
      )
      .lean();

    if (!lenders || lenders.length === 0) {
      return NextResponse.json(
        {
          success: true,
          lenders: [],
          message:
            "No lenders found matching the criteria. Run the initialization script to add initial lenders.",
          query,
        },
        { status: 200 }
      );
    }

    console.log(
      `API Debug - Found ${lenders.length} lenders with query:`,
      query
    );

    return NextResponse.json(
      {
        success: true,
        lenders: lenders,
        count: lenders.length,
        query,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lenders:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const {
      lenderName,
      isActive = true,
      category = "other",
      supportsRental = false,
      displayOrder,
      description,
    } = await request.json();

    if (!lenderName || !lenderName.trim()) {
      return NextResponse.json(
        { success: false, message: "Lender name is required" },
        { status: 400 }
      );
    }

    // Check if lender already exists (case-insensitive)
    const existingLender = await Lender.findOne({
      lenderName: { $regex: new RegExp(`^${lenderName.trim()}$`, "i") },
    });

    if (existingLender) {
      return NextResponse.json(
        { success: false, message: "Lender already exists" },
        { status: 409 }
      );
    }

    // If no displayOrder provided, set it to be after the last lender
    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const lastLender = await Lender.findOne().sort({ displayOrder: -1 });
      finalDisplayOrder = lastLender ? lastLender.displayOrder + 1 : 1;
    }

    // Create new lender
    const newLender = new Lender({
      lenderName: lenderName.trim(),
      isActive,
      category,
      supportsRental,
      displayOrder: finalDisplayOrder,
      description: description?.trim() || "",
    });

    await newLender.save();

    return NextResponse.json(
      {
        success: true,
        lender: newLender,
        message: "Lender created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lender:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectToDatabase();

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lender ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Find and update the lender
    const updatedLender = await Lender.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedLender) {
      return NextResponse.json(
        { success: false, message: "Lender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        lender: updatedLender,
        message: `Lender ${
          isActive ? "activated" : "deactivated"
        } successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lender:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lender ID is required" },
        { status: 400 }
      );
    }

    // Find the lender before deleting to get its name for the response
    const lenderToDelete = await Lender.findById(id);

    if (!lenderToDelete) {
      return NextResponse.json(
        { success: false, message: "Lender not found" },
        { status: 404 }
      );
    }

    // Delete the lender
    await Lender.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: `Lender "${lenderToDelete.lenderName}" deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lender:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
