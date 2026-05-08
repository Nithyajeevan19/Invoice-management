// import { useState } from "react";
/*
import Login from "./Login";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import { Brain } from "lucide-react";
*/

export default function Auth() {
  // const [mode, setMode] = useState("login"); // 'login', 'signup', 'forgot-password'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Disabled</h1>
        <p className="text-gray-600">The login screen has been temporarily commented out.</p>
      </div>
    </div>
  );
  
  /*
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl lg:flex-row gap-12 lg:gap-24">
        <div className="hidden lg:flex flex-col items-start max-w-sm text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <Brain className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">SWIPE</h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Manage invoices with the power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">AI</span>.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Automate your billing process, track payments, and get smart insights in one place.
            </p>
          </div>
          
          <div className="flex items-center gap-4 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-indigo-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-white/90">Joined by 10k+ business owners</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full">
          {mode === "login" && (
            <Login 
              onToggleMode={() => setMode("signup")} 
              onForgotPassword={() => setMode("forgot-password")}
            />
          )}
          {mode === "signup" && (
            <SignUp onToggleMode={() => setMode("login")} />
          )}
          {mode === "forgot-password" && (
            <ForgotPassword onBackToLogin={() => setMode("login")} />
          )}
        </div>
      </div>

      <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white">
        <Brain className="w-8 h-8" />
        <span className="text-2xl font-black tracking-tighter">SWIPE</span>
      </div>
    </div>
  );
  */
}
