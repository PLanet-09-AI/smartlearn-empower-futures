import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Firebase Status Indicator
 * 
 * Shows the current connection status with Firebase.
 * Can be placed anywhere in the UI to give users feedback about Firebase connectivity.
 */
const FirebaseStatus = () => {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [count, setCount] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if Firebase is accessible by querying the courses collection
        const q = query(collection(db, "courses"), limit(5));
        const snapshot = await getDocs(q);
        
        setCount(snapshot.size);
        setStatus("connected");
        setLastChecked(new Date());
      } catch (error) {
        console.error("Firebase connection error:", error);
        setStatus("error");
        setLastChecked(new Date());
      }
    };
    
    checkConnection();
    
    // Recheck connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Badge 
            variant={status === "connected" ? "outline" : "destructive"}
            className={`cursor-default flex items-center gap-1 ${
              status === "connected" ? "text-green-600 bg-green-50" : 
              status === "error" ? "bg-red-50" : "bg-blue-50"
            }`}
          >
            {status === "connecting" && <Loader2 className="h-3 w-3 animate-spin" />}
            {status === "connected" && <CheckCircle className="h-3 w-3" />}
            {status === "error" && <AlertCircle className="h-3 w-3" />}
            <Database className="h-3 w-3" />
            <span className="text-xs">
              {status === "connecting" ? "Connecting..." : 
               status === "connected" ? "Firebase" : "Firebase Error"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3 max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Firebase Status</p>
            <p className="text-sm">
              {status === "connecting" ? "Connecting to Firebase..." : 
               status === "connected" ? `Connected: ${count} courses available` : 
               "Error connecting to Firebase"}
            </p>
            {lastChecked && (
              <p className="text-xs text-gray-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FirebaseStatus;
