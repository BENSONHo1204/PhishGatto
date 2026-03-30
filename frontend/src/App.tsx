import { useState } from "react";
import HeroSection from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import HowItWorks from "./components/HowItWorks";
import ExampleResultsPage from "./components/ExampleResultsPage";
import LiveResultsPage from "./components/LiveResultsPage";
import type { ScanResult } from "./types";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import { getCurrentUser, logoutUser } from "./services/authStore";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ChangePasswordPage from "./components/ChangePasswordPage";


type View =
  | "login"
  | "register"
  | "home"
  | "exampleResult"
  | "liveResult"
  | "admin"
  | "userDashboard"
  | "changePassword";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const [view, setView] = useState<View>("home");

  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);


  //  LOGIN SUCCESS
  const handleLoginSuccess = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    sessionStorage.removeItem("phish_guest_scan_count");
    setView("home");
  };

  //  ADMIN LOGIN SUCCESS
  const handleAdminLogin = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    sessionStorage.removeItem("phish_guest_scan_count");
    setView("admin");
  };

  //  LOGOUT
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentResult(null);
    setView("home");
  };

  //  DEMO RESULT (sample URLs only)
  const handleDemoResult = (result: ScanResult) => {
    setCurrentResult(result);
    setView("exampleResult");
  };

  //  LIVE RESULT (backend scan)
  const handleLiveResult = (result: ScanResult) => {
    setCurrentResult(result);
    setView("liveResult");
  };

  //  LOGIN VIEW
  if (view === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onAdminLogin={handleAdminLogin}
        onOpenRegister={() => setView("register")}
        onBackHome={() => setView("home")}
      />
    );
  }

  //  REGISTER VIEW
  if (view === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={() => setView("login")}
        onOpenLogin={() => setView("login")}
        onBackHome={() => setView("home")}
      />
    );
  }

// EXAMPLE RESULT VIEW
if (view === "exampleResult" && currentResult) {
  return (
    <ExampleResultsPage
      result={currentResult}
      onScanAnother={() => setView("home")}
      onViewHistory={() => {
        if (!currentUser) {
          setView("register");
        } else if (currentUser.role === "admin") {
          setView("admin");
        } else {
          setView("userDashboard");
        }
      }}
      historyButtonLabel={
        !currentUser
          ? "Register to Save History"
          : currentUser.role === "admin"
          ? "View Admin Dashboard"
          : "View My History"
      }
    />
  );
}
  // LIVE RESULT VIEW
  if (view === "liveResult" && currentResult) {
    return (
      <LiveResultsPage
        result={currentResult}
        onBack={() => setView("home")}
      />
    );
  }

  //  USER DASHBOARD VIEW
  if (view === "userDashboard") {
    return (
      <UserDashboard
        onLogout={handleLogout}
        onBackHome={() => setView("home")}
      />
    );
  }

  //  CHANGE PASSWORD VIEW
  if (view === "changePassword") {
  return (
    <ChangePasswordPage
      onBack={() => setView("userDashboard")}
    />
  );
}

  //  ADMIN DASHBOARD VIEW
  if (view === "admin") {
    if (currentUser?.role !== "admin") {
      setView("home");
      return null;
    }

    return (
      <AdminDashboard
        onBack={() => setView("home")}
        onLogout={handleLogout}
      />
    );
  }

  //  HOME VIEW
  return (
    <>
      <HeroSection
        onDemoScan={handleDemoResult}
        onLiveScan={handleLiveResult}
        onOpenLogin={() => setView("login")}
        onOpenRegister={() => setView("register")}
        onOpenUserDashboard={() => setView("userDashboard")}
        isLoggedIn={!!currentUser}
        isAdmin={currentUser?.role === "admin"}
        currentUserName={currentUser?.username || currentUser?.email}
        currentUserRole={currentUser?.role}
        onOpenAdmin={() => {
          if (currentUser?.role === "admin") {
            setView("admin");
          } else {
            setView("login");
          }
        }}
      />
      <StatsSection />
      <HowItWorks />
    </>
  );
}