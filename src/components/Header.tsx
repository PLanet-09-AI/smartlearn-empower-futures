
import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatabaseStatus from "./DatabaseStatus";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => Promise<void>;
}

const Header = ({ isLoggedIn, onLogout }: HeaderProps) => {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SgilaSkeem</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Empowering Digital Futures</p>
                {isLoggedIn && <DatabaseStatus />}
              </div>
            </div>
          </div>
          
          {isLoggedIn && (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
