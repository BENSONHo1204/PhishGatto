import { useState } from "react";

type ChangePasswordPageProps = {
  onBack: () => void;
};

export default function ChangePasswordPage({
  onBack,
}: ChangePasswordPageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = () => {
    setError("");
    setSuccess("");

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setSuccess("Password updated successfully (frontend demo)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">
              Change Password
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Update your password to keep your account secure
            </p>
          </div>

          <button
            onClick={onBack}
            className="px-5 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-4">
              {success}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (error) setError("");
                  if (success) setSuccess("");
                }}
                placeholder="Enter your current password"
                className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError("");
                  if (success) setSuccess("");
                }}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                  if (success) setSuccess("");
                }}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition shadow-md"
            >
              Save New Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}