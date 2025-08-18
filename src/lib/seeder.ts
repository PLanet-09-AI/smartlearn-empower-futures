import { db } from "@/lib/database";
import { seedCourses, seedUsers } from "@/data/seedData";

export class DatabaseSeeder {
  private static instance: DatabaseSeeder;
  private isSeeding = false;

  static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder();
    }
    return DatabaseSeeder.instance;
  }

  async checkAndSeedDatabase(): Promise<void> {
    if (this.isSeeding) {
      console.log("Database seeding already in progress...");
      return;
    }

    try {
      this.isSeeding = true;
      console.log("Checking database content...");

      // Check if courses exist
      const existingCourses = await db.getAll("courses");
      const existingUsers = await db.getAll("users");

      let seededItems = 0;

      // Seed courses if empty
      if (existingCourses.length === 0) {
        console.log("No courses found. Seeding courses...");
        for (const course of seedCourses) {
          try {
            await db.add("courses", course);
            seededItems++;
            console.log(`✅ Added course: ${course.title}`);
          } catch (error) {
            console.error(`❌ Failed to add course ${course.title}:`, error);
          }
        }
        console.log(`🎯 Seeded ${seededItems} courses successfully!`);
      } else {
        console.log(`✅ Database already contains ${existingCourses.length} courses`);
      }

      // Seed users if empty (except for any that might exist from AuthContext)
      if (existingUsers.length === 0) {
        console.log("No users found. Seeding default users...");
        let userSeededItems = 0;
        for (const user of seedUsers) {
          try {
            await db.add("users", user);
            userSeededItems++;
            console.log(`✅ Added user: ${user.email} (${user.role})`);
          } catch (error) {
            console.error(`❌ Failed to add user ${user.email}:`, error);
          }
        }
        console.log(`👥 Seeded ${userSeededItems} users successfully!`);
      } else {
        console.log(`✅ Database already contains ${existingUsers.length} users`);
      }

      // Seed some sample enrollments for demo
      await this.seedSampleEnrollments();

    } catch (error) {
      console.error("❌ Error during database seeding:", error);
    } finally {
      this.isSeeding = false;
    }
  }

  private async seedSampleEnrollments(): Promise<void> {
    try {
      const existingEnrollments = await db.getAll("enrollments");
      if (existingEnrollments.length > 0) {
        console.log(`✅ Database already contains ${existingEnrollments.length} enrollments`);
        return;
      }

      const users = await db.getAll("users");
      const courses = await db.getAll("courses");
      
      if (users.length === 0 || courses.length === 0) {
        console.log("⚠️ No users or courses found, skipping enrollment seeding");
        return;
      }

      // Create sample enrollments
      const sampleEnrollments = [
        {
          id: "enrollment_1",
          userId: "student_demo",
          courseId: "course_react_fundamentals",
          enrollmentDate: new Date().toISOString(),
          status: "active",
          progress: 25
        },
        {
          id: "enrollment_2", 
          userId: "student_demo",
          courseId: "course_web_design_fundamentals",
          enrollmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          status: "completed",
          progress: 100
        },
        {
          id: "enrollment_3",
          userId: "admin_user",
          courseId: "course_python_data_science", 
          enrollmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          status: "active",
          progress: 60
        }
      ];

      let enrollmentCount = 0;
      for (const enrollment of sampleEnrollments) {
        try {
          await db.add("enrollments", enrollment);
          enrollmentCount++;
          console.log(`✅ Added enrollment: User ${enrollment.userId} -> Course ${enrollment.courseId}`);
        } catch (error) {
          console.error(`❌ Failed to add enrollment:`, error);
        }
      }

      console.log(`📚 Seeded ${enrollmentCount} sample enrollments!`);

    } catch (error) {
      console.error("❌ Error seeding sample enrollments:", error);
    }
  }

  async seedSampleProgress(): Promise<void> {
    try {
      const existingProgress = await db.getAll("userProgress");
      if (existingProgress.length > 0) {
        console.log(`✅ Database already contains ${existingProgress.length} progress records`);
        return;
      }

      const sampleProgress = [
        {
          id: "student_demo_course_react_fundamentals",
          userId: "student_demo",
          courseId: "course_react_fundamentals",
          completedContent: ["content_1"],
          lastAccessed: new Date(),
          completionPercentage: 33
        },
        {
          id: "student_demo_course_web_design_fundamentals", 
          userId: "student_demo",
          courseId: "course_web_design_fundamentals",
          completedContent: ["content_web_1", "content_web_2"],
          lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          completionPercentage: 100
        },
        {
          id: "admin_user_course_python_data_science",
          userId: "admin_user", 
          courseId: "course_python_data_science",
          completedContent: ["content_py_1"],
          lastAccessed: new Date(),
          completionPercentage: 50
        }
      ];

      let progressCount = 0;
      for (const progress of sampleProgress) {
        try {
          await db.add("userProgress", progress);
          progressCount++;
          console.log(`✅ Added progress: ${progress.userId} - ${progress.completionPercentage}%`);
        } catch (error) {
          console.error(`❌ Failed to add progress:`, error);
        }
      }

      console.log(`📈 Seeded ${progressCount} progress records!`);

    } catch (error) {
      console.error("❌ Error seeding sample progress:", error);
    }
  }

  async clearDatabase(): Promise<void> {
    try {
      console.log("🗑️ Clearing database...");
      
      const stores = ["courses", "users", "enrollments", "userProgress", "quizResults", "quizAnswers"];
      
      for (const store of stores) {
        const items = await db.getAll(store);
        for (const item of items) {
          await db.delete(store, item.id);
        }
        console.log(`✅ Cleared ${items.length} items from ${store}`);
      }
      
      console.log("🧹 Database cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing database:", error);
    }
  }
}

// Export singleton instance
export const dbSeeder = DatabaseSeeder.getInstance();
