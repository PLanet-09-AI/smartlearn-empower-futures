import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Course } from "@/types";

interface CourseLibraryProps {
  userRole: 'learner' | 'educator' | 'admin';
  onCourseSelect: (courseId: number) => void;
}

const CourseLibrary = ({ userRole, onCourseSelect }: CourseLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.",
      category: "Programming",
      level: "Beginner",
      duration: "6 weeks",
      rating: 4.8,
      students: 1234,
      instructor: "Sarah Johnson",
      thumbnail: "/placeholder.svg?height=200&width=300",
      content: [
        {
          id: 1,
          title: "What is Web Development?",
          type: "text",
          duration: "10 min",
          content: `Web development is the process of creating websites and web applications that run on the internet or intranet. It involves several aspects including web design, web content development, client-side/server-side scripting, and network security configuration.

There are three main types of web development:

1. Front-end Development: This involves creating the visual and interactive elements that users see and interact with directly. Technologies include HTML (structure), CSS (styling), and JavaScript (interactivity).

2. Back-end Development: This involves server-side programming, databases, and application architecture. Common technologies include Python, Java, PHP, Node.js, and databases like MySQL or MongoDB.

3. Full-stack Development: This combines both front-end and back-end development skills, allowing developers to work on complete web applications.

Modern web development also includes concepts like responsive design (making websites work on all devices), web accessibility (ensuring websites are usable by people with disabilities), and performance optimization (making websites load fast).

The field is constantly evolving with new frameworks, tools, and best practices emerging regularly. Popular frameworks today include React, Angular, Vue.js for front-end, and Express.js, Django, Ruby on Rails for back-end development.`
        },
        {
          id: 2,
          title: "HTML Fundamentals",
          type: "video",
          duration: "25 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
          content: "Learn the structure and syntax of HTML, the markup language that forms the backbone of web pages."
        },
        {
          id: 3,
          title: "CSS Styling Basics",
          type: "text",
          duration: "15 min",
          content: `CSS (Cascading Style Sheets) is used to style and layout web pages. It controls the visual presentation of HTML elements.

Key CSS Concepts:

1. Selectors: These target HTML elements to apply styles. Examples include:
   - Element selectors: p, h1, div
   - Class selectors: .my-class
   - ID selectors: #my-id

2. Properties and Values: CSS properties define what aspect to style, and values specify how:
   - color: blue;
   - font-size: 16px;
   - margin: 10px;

3. Box Model: Every HTML element is a rectangular box with:
   - Content: The actual content
   - Padding: Space between content and border
   - Border: The edge of the element
   - Margin: Space outside the border

4. Layout: CSS provides several layout methods:
   - Flexbox: For one-dimensional layouts
   - Grid: For two-dimensional layouts
   - Float: Older method, still useful for text wrapping

5. Responsive Design: Making websites work on all screen sizes using:
   - Media queries
   - Flexible units (%, em, rem, vw, vh)
   - Flexible layouts

Best practices include organizing CSS with meaningful class names, avoiding inline styles, and using external stylesheets for maintainability.`
        },
        {
          id: 4,
          title: "JavaScript Introduction",
          type: "video",
          duration: "30 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
          content: "Introduction to JavaScript programming language and its role in web development."
        }
      ],
      quiz: {
        title: "Web Development Fundamentals Quiz",
        questions: [
          {
            id: 1,
            question: "What does HTML stand for?",
            options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Which of the following is used for styling web pages?",
            options: ["HTML", "CSS", "JavaScript", "Python"],
            correctAnswer: 1
          },
          {
            id: 3,
            question: "What are the three main types of web development?",
            options: ["HTML, CSS, JavaScript", "Client, Server, Database", "Front-end, Back-end, Full-stack", "Design, Development, Deployment"],
            correctAnswer: 2
          }
        ]
      }
    },
    {
      id: 2,
      title: "Digital Marketing Essentials",
      description: "Master the fundamentals of digital marketing including SEO, social media, and content marketing.",
      category: "Marketing",
      level: "Intermediate",
      duration: "4 weeks",
      rating: 4.6,
      students: 856,
      instructor: "Michael Chen",
      thumbnail: "/placeholder.svg?height=200&width=300",
      content: [
        {
          id: 1,
          title: "Introduction to Digital Marketing",
          type: "text",
          duration: "12 min",
          content: `Digital marketing encompasses all marketing efforts that use electronic devices or the internet. It's how businesses connect with customers where they spend much of their time: online.

Key Components of Digital Marketing:

1. Search Engine Optimization (SEO): Optimizing your website to rank higher in search engine results pages, increasing organic traffic.

2. Pay-Per-Click (PPC): Paid advertising where you pay each time someone clicks your ad. Google Ads is the most popular platform.

3. Social Media Marketing: Using platforms like Facebook, Instagram, Twitter, LinkedIn to build brand awareness and engage with customers.

4. Content Marketing: Creating and sharing valuable content to attract and retain customers. This includes blogs, videos, podcasts, and infographics.

5. Email Marketing: Sending targeted messages to prospects and customers via email to nurture relationships and drive sales.

6. Affiliate Marketing: Partnering with other businesses or individuals to promote your products in exchange for a commission.

7. Marketing Automation: Using software to automate repetitive marketing tasks and personalize customer experiences.

The digital marketing landscape is constantly evolving with new platforms, technologies, and consumer behaviors. Success requires staying updated with trends, understanding your audience, and continuously testing and optimizing campaigns.

Metrics and analytics are crucial in digital marketing, allowing marketers to track performance, measure ROI, and make data-driven decisions.`
        },
        {
          id: 2,
          title: "SEO Fundamentals",
          type: "video",
          duration: "28 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
          content: "Learn the basics of Search Engine Optimization and how to improve your website's visibility."
        },
        {
          id: 3,
          title: "Social Media Strategy",
          type: "text",
          duration: "18 min",
          content: `A successful social media strategy requires careful planning, consistent execution, and regular analysis. Here's how to build an effective strategy:

1. Define Your Goals:
   - Brand awareness
   - Lead generation
   - Customer engagement
   - Sales conversion
   - Customer service

2. Know Your Audience:
   - Demographics (age, location, gender)
   - Interests and behaviors
   - Platform preferences
   - Pain points and challenges

3. Choose the Right Platforms:
   - Facebook: Great for community building and diverse content
   - Instagram: Visual content, younger demographics
   - LinkedIn: B2B marketing, professional networking
   - Twitter: Real-time engagement, news, customer service
   - TikTok: Short-form video, Gen Z audience
   - YouTube: Long-form video content, tutorials

4. Content Strategy:
   - Mix of content types (educational, entertaining, promotional)
   - Consistent brand voice and visual identity
   - User-generated content
   - Behind-the-scenes content
   - Industry news and trends

5. Posting Schedule:
   - Consistency is key
   - Optimal posting times for each platform
   - Content calendar planning
   - Seasonal and trending topics

6. Engagement:
   - Respond to comments and messages promptly
   - Join conversations in your industry
   - Share and comment on others' content
   - Run contests and giveaways

7. Analytics and Optimization:
   - Track key metrics (reach, engagement, clicks, conversions)
   - A/B test different content types
   - Adjust strategy based on performance data`
        },
        {
          id: 4,
          title: "Content Marketing Strategies",
          type: "video",
          duration: "22 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
          content: "Discover how to create compelling content that attracts and engages your target audience."
        }
      ],
      quiz: {
        title: "Digital Marketing Knowledge Check",
        questions: [
          {
            id: 1,
            question: "What does SEO stand for?",
            options: ["Social Engine Optimization", "Search Engine Optimization", "Site Enhancement Operation", "Social Engagement Optimization"],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "Which platform is best for B2B marketing?",
            options: ["TikTok", "Instagram", "LinkedIn", "Snapchat"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "What is the main goal of content marketing?",
            options: ["Direct sales", "Attract and retain customers", "Increase website speed", "Reduce costs"],
            correctAnswer: 1
          }
        ]
      }
    },
    {
      id: 3,
      title: "Data Science with Python",
      description: "Learn data analysis, visualization, and machine learning using Python and popular libraries.",
      category: "Data Science",
      level: "Advanced",
      duration: "10 weeks",
      rating: 4.9,
      students: 2341,
      instructor: "Dr. Emily Rodriguez",
      thumbnail: "/placeholder.svg?height=200&width=300",
      content: [
        {
          id: 1,
          title: "Introduction to Data Science",
          type: "text",
          duration: "15 min",
          content: `Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.

The Data Science Process:

1. Problem Definition: Understanding the business problem and defining success metrics.

2. Data Collection: Gathering relevant data from various sources including databases, APIs, web scraping, surveys, and sensors.

3. Data Cleaning: Handling missing values, removing duplicates, fixing errors, and standardizing formats. This often takes 60-80% of a data scientist's time.

4. Exploratory Data Analysis (EDA): Understanding data through statistical summaries, visualizations, and identifying patterns, trends, and anomalies.

5. Feature Engineering: Creating new variables from existing data to improve model performance.

6. Model Building: Applying statistical and machine learning algorithms to make predictions or discover insights.

7. Model Evaluation: Testing model performance using appropriate metrics and validation techniques.

8. Deployment: Implementing the model in production systems where it can provide value.

9. Monitoring: Continuously tracking model performance and updating as needed.

Key Skills for Data Scientists:
- Programming (Python/R)
- Statistics and Mathematics
- Machine Learning
- Data Visualization
- Domain Knowledge
- Communication Skills

Popular Python Libraries:
- Pandas: Data manipulation and analysis
- NumPy: Numerical computing
- Matplotlib/Seaborn: Data visualization
- Scikit-learn: Machine learning
- TensorFlow/PyTorch: Deep learning

Applications include recommendation systems, fraud detection, predictive maintenance, medical diagnosis, and autonomous vehicles.`
        },
        {
          id: 2,
          title: "Python for Data Analysis",
          type: "video",
          duration: "35 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
          content: "Learn how to use Python libraries like Pandas and NumPy for data manipulation and analysis."
        },
        {
          id: 3,
          title: "Data Visualization Techniques",
          type: "text",
          duration: "20 min",
          content: `Data visualization is the graphical representation of information and data. It helps communicate insights clearly and enables decision-makers to see analytics presented visually.

Types of Visualizations:

1. Bar Charts: Comparing categories or showing changes over time
2. Line Charts: Showing trends over continuous data
3. Scatter Plots: Showing relationships between two variables
4. Histograms: Showing distribution of a single variable
5. Box Plots: Showing distribution and identifying outliers
6. Heatmaps: Showing correlation or intensity across two dimensions
7. Pie Charts: Showing parts of a whole (use sparingly)

Best Practices:

1. Choose the Right Chart Type:
   - Match the visualization to your data type and message
   - Consider your audience's familiarity with different chart types

2. Keep It Simple:
   - Avoid unnecessary decorations
   - Use clear, descriptive titles and labels
   - Limit colors and fonts

3. Design for Accessibility:
   - Use colorblind-friendly palettes
   - Ensure sufficient contrast
   - Provide alternative text descriptions

4. Tell a Story:
   - Guide the viewer's attention
   - Highlight key insights
   - Provide context and interpretation

Python Visualization Libraries:

1. Matplotlib: Low-level plotting library, highly customizable
2. Seaborn: Statistical plotting, built on matplotlib
3. Plotly: Interactive visualizations
4. Bokeh: Interactive web-based visualizations
5. Altair: Grammar of graphics approach

Tools and Platforms:
- Jupyter Notebooks: Interactive development
- Tableau: Professional visualization software
- Power BI: Microsoft's business intelligence tool
- D3.js: Web-based interactive visualizations

Remember: The goal is insight, not just pretty pictures. Always consider what story your visualization tells and whether it accurately represents the data.`
        },
        {
          id: 4,
          title: "Machine Learning Basics",
          type: "video",
          duration: "40 min",
          videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
          content: "Introduction to machine learning concepts and algorithms using Python and scikit-learn."
        }
      ],
      quiz: {
        title: "Data Science Fundamentals Assessment",
        questions: [
          {
            id: 1,
            question: "Which Python library is primarily used for data manipulation?",
            options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "What percentage of a data scientist's time is typically spent on data cleaning?",
            options: ["20-30%", "40-50%", "60-80%", "90-95%"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "Which type of chart is best for showing trends over time?",
            options: ["Bar chart", "Pie chart", "Line chart", "Scatter plot"],
            correctAnswer: 2
          }
        ]
      }
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || course.category === selectedCategory)
  );

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Library</h1>
        {userRole === 'admin' && (
          <Button>Add New Course</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filters */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter courses based on your interests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  type="search"
                  id="search"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course List */}
        <div className="md:col-span-3">
          <ScrollArea className="h-[650px] w-full rounded-md border">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => onCourseSelect(course.id)}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={course.thumbnail} alt={course.title} />
                        <AvatarFallback>{course.instructor.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{course.instructor}</p>
                        <p className="text-sm text-muted-foreground">Instructor</p>
                      </div>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{course.category}</Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{course.rating}</span>
                        <span>⭐</span>
                        <span className="text-sm text-gray-500">({course.students})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredCourses.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-lg font-medium">No courses found.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CourseLibrary;
