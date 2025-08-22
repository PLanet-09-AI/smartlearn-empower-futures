import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Map auth roles to dashboard roles
  const mapRole = (role: 'student' | 'lecturer' | 'admin'): 'learner' | 'educator' | 'admin' => {
    switch (role) {
      case 'student':
        return 'learner';
      case 'lecturer':
        return 'educator';
      case 'admin':
        return 'admin';
      default:
        return 'learner';
    }
  };

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        isLoggedIn={!!currentUser} 
        onLogout={logout}
      />
      
      <Dashboard userRole={mapRole(currentUser.role)} />
    </div>
  );
};

export default DashboardPage;
