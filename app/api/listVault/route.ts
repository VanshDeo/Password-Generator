import connectDB from "../lib/db";
import VaultItem from "../models/VaultItems";

export default async function POST(req: Request){
  await connectDB();
  const { userId } = await req.json();
  try{
  const items = await VaultItem.find({ userId });
  return Response.json({ items });
  } catch (error) {
    return Response.json({ error: "Server error" });
  }
}
