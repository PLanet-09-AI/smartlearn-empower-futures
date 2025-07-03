import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Clock, Users, Star, Search, Filter, Award, CheckCircle, Play, FileText } from "lucide-react";
import CourseContent from "./CourseContent";

interface CourseLibraryProps {
  userRole: 'learner' | 'educator' | 'admin';
}

const CourseLibrary = ({ userRole }: CourseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [viewingCourse, setViewingCourse] = useState<any>(null);

  const courses = [
    {
      id: 1,
      title: "Data Analytics Fundamentals",
      description: "Learn the basics of data analysis, visualization, and interpretation using modern tools and techniques.",
      fullDescription: "This comprehensive course introduces students to the world of data analytics. You'll learn to collect, process, and analyze data using industry-standard tools like Excel, Python, and SQL. The course covers statistical analysis, data visualization, and practical applications in business intelligence. Perfect for beginners looking to enter the data field or professionals wanting to enhance their analytical skills.",
      category: "Data Analytics",
      level: "Beginner",
      duration: "6 weeks",
      students: 245,
      rating: 4.8,
      instructor: "Dr. Sarah Chen",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      prerequisites: ["Basic Mathematics", "Computer Literacy"],
      learningObjectives: [
        "Understand fundamental data analysis concepts",
        "Create compelling data visualizations",
        "Perform statistical analysis on datasets",
        "Build interactive dashboards",
        "Apply data-driven decision making"
      ],
      curriculum: [
        "Introduction to Data Analytics",
        "Excel for Data Analysis",
        "Introduction to Python/R",
        "Statistical Analysis Fundamentals",
        "Data Visualization Techniques",
        "Business Intelligence Basics",
        "Final Project: Real-world Analysis"
      ],
      completionRate: 89,
      certificates: true,
      content: [
        {
          id: 1,
          title: "Introduction to Data Analytics",
          type: "video",
          duration: "15 mins",
          content: "Welcome to Data Analytics! In this module, we'll explore what data analytics is and why it's crucial in today's business world. Data analytics is the process of examining datasets to draw conclusions about the information they contain."
        },
        {
          id: 2,
          title: "Understanding Data Types",
          type: "text",
          content: "Data comes in various forms: Quantitative data (numerical) includes discrete data (counts) and continuous data (measurements). Qualitative data (categorical) includes nominal data (categories without order) and ordinal data (categories with order). Understanding these types is fundamental to choosing the right analysis methods."
        },
        {
          id: 3,
          title: "Excel Basics for Analysis",
          type: "video",
          duration: "25 mins",
          content: "Excel is a powerful tool for data analysis. We'll cover formulas, pivot tables, and basic charting. Learn how to clean data, perform calculations, and create meaningful visualizations."
        },
        {
          id: 4,
          title: "Statistical Measures",
          type: "text",
          content: "Key statistical measures include: Mean (average), Median (middle value), Mode (most frequent value), Standard deviation (measure of spread), Variance (measure of variability). These measures help us understand our data's central tendency and distribution."
        }
      ],
      quiz: {
        title: "Data Analytics Fundamentals Quiz",
        questions: [
          {
            id: 1,
            question: "What is the difference between discrete and continuous data?",
            type: "multiple-choice",
            options: [
              "Discrete data can be counted, continuous data can be measured",
              "Discrete data is qualitative, continuous data is quantitative",
              "There is no difference",
              "Discrete data is always larger than continuous data"
            ],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Which measure of central tendency is least affected by outliers?",
            type: "multiple-choice",
            options: ["Mean", "Median", "Mode", "Range"],
            correctAnswer: 1
          },
          {
            id: 3,
            question: "Excel pivot tables are used for:",
            type: "multiple-choice",
            options: [
              "Data visualization only",
              "Data summarization and analysis",
              "Data entry only",
              "Creating databases"
            ],
            correctAnswer: 1
          }
        ]
      }
    },
    {
      id: 2,
      title: "Advanced Data Science with Machine Learning",
      description: "Master machine learning algorithms, statistical modeling, and big data processing techniques.",
      fullDescription: "Advanced course covering machine learning algorithms, deep learning, and AI applications. Students will work with large datasets, implement ML models from scratch, and deploy solutions in production environments. This course is designed for data professionals who want to advance their careers in AI and machine learning.",
      category: "Data Science",
      level: "Advanced",
      duration: "12 weeks",
      students: 156,
      rating: 4.9,
      instructor: "Prof. Michael Torres",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=200&fit=crop",
      prerequisites: ["Python Programming", "Statistics", "Linear Algebra", "Basic Machine Learning"],
      learningObjectives: [
        "Implement machine learning algorithms from scratch",
        "Work with neural networks and deep learning",
        "Handle big data processing with Spark",
        "Deploy ML models in production",
        "Apply MLOps best practices"
      ],
      curriculum: [
        "Machine Learning Fundamentals Review",
        "Supervised Learning Algorithms",
        "Unsupervised Learning Techniques",
        "Deep Learning and Neural Networks",
        "Natural Language Processing",
        "Computer Vision Applications",
        "MLOps and Model Deployment",
        "Ethics in AI",
        "Capstone Project"
      ],
      completionRate: 76,
      certificates: true,
      content: [
        {
          id: 1,
          title: "Machine Learning Overview",
          type: "video",
          duration: "20 mins",
          content: "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without explicit programming. We'll explore supervised, unsupervised, and reinforcement learning paradigms."
        },
        {
          id: 2,
          title: "Linear Regression Deep Dive",
          type: "text",
          content: "Linear regression finds the best line through data points. The equation y = mx + b represents this relationship. We minimize the sum of squared errors to find optimal parameters. Key concepts: gradient descent, cost function, and feature scaling."
        },
        {
          id: 3,
          title: "Neural Networks Fundamentals",
          type: "video",
          duration: "30 mins",
          content: "Neural networks mimic the human brain's structure. Each neuron receives inputs, applies weights, adds bias, and passes through an activation function. Multiple layers create deep networks capable of complex pattern recognition."
        },
        {
          id: 4,
          title: "Model Evaluation Metrics",
          type: "text",
          content: "For classification: Accuracy, Precision, Recall, F1-score, ROC-AUC. For regression: MAE, MSE, RMSE, R-squared. Cross-validation helps assess model generalization. Understanding these metrics is crucial for model selection and improvement."
        }
      ],
      quiz: {
        title: "Advanced Data Science Quiz",
        questions: [
          {
            id: 1,
            question: "What is the main purpose of gradient descent?",
            type: "multiple-choice",
            options: [
              "To increase model complexity",
              "To minimize the cost function",
              "To add more features",
              "To reduce training time"
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "In a neural network, what does the activation function do?",
            type: "multiple-choice",
            options: [
              "It determines the learning rate",
              "It introduces non-linearity to the model",
              "It calculates the cost function",
              "It initializes the weights"
            ],
            correctAnswer: 1
          },
          {
            id: 3,
            question: "Which metric is best for imbalanced classification problems?",
            type: "multiple-choice",
            options: ["Accuracy", "F1-score", "MAE", "R-squared"],
            correctAnswer: 1
          }
        ]
      }
    },
    {
      id: 3,
      title: "Full-Stack Web Development Bootcamp",
      description: "Build modern web applications using React, Node.js, and database technologies.",
      fullDescription: "Comprehensive bootcamp covering frontend and backend development. Learn to build scalable web applications using modern frameworks and tools. This intensive program covers everything from HTML/CSS basics to advanced React patterns, backend APIs, database design, and deployment strategies.",
      category: "Web Development",
      level: "Intermediate",
      duration: "16 weeks",
      students: 398,
      rating: 4.7,
      instructor: "Alex Rodriguez",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
      prerequisites: ["HTML/CSS Basics", "JavaScript Fundamentals"],
      learningObjectives: [
        "Build responsive web applications",
        "Develop RESTful APIs",
        "Implement user authentication",
        "Work with databases effectively",
        "Deploy applications to cloud platforms"
      ],
      curriculum: [
        "Advanced HTML/CSS and Responsive Design",
        "JavaScript ES6+ Features",
        "React.js Fundamentals",
        "State Management with Redux",
        "Node.js and Express.js",
        "Database Design and MongoDB",
        "Authentication and Security",
        "Testing and Debugging",
        "DevOps and Deployment",
        "Full-Stack Project Portfolio"
      ],
      completionRate: 82,
      certificates: true,
      content: [
        {
          id: 1,
          title: "Modern HTML & CSS",
          type: "video",
          duration: "18 mins",
          content: "Modern web development starts with semantic HTML5 and CSS3. We'll explore flexbox, grid layout, and responsive design principles. Learn to create layouts that work across all devices."
        },
        {
          id: 2,
          title: "JavaScript ES6+ Features",
          type: "text",
          content: "ES6 introduced powerful features: Arrow functions, Template literals, Destructuring, Spread operator, Promises, Async/await. These features make JavaScript more expressive and easier to work with in modern applications."
        },
        {
          id: 3,
          title: "React Component Architecture",
          type: "video",
          duration: "25 mins",
          content: "React components are the building blocks of modern web applications. Learn about functional components, hooks, props, and state management. Understanding component lifecycle and composition patterns is essential."
        },
        {
          id: 4,
          title: "RESTful API Design",
          type: "text",
          content: "REST (Representational State Transfer) principles guide API design. Use HTTP methods appropriately: GET (retrieve), POST (create), PUT (update), DELETE (remove). Proper status codes and resource naming create intuitive APIs."
        }
      ],
      quiz: {
        title: "Full-Stack Development Quiz",
        questions: [
          {
            id: 1,
            question: "What is the purpose of the virtual DOM in React?",
            type: "multiple-choice",
            options: [
              "To make the app faster by avoiding real DOM manipulation",
              "To store application state",
              "To handle HTTP requests",
              "To manage component lifecycle"
            ],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Which HTTP method should be used to update an existing resource?",
            type: "multiple-choice",
            options: ["GET", "POST", "PUT", "DELETE"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "What is the main advantage of using arrow functions in JavaScript?",
            type: "multiple-choice",
            options: [
              "They are faster to execute",
              "They automatically bind 'this' context",
              "They use less memory",
              "They can only be used in classes"
            ],
            correctAnswer: 1
          }
        ]
      }
    },
    {
      id: 4,
      title: "Digital Marketing Mastery",
      description: "Learn SEO, social media marketing, content strategy, and analytics for digital success.",
      fullDescription: "Master the art and science of digital marketing. This course covers all aspects of modern digital marketing including SEO, social media marketing, content marketing, email marketing, PPC advertising, and analytics. Perfect for entrepreneurs, marketers, and business owners.",
      category: "Digital Marketing",
      level: "Beginner",
      duration: "8 weeks",
      students: 567,
      rating: 4.6,
      instructor: "Emma Thompson",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=300&h=200&fit=crop",
      prerequisites: ["Basic Computer Skills", "Internet Familiarity"],
      learningObjectives: [
        "Develop comprehensive digital marketing strategies",
        "Master SEO and content marketing",
        "Create effective social media campaigns",
        "Understand PPC advertising and email marketing",
        "Analyze marketing performance with data"
      ],
      curriculum: [
        "Digital Marketing Fundamentals",
        "Search Engine Optimization (SEO)",
        "Content Marketing Strategy",
        "Social Media Marketing",
        "Email Marketing Campaigns",
        "Pay-Per-Click (PPC) Advertising",
        "Marketing Analytics and ROI",
        "Marketing Automation",
        "Campaign Management Project"
      ],
      completionRate: 91,
      certificates: true,
      content: [
        {
          id: 1,
          title: "Introduction to Digital Marketing",
          type: "video",
          duration: "20 mins",
          content: "Digital marketing is the promotion of products or brands via electronic media. We'll cover the basics and importance of digital marketing in today's business landscape."
        },
        {
          id: 2,
          title: "SEO Fundamentals",
          type: "text",
          content: "Search Engine Optimization (SEO) improves website visibility. Learn about keywords, on-page SEO, backlinks, and technical SEO to boost your site's ranking."
        },
        {
          id: 3,
          title: "Social Media Strategies",
          type: "video",
          duration: "25 mins",
          content: "Effective social media marketing involves content creation, audience engagement, and analytics. We'll explore platforms like Facebook, Instagram, and LinkedIn."
        },
        {
          id: 4,
          title: "Analyzing Campaign Performance",
          type: "text",
          content: "Use tools like Google Analytics to measure campaign success. Understand metrics such as CTR, conversion rate, and ROI to optimize marketing efforts."
        }
      ],
      quiz: {
        title: "Digital Marketing Quiz",
        questions: [
          {
            id: 1,
            question: "What does SEO stand for?",
            type: "multiple-choice",
            options: [
              "Search Engine Optimization",
              "Social Engagement Online",
              "Sales and Earnings Overview",
              "Search Email Outreach"
            ],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Which platform is best for B2B marketing?",
            type: "multiple-choice",
            options: ["Facebook", "Instagram", "LinkedIn", "TikTok"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "What metric measures the percentage of people who clicked an ad?",
            type: "multiple-choice",
            options: ["CTR", "ROI", "Bounce Rate", "Impressions"],
            correctAnswer: 0
          }
        ]
      }
    },
    {
      id: 5,
      title: "Software Development Principles",
      description: "Master software engineering best practices, design patterns, and development methodologies.",
      fullDescription: "Learn the fundamental principles of software development including clean code practices, design patterns, testing strategies, and agile methodologies. This course is essential for anyone serious about becoming a professional software developer.",
      category: "Software Development",
      level: "Intermediate",
      duration: "10 weeks",
      students: 289,
      rating: 4.8,
      instructor: "David Kim",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop",
      prerequisites: ["Programming Experience", "Basic Data Structures", "Object-Oriented Programming"],
      learningObjectives: [
        "Write clean, maintainable code",
        "Implement common design patterns",
        "Apply test-driven development",
        "Understand software architecture",
        "Use version control effectively"
      ],
      curriculum: [
        "Clean Code Principles",
        "Object-Oriented Design Patterns",
        "Test-Driven Development",
        "Software Architecture Fundamentals",
        "Version Control with Git",
        "Agile Development Methodologies",
        "Code Review Best Practices",
        "Refactoring Techniques",
        "Software Project Management"
      ],
      completionRate: 85,
      certificates: true,
      content: [
        {
          id: 1,
          title: "Clean Code Basics",
          type: "video",
          duration: "20 mins",
          content: "Writing clean code improves readability and maintainability. We'll cover naming conventions, functions, and formatting."
        },
        {
          id: 2,
          title: "Design Patterns Overview",
          type: "text",
          content: "Common design patterns include Singleton, Factory, Observer, and Strategy. These patterns solve recurring design problems."
        },
        {
          id: 3,
          title: "Test-Driven Development",
          type: "video",
          duration: "25 mins",
          content: "TDD involves writing tests before code. Learn how to write unit tests and use testing frameworks."
        },
        {
          id: 4,
          title: "Agile Methodologies",
          type: "text",
          content: "Agile promotes iterative development and collaboration. Understand Scrum, Kanban, and sprint planning."
        }
      ],
      quiz: {
        title: "Software Development Principles Quiz",
        questions: [
          {
            id: 1,
            question: "What is the main benefit of clean code?",
            type: "multiple-choice",
            options: [
              "Faster execution",
              "Easier maintenance and readability",
              "More features",
              "Less memory usage"
            ],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "Which design pattern ensures a class has only one instance?",
            type: "multiple-choice",
            options: ["Factory", "Singleton", "Observer", "Strategy"],
            correctAnswer: 1
          },
          {
            id: 3,
            question: "What does TDD stand for?",
            type: "multiple-choice",
            options: [
              "Test-Driven Development",
              "Time-Dependent Design",
              "Total Data Deployment",
              "Technical Design Document"
            ],
            correctAnswer: 0
          }
        ]
      }
    },
    {
      id: 6,
      title: "Mobile App Development with React Native",
      description: "Create native and cross-platform mobile applications for iOS and Android.",
      fullDescription: "Build beautiful, performant mobile apps using React Native. This course covers everything from setting up your development environment to publishing apps in the App Store and Google Play Store. Learn to create apps that work seamlessly on both iOS and Android platforms.",
      category: "Mobile Development",
      level: "Advanced",
      duration: "14 weeks",
      students: 134,
      rating: 4.9,
      instructor: "Lisa Park",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
      prerequisites: ["React.js Knowledge", "JavaScript ES6+", "Mobile Development Basics"],
      learningObjectives: [
        "Build cross-platform mobile applications",
        "Implement native device features",
        "Handle app state and navigation",
        "Optimize app performance",
        "Publish apps to app stores"
      ],
      curriculum: [
        "React Native Fundamentals",
        "Navigation and Routing",
        "State Management in Mobile Apps",
        "Native Device Features",
        "UI/UX Design for Mobile",
        "Performance Optimization",
        "Testing Mobile Applications",
        "App Store Deployment",
        "Mobile App Portfolio Project"
      ],
      completionRate: 78,
      certificates: true,
      content: [
        {
          id: 1,
          title: "React Native Setup",
          type: "video",
          duration: "15 mins",
          content: "Set up your development environment for React Native on Windows, macOS, and Linux. Learn about Expo and CLI options."
        },
        {
          id: 2,
          title: "Navigation Basics",
          type: "text",
          content: "Learn to navigate between screens using React Navigation. Understand stack, tab, and drawer navigators."
        },
        {
          id: 3,
          title: "State Management",
          type: "video",
          duration: "20 mins",
          content: "Manage app state using Context API and Redux. Learn best practices for state updates and performance."
        },
        {
          id: 4,
          title: "Publishing Apps",
          type: "text",
          content: "Prepare your app for publishing on App Store and Google Play. Learn about signing, building, and submission processes."
        }
      ],
      quiz: {
        title: "Mobile App Development Quiz",
        questions: [
          {
            id: 1,
            question: "What tool can be used to quickly start a React Native project?",
            type: "multiple-choice",
            options: ["Expo", "Create React App", "Next.js", "Gatsby"],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Which library is commonly used for navigation in React Native?",
            type: "multiple-choice",
            options: ["React Router", "React Navigation", "Redux", "MobX"],
            correctAnswer: 1
          },
          {
            id: 3,
            question: "What is the purpose of signing an app before publishing?",
            type: "multiple-choice",
            options: [
              "To encrypt the app",
              "To verify the developer's identity",
              "To reduce app size",
              "To improve performance"
            ],
            correctAnswer: 1
          }
        ]
      }
    },
  ];

  const categories = ["all", "Data Analytics", "Data Science", "Web Development", "Digital Marketing", "Software Development", "Mobile Development"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'secondary';
      case 'Intermediate':
        return 'default';
      case 'Advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleEnroll = (courseId: number) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId]);
    }
    const course = courses.find(c => c.id === courseId);
    setViewingCourse(course);
  };

  const isEnrolled = (courseId: number) => enrolledCourses.includes(courseId);

  if (viewingCourse) {
    return (
      <CourseContent 
        course={viewingCourse} 
        onBack={() => setViewingCourse(null)}
        userRole={userRole}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level === "all" ? "All Levels" : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <div className="aspect-video bg-gray-200 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
            
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={getLevelBadgeVariant(course.level)}>
                  {course.level}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>
              
              <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-green-600 font-medium">
                  <span>FREE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>{course.completionRate}% completion</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-600">Instructor: </span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedCourse(course)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>{course.title}</span>
                        <Badge variant={getLevelBadgeVariant(course.level)}>
                          {course.level}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        Detailed course information and curriculum
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Course Overview</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Instructor:</strong> {course.instructor}</div>
                            <div><strong>Duration:</strong> {course.duration}</div>
                            <div><strong>Students:</strong> {course.students}</div>
                            <div><strong>Rating:</strong> {course.rating}/5</div>
                            <div><strong>Completion Rate:</strong> {course.completionRate}%</div>
                            {course.certificates && (
                              <div className="flex items-center">
                                <Award className="h-4 w-4 mr-1 text-yellow-500" />
                                <span>Certificate Available</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Course Description</h4>
                        <p className="text-sm text-gray-600">{course.fullDescription}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Prerequisites</h4>
                        <div className="flex flex-wrap gap-2">
                          {course.prerequisites.map((prereq, index) => (
                            <Badge key={index} variant="outline">{prereq}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">What You'll Learn</h4>
                        <ul className="text-sm space-y-1">
                          {course.learningObjectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Course Curriculum</h4>
                        <div className="space-y-2">
                          {course.curriculum.map((module, index) => (
                            <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium text-blue-600 mr-3 w-6">
                                {index + 1}.
                              </span>
                              <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm">{module}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleEnroll(course.id)}
                >
                  {isEnrolled(course.id) ? 'Continue Learning' : 'Enroll Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CourseLibrary;
