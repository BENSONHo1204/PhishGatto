import { useEffect, useState } from "react";
import { getCurrentUser, changePassword } from "../services/authStore";
import { getUserScans } from "../services/scanStore";
import catLogo from "../assets/phishgatto-cat.png";

type UserDashboardProps = {
  onLogout: () => void;
  onBackHome: () => void;
};

type UserSection = "dashboard" | "history" | "changePassword";

export default function UserDashboard({
  onLogout,
  onBackHome,
}: UserDashboardProps) {
  const currentUser = getCurrentUser();
  const [activeSection, setActiveSection] =
    useState<UserSection>("dashboard");
  const [userScans, setUserScans] = useState<any[]>([]);

  // CHANGE PASSWORD STATES
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    async function loadUserScans() {
      if (!currentUser) {
        setUserScans([]);
        return;
      }

      const scans = await getUserScans(currentUser.id);
      setUserScans(Array.isArray(scans) ? scans : []);
    }

    loadUserScans();
  }, [currentUser]);

  const safeCount = userScans.filter(
    (scan: any) => scan.riskLevel === "safe"
  ).length;

  const suspiciousCount = userScans.filter(
    (scan: any) => scan.riskLevel === "suspicious"
  ).length;

  const phishingCount = userScans.filter(
    (scan: any) => scan.riskLevel === "phishing"
  ).length;

  // HANDLE CHANGE PASSWORD
  const handleChangePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentUser) {
      setPasswordError("User not found");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    const result = await changePassword(
      currentUser.id,
      currentPassword,
      newPassword
    );

    if (result.status === "success") {
      setPasswordMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      setPasswordError(result.message || "Failed to change password");
    }
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 h-screen shrink-0 bg-[#0b1220] border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          {/* BRAND */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl">
              <img
                src={catLogo}
                alt="PhishGatto logo"
                className="w-full h-full object-contain"
              />

            </div>
            <div>
              <h1 className="font-bold text-white">PhishGatto</h1>
              <p className="text-xs text-gray-400">User Panel</p>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="space-y-2">
            <SidebarButton
              label="Dashboard"
              active={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
            />

            <SidebarButton
              label="My History"
              active={activeSection === "history"}
              onClick={() => setActiveSection("history")}
            />

            <SidebarButton
              label="Change Password"
              active={activeSection === "changePassword"}
              onClick={() => setActiveSection("changePassword")}
            />
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="space-y-3">
          <button
            onClick={onBackHome}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-left"
          >
            ← Back to Home
          </button>

          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto p-8">
        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                View your account details and phishing scan summary
              </p>
            </div>

            {/* PROFILE CARD */}
            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xl font-bold">
                  {currentUser?.username?.charAt(0).toUpperCase() ||
                    currentUser?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {currentUser?.username || "User"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {currentUser?.email || "No email available"}
                  </p>
                  <p className="text-xs text-cyan-400 uppercase mt-1">
                    {currentUser?.role || "user"}
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard
                title="Total Scans"
                value={userScans.length}
                color="text-cyan-400"
              />

              <StatCard
                title="Safe"
                value={safeCount}
                color="text-green-400"
              />

              <StatCard
                title="Suspicious"
                value={suspiciousCount}
                color="text-yellow-400"
              />

              <StatCard
                title="Phishing"
                value={phishingCount}
                color="text-red-400"
              />
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <h2 className="text-cyan-400 text-sm mb-4">
                Recent Scan Activity
              </h2>

              {userScans.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No scan history available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {userScans.slice(0, 6).map((scan: any, index: number) => (
                    <div
                      key={index}
                      className="bg-[#071726] p-3 rounded-lg flex justify-between items-center"
                    >
                      <div className="max-w-[75%]">
                        <div className="text-sm break-all text-white">
                          {scan.url}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {scan.timestamp || "No timestamp"}
                        </div>
                      </div>

                      <span
                        className={
                          scan.riskLevel === "phishing"
                            ? "text-red-400 font-semibold"
                            : scan.riskLevel === "suspicious"
                            ? "text-yellow-400 font-semibold"
                            : "text-green-400 font-semibold"
                        }
                      >
                        {scan.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {activeSection === "history" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                My Scan History
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                View all phishing scan results associated with your account
              </p>
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              {userScans.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No scan history available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {userScans.map((scan: any, index: number) => (
                    <div
                      key={index}
                      className="bg-[#071726] p-4 rounded-lg flex justify-between items-center"
                    >
                      <div className="max-w-[75%]">
                        <div className="text-sm break-all text-white">
                          {scan.url}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {scan.timestamp || "No timestamp"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={
                            scan.riskLevel === "phishing"
                              ? "text-red-400 font-semibold"
                              : scan.riskLevel === "suspicious"
                              ? "text-yellow-400 font-semibold"
                              : "text-green-400 font-semibold"
                          }
                        >
                          {scan.riskLevel.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Score: {scan.score ?? "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* CHANGE PASSWORD */}
        {activeSection === "changePassword" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Change Password
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-8 border border-white/5 max-w-3xl">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 bg-[#071726] border border-white/5 rounded-xl outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>

                {passwordError && (
                  <div className="text-red-400 text-sm">{passwordError}</div>
                )}

                {passwordMessage && (
                  <div className="text-green-400 text-sm">{passwordMessage}</div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="w-full md:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition shadow-md"
                  >
                    Save New Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition ${
        active
          ? "bg-cyan-500 text-black font-semibold"
          : "bg-[#071726] text-gray-300 hover:bg-[#0d2032] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#0b1220] rounded-xl p-6 border border-white/5">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
    </div>
  );
}