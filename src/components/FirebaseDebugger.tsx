import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { toast } from "sonner";

/**
 * FirebaseDebugger component
 * 
 * This component provides tools to test Firebase connectivity and perform
 * basic operations. It's helpful for debugging and verifying that Firebase
 * is properly connected and operational.
 * 
 * Add this component to any page where you want to test Firebase:
 * 
 * ```tsx
 * <FirebaseDebugger />
 * ```
 */
const FirebaseDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "failed">("unknown");
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus("unknown");
    setCourseCount(null);
    
    try {
      // Test Firebase connection by querying courses collection
      const coursesQuery = query(collection(db, "courses"), limit(10));
      const querySnapshot = await getDocs(coursesQuery);
      
      // Count courses
      const count = querySnapshot.size;
      setCourseCount(count);
      
      // Update connection status
      setConnectionStatus("success");
      setLastOperation(`Successfully connected to Firebase. Found ${count} courses.`);
      toast.success(`Firebase connection successful! Found ${count} courses.`);
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      setConnectionStatus("failed");
      setLastOperation(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Firebase connection failed. Check console for details.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Firebase Connectivity
        </CardTitle>
        <CardDescription>
          Test Firebase connection and verify course data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Connection Status:</span>
          <span className="flex items-center gap-1">
            {connectionStatus === "unknown" && "Not tested"}
            {connectionStatus === "success" && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Connected</span>
              </>
            )}
            {connectionStatus === "failed" && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">Failed</span>
              </>
            )}
          </span>
        </div>
        
        {courseCount !== null && (
          <div className="flex items-center justify-between">
            <span>Courses in Firestore:</span>
            <span className="font-medium">{courseCount}</span>
          </div>
        )}
        
        {lastOperation && (
          <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border">
            {lastOperation}
          </div>
        )}
        
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Firebase Connection"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FirebaseDebugger;
