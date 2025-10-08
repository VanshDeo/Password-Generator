import bcrypt from "bcryptjs";
import connectDB from "../lib/db";
import User from "../models/PassUser";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 400 });
    }

    return Response.json({ userId: user._id, email: user.email, password: user.password }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
