import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const emailRef = useRef<any>(null);

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e : any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/customer/auth/signin`,
        { mail, password }
      );

      localStorage.setItem("customer_token", res.data.token);

      navigate("/customer/dashboard");

    } catch (err : any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong, please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        
        <h1 className="text-2xl font-semibold text-center mb-6">
          Customer Login
        </h1>

        {error && (
          <div className="p-2 mb-4 bg-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              ref={emailRef}
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
              className="w-full p-2 border rounded-xl outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border rounded-xl outline-none focus:ring focus:ring-blue-200 pr-10"
              />

              <span
                onClick={() => setShowPass((prev) => !prev)}
                className="absolute right-3 top-2 text-sm cursor-pointer text-gray-500"
              >
                {showPass ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <p
            onClick={() => navigate("/forgot-password")}
            className="text-right text-blue-600 text-sm hover:underline cursor-pointer"
          >
            Forgot Password?
          </p>

          <button
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}
