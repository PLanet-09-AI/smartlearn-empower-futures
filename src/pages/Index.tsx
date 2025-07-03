
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";
import Homepage from "@/components/Homepage";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Index = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  const handleBackToHome = () => {
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        isLoggedIn={!!currentUser} 
        onLogout={logout}
        onBackToHome={!currentUser ? handleBackToHome : undefined}
        showBackButton={!currentUser && showLogin}
      />
      
      {!currentUser ? (
        showLogin ? (
          <LoginForm />
        ) : (
          <Homepage onGetStarted={handleGetStarted} />
        )
      ) : (
        <Dashboard userRole={userProfile?.role || 'learner'} />
      )}
    </div>
  );
};

export default Index;
