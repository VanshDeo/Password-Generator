"use client";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async () => {
    const res = await fetch(`/api/${isLogin ? "login" : "register"}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
  const errorData = await res.json(); // make sure server sends JSON even on error
  throw new Error(errorData.error || "Unknown error");
}
    console.log(res.status, res.headers.get("content-type"));

    const text = await res.text();  // temporarily parse as text
    console.log("Response body:", text);
    // if (data.userId) localStorage.setItem("user", JSON.stringify(data));
    // if (data.userId) window.location.href = "/vault";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h1 className="text-2xl font-bold">Password Vault</h1>
      <input className="border p-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2" type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
        {isLogin ? "Login" : "Register"}
      </button>
      <button onClick={() => setIsLogin(!isLogin)} className="text-sm underline">
        {isLogin ? "Need an account?" : "Already have an account?"}
      </button>
    </div>
  );
}
