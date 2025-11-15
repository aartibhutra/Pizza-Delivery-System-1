import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!mail) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/customer/auth/forgot-password`,
        { mail }
      );
      setSuccess(res.data?.message || "If the email exists, a reset link was sent.");
    } catch (err : any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

        {error && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
        {success && <div className="mb-3 p-2 bg-green-100 text-green-800 rounded">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Remembered your password?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-600 underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
