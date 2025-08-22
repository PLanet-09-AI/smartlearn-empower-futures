
import Header from "@/components/Header";
import Homepage from "@/components/Homepage";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  // Don't render anything if user is authenticated (will redirect)
  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        isLoggedIn={false} 
        onLogout={logout}
      />
      <Homepage onGetStarted={handleGetStarted} />
    </div>
  );
};

export default Index;
