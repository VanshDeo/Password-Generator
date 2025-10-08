export const runtime = "nodejs";

import connectDB from "../lib/db";
import VaultItem from "../models/VaultItems";
import { NextResponse } from "next/server";

export async function POST(req: Request){

  await connectDB();
  const { userId, title, username, password, url, notes } = await req.json();
  try{
  const item = await VaultItem.create({ userId, title, username, password, url, notes });
  return NextResponse.json({success:"true", item}, { status: 201 });
  } catch (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error);
    return NextResponse.json({ error: errorMessage });
  }
}
