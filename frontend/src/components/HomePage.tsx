import HeroSection from "../components/HeroSection";
import { StatsSection } from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorks";
import type { ScanResult } from "../types";
import { getCurrentUser, logoutUser } from "../services/authStore";

interface HomePageProps {
  onScan: (result: ScanResult) => void;
}

export default function HomePage({ onScan }: HomePageProps) {
  const currentUser = getCurrentUser();

  const onLogout = () => {
    logoutUser();
    window.location.reload();
  };

  return (
    <>
    {/* Top bar */}
      <div className="flex justify-end p-4 bg-[#020617] text-white">
        <button
          onClick={onLogout}
          className="text-sm text-red-400 hover:text-red-500"
        >
          Logout
        </button>
      </div>

      <HeroSection 
        onDemoScan={onScan}
        onLiveScan={onScan}
        onOpenAdmin={() => {}}
        onOpenLogin={() => {}}
        onOpenRegister={() => {}}
        onOpenUserDashboard={() => {}}
        isLoggedIn={!!currentUser}
        isAdmin={currentUser?.role === "admin"}
        currentUserName={currentUser?.username || currentUser?.email}
        currentUserRole={currentUser?.role}
      />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
    </>
  );
}
