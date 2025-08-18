import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Database, TreePine, Trash2 } from "lucide-react";
import { db } from "@/lib/database";
import { dbSeeder } from "@/lib/seeder";
import { toast } from "sonner";

/**
 * DatabaseDebugger component
 * 
 * This component provides tools to test IndexedDB connectivity and perform
 * basic operations. It's helpful for debugging and verifying that IndexedDB
 * is properly connected and operational.
 * 
 * Add this component to any page where you want to test IndexedDB:
 * 
 * ```tsx
 * <DatabaseDebugger />
 * ```
 */
const DatabaseDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "failed">("unknown");
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus("unknown");
    setCourseCount(null);
    
    try {
      // Test IndexedDB connection by querying courses collection
      const courses = await db.getAll("courses");
      
      // Count courses
      const count = courses.length;
      setCourseCount(count);
      
      // Update connection status
      setConnectionStatus("success");
      setLastOperation(`Successfully connected to IndexedDB. Found ${count} courses.`);
      toast.success(`IndexedDB connection successful! Found ${count} courses.`);
    } catch (error) {
      console.error("IndexedDB connection test failed:", error);
      setConnectionStatus("failed");
      setLastOperation(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("IndexedDB connection failed. Check console for details.");
    } finally {
      setTesting(false);
    }
  };

  const testCreateOperation = async () => {
    setTesting(true);
    
    try {
      // Test creating a test document
      const testData = {
        id: `test_${Date.now()}`,
        title: "Test Course",
        description: "This is a test course created by the debugger",
        category: "Testing",
        level: "Beginner" as const,
        duration: "5 minutes",
        rating: 5,
        students: 0,
        instructor: "System",
        thumbnail: "/placeholder.svg",
        content: [],
        quiz: {
          id: "test_quiz",
          title: "Test Quiz",
          questions: []
        },
        status: "draft" as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const testId = await db.add("courses", testData);
      setLastOperation(`Test course created with ID: ${testId}`);
      toast.success("Test course created successfully!");
      
      // Clean up - delete the test course
      await db.delete("courses", testId);
      setLastOperation(`Test course created and deleted successfully (ID: ${testId})`);
      toast.success("Test completed! Course created and deleted.");
    } catch (error) {
      console.error("Create operation test failed:", error);
      setLastOperation(`Create test failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Create operation test failed. Check console for details.");
    } finally {
      setTesting(false);
    }
  };

  const clearDatabase = async () => {
    if (!confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      return;
    }

    setTesting(true);
    
    try {
      // Clear all collections
      const collections = ["courses", "enrollments", "userProgress", "courseRatings", "quizResults", "quizAnswers"];
      
      for (const collectionName of collections) {
        const items = await db.getAll(collectionName);
        for (const item of items) {
          await db.delete(collectionName, item.id);
        }
      }
      
      setLastOperation("All database collections cleared successfully");
      setCourseCount(0);
      toast.success("Database cleared successfully!");
    } catch (error) {
      console.error("Clear database failed:", error);
      setLastOperation(`Clear failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to clear database. Check console for details.");
    } finally {
      setTesting(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    setTesting(true);
    
    try {
      await dbSeeder.checkAndSeedDatabase();
      
      // Refresh course count
      const courses = await db.getAll("courses");
      setCourseCount(courses.length);
      
      setLastOperation(`Database seeded successfully. ${courses.length} courses available.`);
      toast.success("Database seeded with sample data!");
    } catch (error) {
      console.error("Seeding failed:", error);
      setLastOperation(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to seed database. Check console for details.");
    } finally {
      setSeeding(false);
      setTesting(false);
    }
  };

  const clearAndSeed = async () => {
    setSeeding(true);
    setTesting(true);
    
    try {
      await dbSeeder.clearDatabase();
      await dbSeeder.checkAndSeedDatabase();
      
      // Refresh course count
      const courses = await db.getAll("courses");
      setCourseCount(courses.length);
      
      setLastOperation(`Database cleared and reseeded. ${courses.length} courses available.`);
      toast.success("Database cleared and reseeded successfully!");
    } catch (error) {
      console.error("Clear and seed failed:", error);
      setLastOperation(`Clear and seed failed: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Failed to clear and seed database. Check console for details.");
    } finally {
      setSeeding(false);
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          IndexedDB Debugger
        </CardTitle>
        <CardDescription>
          Test IndexedDB connection and perform diagnostic operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {connectionStatus === "unknown" && <Database className="h-4 w-4 text-gray-500" />}
          {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
          {connectionStatus === "failed" && <XCircle className="h-4 w-4 text-red-600" />}
          <span className="text-sm font-medium">
            Status: {connectionStatus === "unknown" ? "Not tested" : 
                    connectionStatus === "success" ? "Connected" : "Failed"}
          </span>
          {courseCount !== null && (
            <span className="text-sm text-gray-600">({courseCount} courses)</span>
          )}
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={testing}
            className="w-full"
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Connection
          </Button>
          
          <Button 
            onClick={testCreateOperation} 
            disabled={testing}
            className="w-full"
            variant="outline"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Create/Delete
          </Button>
          
          <Button 
            onClick={clearDatabase} 
            disabled={testing}
            className="w-full"
            variant="destructive"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Clear All Data
          </Button>
          
          <Button 
            onClick={seedDatabase} 
            disabled={testing || seeding}
            className="w-full"
            variant="secondary"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TreePine className="h-4 w-4 mr-2" />}
            Seed Sample Data
          </Button>
          
          <Button 
            onClick={clearAndSeed} 
            disabled={testing || seeding}
            className="w-full"
            variant="default"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Reset & Seed Database
          </Button>
        </div>

        {/* Last Operation Result */}
        {lastOperation && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Last Operation:</p>
            <p className="text-xs text-blue-700 mt-1">{lastOperation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseDebugger;
