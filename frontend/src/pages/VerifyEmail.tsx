import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  // "loading" | "success" | "error"

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/customer/auth/verify-email/${token}`
      );

      setStatus("success");
      setMessage(res.data.message || "Email verified successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);

    } catch (err : any) {
      setStatus("error");

      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Verification failed. Link may be expired.");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">

        {status === "loading" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Verifying your email…</h2>
            <p className="text-gray-600">Please wait…</p>
            <div className="mt-4 animate-spin border-4 border-blue-600 border-t-transparent w-10 h-10 rounded-full mx-auto" />
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Email Verified!
            </h2>
            <p className="mb-4">{message}</p>
            <p className="text-gray-500 text-sm">
              Redirecting to login…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Verification Failed
            </h2>
            <p className="mb-6">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
}
