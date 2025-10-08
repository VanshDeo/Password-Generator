import connectDB from "../lib/db";
import VaultItem from "../models/VaultItems";

export default async function POST(req: Request){
  await connectDB();
  const { userId } = await req.json();
  try{
  const items = await VaultItem.find({ userId });
  return Response.json({ items });
  } catch (error) {
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error);
    return Response.json({ error: errorMessage });
  }
}
