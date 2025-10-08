"use client";

import { useEffect, useState } from "react";

interface VaultItem {
  _id?: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  userId?: string;
}

interface User {
  userId: string;
  email: string;
}

interface Options {
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
}

// 🔒 Web Crypto API Helpers
async function encrypt(text: string, key: string | undefined): Promise<string> {
  if (!key) throw new Error("Encryption key is undefined.");
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const alg = { name: "AES-GCM", iv };
  const normKey = key.toString().padEnd(32, "x").slice(0, 32);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(normKey),
    "AES-GCM",
    false,
    ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt(alg, keyMaterial, enc.encode(text));
  const buffer = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  return btoa(String.fromCharCode(...buffer));
}

async function decrypt(cipher: string, key: string | undefined): Promise<string> {
  if (!key) throw new Error("Decryption key is undefined.");
  const data = Uint8Array.from(atob(cipher), (c) => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encData = data.slice(12);
  const alg = { name: "AES-GCM", iv };
  const dec = new TextDecoder();
  const normKey = key.toString().padEnd(32, "x").slice(0, 32);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normKey),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(alg, keyMaterial, encData);
  return dec.decode(decrypted);
}


export default function Vault() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [form, setForm] = useState<VaultItem>({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });
  const [options] = useState<Options>({
  lower: true,
  upper: true,
  numbers: true,
  symbols: true,
});
  const [length, setLength] = useState<number>(12);

  // 🔹 Load user & vault
useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) {
    window.location.href = "/";
    return;
  }
  setUser(JSON.parse(stored));
  fetchVault(JSON.parse(stored).userId);
}, []);


  // 🔹 Fetch vault items
  const fetchVault = async (userId: string) => {
    try {
      const res = await fetch("/api/listVault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // 🔹 Generate secure password
  const generatePassword = () => {
    const chars = {
      lower: "abcdefghijkmnopqrstuvwxyz",
      upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
      numbers: "23456789",
      symbols: "!@#$%^&*()_+=-[]{}<>?",
    };
    let pool = "";
    Object.keys(options).forEach((k) => {
      if (options[k as keyof Options]) pool += chars[k as keyof Options];
    });
    const pass = Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => pool[x % pool.length])
      .join("");
    setForm((prev) => ({ ...prev, password: pass }));
  };

  // 🔹 Save encrypted vault item
  const saveItem = async () => {
    if (!user) return;
    const passwordEnc = await encrypt(form.password, user.email);
    const notesEnc = await encrypt(form.notes, user.email);

    const encrypted: VaultItem = {
      ...form,
      userId: user.userId,
      password: passwordEnc,
      notes: notesEnc,
    };

    await fetch("/api/addVault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encrypted),
    });

    fetchVault(user.userId);
  };

  // 🔹 Copy password to clipboard (auto-clear)
  const copyToClipboard = async (cipher: string) => {
    if (!user) return;
    const text = await decrypt(cipher, user.email);
    navigator.clipboard.writeText(text);
    setTimeout(() => navigator.clipboard.writeText(""), 5000);
  };

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Welcome, {user?.email}</h2>

      {/* Password Generator */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2">Generate Password</h3>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={6}
            max={30}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <span>{length}</span>
          <button
            onClick={generatePassword}
            className="bg-green-500 px-3 py-1 text-white rounded"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Add Vault Item */}
      <div className="border p-4 rounded grid gap-2">
        <input
          placeholder="Title"
          className="border p-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Username"
          className="border p-2"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="Password"
          className="border p-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          placeholder="URL"
          className="border p-2"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          className="border p-2"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button
          onClick={saveItem}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Save
        </button>
      </div>

      {/* Search + Vault List */}
      <input
        placeholder="Search..."
        className="border p-2 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-3">
        {filtered.map((i) => (
          <div
            key={i._id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{i.title}</h4>
              <p>{i.username}</p>
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                {i.url}
              </a>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(i.password)}
                className="bg-gray-300 px-2 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
