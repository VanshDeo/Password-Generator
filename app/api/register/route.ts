import bcrypt from "bcryptjs";
import connectDB from "../lib/db";
import User from "../models/PassUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
