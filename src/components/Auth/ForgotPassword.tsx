import React, { useState } from "react";
import { Mail, Send, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/igl-logo.png";

const API_BASE = import.meta.env.PROD
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : '/api';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl shadow-2xl w-full max-w-md">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Sent!
            </h2>
            <p className="text-gray-600">
              If this email is registered, a reset link has been sent. Check
              your inbox.
            </p>
          </div>
        ) : (
          <>
            <div className="pt-8 pr-8 pl-8  border-b border-gray-100">
              <div className="flex items-center space-x-3 mb-4 justify-center">
                <div className="w-50 h-40 flex items-center justify-center overflow-hidden bg-white p-2 rounded-xl">
                  <img
                    src={logo}
                    alt="igl-logo"
                    className="w-full h-full"
                  />
                </div>

                {/* <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    IGL AMC System
                  </h1>
                </div> */}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your email to receive reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 font-medium">
                    {error}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full modern-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-2xl text-white font-semibold">
                      <Send className="h-4 w-4" />
                      <span>Send Reset Link</span>
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
