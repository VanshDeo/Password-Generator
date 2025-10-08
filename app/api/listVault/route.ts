export const runtime = "nodejs";

import connectDB from "../lib/db";
import VaultItem from "../models/VaultItems";
import { NextResponse } from "next/server";

export async function POST(req: Request){
  await connectDB();
  const { userId } = await req.json();
  try{
  const items = await VaultItem.find({ userId });
  return NextResponse.json({ items });
  } catch (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json({ error: errorMessage });
  }
}
