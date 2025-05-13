"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../components/firebase";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/classaScreen");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google sign-in logic here
    alert("Google sign-in not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
      <div className="flex w-full max-w-4xl min-h-[600px] rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left: Info Panel */}
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-gradient-to-br from-[#fdf6f0] via-[#f7e9e3] to-[#ffe0f7] px-12">
          <div className="mb-2 text-base text-black font-normal">For everyone.</div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black leading-tight mb-2">
              Manage <span className="relative inline-block">
                <span className="relative z-10">classes</span>
                {/* SVG oval highlight */}
                <svg
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                  width="100%" height="1.2em" viewBox="0 0 120 40"
                >
                  <ellipse cx="60" cy="20" rx="55" ry="16" fill="none" stroke="#a78bfa" strokeWidth="3" />
                </svg>
              </span> as easily<br />
              as sending a message.
            </h1>
          </div>
        </div>
        {/* Right: Login Form */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-8 md:p-16">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">Hey, hello <span className="text-xl">👋</span></h2>
          <div className="text-blue-700 text-sm mb-6">Welcome to Classa Admin. Please sign in to continue.</div>
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="accent-blue-500 rounded"
                />
                Remember me
              </label>
              <a href="#" className="text-blue-500 text-sm hover:underline">Forgot password?</a>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-blue-900 font-semibold py-2 rounded-lg shadow-md hover:from-blue-300 hover:to-purple-300 transition text-lg border border-blue-100"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 