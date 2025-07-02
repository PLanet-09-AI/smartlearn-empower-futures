
import { useState } from "react";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'learner' | 'educator' | 'admin'>('learner');

  const handleLogin = (role: 'learner' | 'educator' | 'admin') => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <Dashboard userRole={userRole} />
      )}
    </div>
  );
};

export default Index;
