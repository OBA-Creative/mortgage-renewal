import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/userModel";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const { ids, isHighlighted } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user IDs provided" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    await User.updateMany({ _id: { $in: ids } }, { $set: { isHighlighted } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update users" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "No user IDs provided" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    await User.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete users" },
      { status: 500 },
    );
  }
}
