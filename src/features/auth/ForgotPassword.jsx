import { useState } from "react";
import { resetPasswordForEmail } from "../../services/auth/authService";
import { Mail, ArrowLeft, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPassword({ onBackToLogin }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password reset link sent to your email!");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-4 transform hover:rotate-12 transition-transform duration-300">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
        <p className="text-gray-500">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
