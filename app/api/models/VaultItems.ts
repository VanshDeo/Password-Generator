import mongoose from "mongoose";
const vaultItemSchema = new mongoose.Schema({
  userId: String,
  title: String,
  username: String,
  password: String, // encrypted
  url: String,
  notes: String, // encrypted
});
export default mongoose.models.VaultItem || mongoose.model("VaultItem", vaultItemSchema);
