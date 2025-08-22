import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (currentUser) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        isLoggedIn={false} 
        onLogout={logout}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
