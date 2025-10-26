"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationType, setVerificationType] = useState<"EMAIL" | "SMS">("SMS");
  const [verificationCode, setVerificationCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Attempting login with:", { username, password });
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      console.log("Login response:", res.data);
      // Show verification modal instead of redirecting immediately
      setShowVerification(true);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
  setSendingOtp(true);
  setError("");
  console.log("Sending OTP for:", username);
  try {
    const response = await axios.post("http://localhost:5000/api/auth/send-otp", {
      identifier: username, // can be username OR email
    });
    console.log("OTP response:", response.data);
    setOtpSent(true);
    if (response.data.otp) setGeneratedOtp(response.data.otp); // only for testing
    setExpiredTime(Date.now() + 10 * 60 * 1000);
  } catch (err: any) {
    console.error("Error sending OTP:", err);
    setError(err.response?.data?.message || "Failed to send verification code");
  } finally {
    setSendingOtp(false);
  }
};

  const isOtpExpired = () => {
    if (!expiredTime) return false;
    return Date.now() > expiredTime;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  const handleVerifyCode = async () => {
  if (verificationCode.length !== 6) {
    setError("Please enter a 6-digit code");
    return;
  }

  if (isOtpExpired()) {
    setError("OTP has expired. Please request a new one.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
      identifier: username, // match your backend
      otp: verificationCode,
    });
    console.log("OTP verified:", response.data);

    setOtpVerified(true);
    localStorage.setItem("token", "verified-token");

    console.log("OTP verified, redirecting to /dashboard...");
    router.push("/dashboard");
  } catch (err: any) {
    console.error("OTP verify error:", err.response || err);
    setError(err.response?.data?.message || "Invalid verification code");
  }
 };

  
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ 
        position: "relative",
        // Blue gradient background with sun
        background: "linear-gradient(to bottom, #1e3a8a 0%, #1e3a8a 40%, #3b82f6 40%, #3b82f6 45%, #1e3a8a 45%, #1e3a8a 55%, #60a5fa 55%, #60a5fa 100%)",
        backgroundImage: "radial-gradient(circle at 85% 15%, #60a5fa 0%, #60a5fa 25%, transparent 25%), radial-gradient(circle at 85% 15%, #60a5fa 0%, #60a5fa 35%, transparent 35%)"
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* Login Form */}
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-lg border border-blue-200 shadow-xl w-[420px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-5">
          <h1 className="text-4xl font-bold text-blue-900 tracking-wide mb-1" style={{ letterSpacing: "0.05em" }}>
            AMS 
          </h1>
          <p className="text-sm text-gray-600 font-normal">
            Asset Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
            className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white font-medium rounded shadow-sm transition-colors disabled:opacity-50"
            >
            {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-center mt-4 text-sm font-medium">
            {error}
          </p>
        )}

        {/* Footer Links */}
        <div className="flex justify-between text-sm text-blue-800 mt-8 font-medium">
          <a href="/forgot-password" className="hover:underline">
            Forgot password?
          </a>

          <a href="#" className="hover:underline">
            Help Desk
          </a>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Identity Verification</h2>
            
            {!otpSent && (
              <div className="mb-4">
                <div className="flex gap-4 items-center mb-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="EMAIL"
                      checked={verificationType === "EMAIL"}
                      onChange={() => setVerificationType("EMAIL")}
                      className="w-4 h-4"
                    />
                    EMAIL
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="SMS"
                      checked={verificationType === "SMS"}
                      onChange={() => setVerificationType("SMS")}
                      className="w-4 h-4"
                    />
                    SMS
                  </label>
                  <button
                    onClick={handleSendVerificationCode}
                    disabled={sendingOtp}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    {sendingOtp ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-500">
                Enter Verification Code (6 digits):
              </label>
              {generatedOtp && (
                <p className="text-sm text-blue-800 mb-2">Testing OTP: {generatedOtp}</p>
              )}
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-2 border rounded text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowVerification(false)}
                className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCode}
                className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
