import { useState } from "react";
import { registerUser } from "../services/authStore";
import catLogo from "../assets/phishgatto-cat.png";

type RegisterPageProps = {
  onRegisterSuccess: () => void;
  onOpenLogin: () => void;
  onBackHome: () => void;
};

export default function RegisterPage({
  onRegisterSuccess,
  onOpenLogin,
  onBackHome,
}: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔹 HANDLE REGISTER
  const handleRegister = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await registerUser(username, email, password);

    if (result.status !== "success") {
      setError(result.message || "Registration failed");
      return;
    }

    onRegisterSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#041128] to-[#020617] text-white relative overflow-hidden flex">
      {/*  BACKGROUND GLOW */}
      <div className="absolute top-[10%] left-[8%] w-[420px] h-[420px] bg-cyan-500/18 blur-[120px] rounded-full" />
      <div className="absolute bottom-[8%] right-[8%] w-[420px] h-[420px] bg-blue-500/16 blur-[120px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-cyan-400/8 blur-[160px] rounded-full" />
      {/*  LEFT PANEL */}
      <div className="hidden md:flex w-1/2 relative z-10 items-center justify-center px-12">
        <div className="max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg mb-6">
            <img
              src={catLogo}
              alt="PhishGatto logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Join <span className="text-cyan-400">PhishGatto</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Create your account to start scanning suspicious URLs and managing phishing protection more effectively.
          </p>

          <div className="space-y-4">
            <FeaturePoint text="Detect phishing websites quickly" />
            <FeaturePoint text="Review your own scan history" />
            <FeaturePoint text="Access secure user and admin features" />
          </div>
        </div>
      </div>

      {/* 🔹 RIGHT PANEL */}
      <div className="w-full md:w-1/2 relative z-10 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-[#0b1220]/95 border border-cyan-400/10 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        {/*  BACK TO HOME */}
        <button
          onClick={onBackHome}
          className="text-sm text-gray-400 hover:text-cyan-400 transition mb-4"
        >
          ← Back to Home
        </button>
          {/* MOBILE BRAND */}
          <div className="md:hidden flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg mb-3">
              <img
                src={catLogo}
                alt="PhishGatto logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">PhishGatto</h1>
            <p className="text-sm text-gray-400 mt-2">
              Register for your phishing detection account
            </p>
          </div>

          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-cyan-400">Create Account</h2>
            <p className="text-sm text-gray-400 mt-1">
              Register to access the platform
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* NAME */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Name</label>
            <input
              className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-16 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mb-5">
            <label className="block text-sm text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-16 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* REGISTER BUTTON */}
          <button
            onClick={handleRegister}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition shadow-md"
          >
            Register Now
          </button>

          {/* FOOTER */}
          <p className="text-sm text-gray-400 text-center mt-5">
            Already have an account?{" "}
            <button
              onClick={onOpenLogin}
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
            >
              Login now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
      <p className="text-gray-300">{text}</p>
    </div>
  );
}