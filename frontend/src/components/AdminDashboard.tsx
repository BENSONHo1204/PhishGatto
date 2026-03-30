import { useEffect, useState } from "react";
import { getAllScans } from "../services/scanStore";
import { getAllUsers, removeUser } from "../services/authStore";
import { addToBlacklist, getBlacklist, removeFromBlacklist } from "../services/blacklistStore";
import catLogo from "../assets/phishgatto-cat.png";


type AdminDashboardProps = {
  onBack: () => void;
  onLogout: () => void;
};

type AdminSection = "dashboard" | "users" | "scans" | "blacklist";
type ScanFilter = "all" | "safe" | "suspicious" | "phishing";

export default function AdminDashboard({
  onBack,
  onLogout,
}: AdminDashboardProps) {
  const [scans, setScans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);

  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");

  const [blacklistInput, setBlacklistInput] = useState("");
  const [blacklistError, setBlacklistError] = useState("");
  const [scanFilter, setScanFilter] = useState<ScanFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const scanData = await getAllScans();
      const userData = await getAllUsers();
      const blacklistData = await getBlacklist();

      setScans(Array.isArray(scanData) ? scanData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setBlacklist(Array.isArray(blacklistData) ? blacklistData : []);
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
    }
  };

  const totalScans = scans.length;

  const phishingCount = scans.filter(
    (s: any) => s.riskLevel === "phishing" || s.risk_level === "phishing"
  ).length;

  const suspiciousCount = scans.filter(
    (s: any) => s.riskLevel === "suspicious" || s.risk_level === "suspicious"
  ).length;

  const safeCount = scans.filter(
    (s: any) => s.riskLevel === "safe" || s.risk_level === "safe"
  ).length;

  const getUserEmailById = (userId: string) => {
    const matchedUser = users.find((user: any) => String(user.id) === String(userId));
    return matchedUser ? matchedUser.email : "Removed User";
  };

  const filteredScans = scans.filter((scan: any) => {
    const risk = scan.riskLevel || scan.risk_level;

    const matchesFilter = scanFilter === "all" || risk === scanFilter;

    const userEmail = getUserEmailById(scan.userId || scan.user_id).toLowerCase();
    const urlText = String(scan.url || "").toLowerCase();
    const keyword = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      urlText.includes(keyword) ||
      userEmail.includes(keyword);

    return matchesFilter && matchesSearch;
  });

  const handleRemoveUser = async (userId: string, userRole: string) => {
    if (userRole === "admin") return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this user?"
    );

    if (!confirmed) return;

    await removeUser(userId);

    const updatedUsers = await getAllUsers();
    setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
  };

  const handleAddBlacklist = async () => {
    const domain = blacklistInput.trim().toLowerCase();

    if (!domain) {
      setBlacklistError("Please enter a domain");
      return;
    }

    if (blacklist.includes(domain)) {
      setBlacklistError("Domain already exists in blacklist");
      return;
    }

    await addToBlacklist(domain);

    const updatedBlacklist = await getBlacklist();
    setBlacklist(Array.isArray(updatedBlacklist) ? updatedBlacklist : []);

    setBlacklistInput("");
    setBlacklistError("");
  };

  const handleRemoveBlacklist = async (domain: string) => {
    await removeFromBlacklist(domain);

    const updatedBlacklist = await getBlacklist();
    setBlacklist(Array.isArray(updatedBlacklist) ? updatedBlacklist : []);
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex overflow-hidden">
      <aside className="w-64 h-screen shrink-0 bg-[#0b1220] border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
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
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>

          <div className="space-y-2">
            <SidebarButton
              label="Dashboard"
              active={activeSection === "dashboard"}
              onClick={() => setActiveSection("dashboard")}
            />

            <SidebarButton
              label="Users"
              active={activeSection === "users"}
              onClick={() => setActiveSection("users")}
            />

            <SidebarButton
              label="Scan Records"
              active={activeSection === "scans"}
              onClick={() => setActiveSection("scans")}
            />

            <SidebarButton
              label="Blacklist"
              active={activeSection === "blacklist"}
              onClick={() => setActiveSection("blacklist")}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onBack}
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

      <main className="flex-1 h-screen overflow-y-auto p-8">
        {activeSection === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                System monitoring and phishing detection analytics
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <StatCard
                title="Total Scans"
                value={totalScans}
                color="text-cyan-400"
              />
              <StatCard
                title="Phishing Detected"
                value={phishingCount}
                color="text-red-400"
              />
              <StatCard
                title="Suspicious"
                value={suspiciousCount}
                color="text-yellow-400"
              />
              <StatCard
                title="Safe Websites"
                value={safeCount}
                color="text-green-400"
              />
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <h2 className="text-cyan-400 text-sm mb-4">
                Recent Scan Activity
              </h2>

              <div className="space-y-3">
                {scans.slice(0, 8).map((scan: any, index: number) => {
                  const risk = scan.riskLevel || scan.risk_level;

                  return (
                    <div
                      key={index}
                      className="bg-[#071726] p-3 rounded-lg flex justify-between items-center"
                    >
                      <div className="text-sm break-all">{scan.url}</div>

                      <span
                        className={
                          risk === "phishing"
                            ? "text-red-400"
                            : risk === "suspicious"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }
                      >
                        {String(risk).toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Registered Users
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                View all users currently stored in the system
              </p>
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <div className="space-y-2">
                {users.length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    No users registered yet.
                  </div>
                ) : (
                  users.map((user: any, index: number) => (
                    <div
                      key={index}
                      className="bg-[#071726] p-4 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {user.username || "Unnamed User"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <div
                          className={
                            user.role === "admin"
                              ? "text-cyan-400 text-sm font-semibold"
                              : "text-gray-300 text-sm"
                          }
                        >
                          {String(user.role).toUpperCase()}
                        </div>

                        <div className="text-xs text-gray-500">
                          ID: {user.id}
                        </div>

                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleRemoveUser(String(user.id), user.role)}
                            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "scans" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Scan Records
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                View all recorded phishing scan results
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <FilterButton
                label="All Links"
                active={scanFilter === "all"}
                onClick={() => setScanFilter("all")}
              />
              <FilterButton
                label="Safe"
                active={scanFilter === "safe"}
                onClick={() => setScanFilter("safe")}
              />
              <FilterButton
                label="Suspicious"
                active={scanFilter === "suspicious"}
                onClick={() => setScanFilter("suspicious")}
              />
              <FilterButton
                label="Phishing"
                active={scanFilter === "phishing"}
                onClick={() => setScanFilter("phishing")}
              />
            </div>

            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by URL or user email..."
                className="w-full md:w-[420px] px-4 py-2 bg-[#071726] border border-white/5 rounded-lg outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <div className="space-y-3">
                {filteredScans.length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    No scan records available yet.
                  </div>
                ) : (
                  filteredScans.map((scan: any, index: number) => {
                    const risk = scan.riskLevel || scan.risk_level;
                    const userId = scan.userId || scan.user_id;
                    const timestamp = scan.timestamp || scan.scanned_at;

                    return (
                      <div
                        key={index}
                        className="bg-[#071726] p-4 rounded-lg flex justify-between items-center"
                      >
                        <div className="max-w-[75%]">
                          <div className="text-sm break-all text-white">
                            {scan.url}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {timestamp || "No timestamp"}
                          </div>
                          <div className="text-xs text-cyan-400 mt-1">
                            Scanned by: {getUserEmailById(String(userId))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={
                              risk === "phishing"
                                ? "text-red-400 font-semibold"
                                : risk === "suspicious"
                                ? "text-yellow-400 font-semibold"
                                : "text-green-400 font-semibold"
                            }
                          >
                            {String(risk).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Score: {scan.score ?? "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "blacklist" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                Blacklisted Domains
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage blocked domains used for phishing prevention
              </p>
            </div>

            <div className="bg-[#0b1220] rounded-2xl p-6 border border-white/5">
              <div className="flex gap-3 mb-4">
                <input
                  value={blacklistInput}
                  onChange={(e) => {
                    setBlacklistInput(e.target.value);
                    if (blacklistError) setBlacklistError("");
                  }}
                  placeholder="Enter domain (e.g. phishing-site.com)"
                  className="flex-1 px-4 py-2 bg-[#071726] rounded-lg border border-white/5 outline-none"
                />

                <button
                  onClick={handleAddBlacklist}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-medium"
                >
                  Add
                </button>
              </div>

              {blacklistError && (
                <div className="text-red-400 text-sm mb-3">
                  {blacklistError}
                </div>
              )}

              {blacklist.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No blacklisted domains added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {blacklist.map((domain, index) => (
                    <div
                      key={index}
                      className="bg-[#071726] p-3 rounded-lg text-sm break-all flex justify-between items-center"
                    >
                      <span>{domain}</span>

                      <button
                        onClick={() => handleRemoveBlacklist(domain)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

function FilterButton({
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
      className={`px-4 py-2 rounded-lg text-sm transition ${
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