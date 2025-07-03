
import { Course } from "@/types";

export const courses: Course[] = [
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
    title: "Data Science & Analytics",
    description: "Master data analysis, visualization, and machine learning with Python and popular data science libraries.",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 weeks",
    rating: 4.9,
    students: 856,
    instructor: "Dr. Michael Chen",
    thumbnail: "/placeholder.svg?height=200&width=300",
    content: [
      {
        id: 1,
        title: "Introduction to Data Science",
        type: "text",
        duration: "15 min",
        content: `Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.

Key Components of Data Science:

1. Statistics & Mathematics: The foundation for understanding data patterns, distributions, and relationships.

2. Programming: Essential for data manipulation, analysis, and automation. Python and R are the most popular languages.

3. Domain Expertise: Understanding the business or research context to ask the right questions and interpret results meaningfully.

4. Data Engineering: Skills to collect, clean, and prepare data for analysis.

5. Machine Learning: Algorithms that can learn patterns from data and make predictions or decisions.

The Data Science Process:
1. Problem Definition: Understanding what questions need to be answered
2. Data Collection: Gathering relevant data from various sources
3. Data Cleaning: Removing errors, inconsistencies, and irrelevant information
4. Exploratory Data Analysis: Understanding data patterns and relationships
5. Modeling: Building predictive or descriptive models
6. Validation: Testing model performance and accuracy
7. Deployment: Implementing solutions in production environments
8. Monitoring: Continuously evaluating and improving model performance

Data science applications span across industries including healthcare, finance, e-commerce, transportation, and entertainment.`
      },
      {
        id: 2,
        title: "Python for Data Science",
        type: "video",
        duration: "35 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
        content: "Learn Python fundamentals and essential libraries like NumPy, Pandas, and Matplotlib for data analysis."
      },
      {
        id: 3,
        title: "Data Visualization Techniques",
        type: "text",
        duration: "20 min",
        content: `Data visualization is the graphical representation of information and data. It helps in understanding trends, outliers, and patterns in data that might not be apparent in text-based data.

Types of Data Visualizations:

1. Bar Charts: Best for comparing categories or showing changes over time
2. Line Charts: Perfect for showing trends over continuous data
3. Scatter Plots: Excellent for showing relationships between two variables
4. Histograms: Great for showing distribution of numerical data
5. Box Plots: Useful for showing data distribution and identifying outliers
6. Heatmaps: Effective for showing correlation between variables
7. Pie Charts: Good for showing parts of a whole (use sparingly)

Key Principles of Effective Visualization:
- Choose the right chart type for your data
- Keep it simple and avoid clutter
- Use appropriate colors and contrast
- Provide clear labels and titles
- Consider your audience's needs
- Tell a story with your data

Popular Tools and Libraries:
- Python: Matplotlib, Seaborn, Plotly, Bokeh
- R: ggplot2, plotly, shiny
- JavaScript: D3.js, Chart.js
- Business Intelligence: Tableau, Power BI, Qlik

Best Practices:
1. Start with the message you want to convey
2. Choose visualizations that support your narrative
3. Use consistent color schemes and formatting
4. Make your visualizations interactive when appropriate
5. Always provide context and explanations`
      },
      {
        id: 4,
        title: "Machine Learning Basics",
        type: "video",
        duration: "40 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_7mb.mp4",
        content: "Introduction to machine learning algorithms, supervised and unsupervised learning, and practical applications."
      },
      {
        id: 5,
        title: "Statistical Analysis",
        type: "text",
        duration: "25 min",
        content: `Statistical analysis is the process of collecting, exploring, and presenting large amounts of data to discover underlying patterns and trends.

Key Statistical Concepts:

1. Descriptive Statistics:
   - Mean, Median, Mode: Measures of central tendency
   - Standard Deviation, Variance: Measures of spread
   - Quartiles and Percentiles: Position measures

2. Inferential Statistics:
   - Hypothesis Testing: Testing assumptions about populations
   - Confidence Intervals: Range of plausible values for parameters
   - P-values: Probability of observing results under null hypothesis

3. Correlation vs Causation:
   - Correlation measures relationship strength
   - Causation implies one variable causes another
   - Always be careful not to infer causation from correlation alone

4. Common Statistical Tests:
   - T-tests: Comparing means between groups
   - Chi-square tests: Testing relationships between categorical variables
   - ANOVA: Comparing means across multiple groups
   - Regression analysis: Modeling relationships between variables

5. Probability Distributions:
   - Normal Distribution: Bell curve, many natural phenomena
   - Binomial Distribution: Success/failure scenarios
   - Poisson Distribution: Rare events over time/space

Statistical Significance:
- Typically measured at 95% confidence level (p < 0.05)
- Indicates results are unlikely due to chance
- Consider practical significance alongside statistical significance

Data Quality Considerations:
- Sample size: Larger samples generally provide more reliable results
- Sampling bias: Ensure representative samples
- Data collection methods: Consistent and valid measurement
- Missing data: Handle appropriately to avoid bias`
      }
    ],
    quiz: {
      title: "Data Science Fundamentals Quiz",
      questions: [
        {
          id: 1,
          question: "Which Python library is primarily used for data manipulation and analysis?",
          options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "What is the difference between correlation and causation?",
          options: ["They are the same thing", "Correlation implies causation", "Causation implies correlation, but correlation doesn't imply causation", "There is no relationship between them"],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "Which visualization is best for showing the relationship between two numerical variables?",
          options: ["Bar chart", "Pie chart", "Scatter plot", "Histogram"],
          correctAnswer: 2
        },
        {
          id: 4,
          question: "What does a p-value less than 0.05 typically indicate?",
          options: ["The result is practically significant", "The result is statistically significant", "The null hypothesis is true", "The sample size is too small"],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 3,
    title: "Digital Marketing Mastery",
    description: "Learn comprehensive digital marketing strategies including SEO, social media, content marketing, and analytics.",
    category: "Marketing",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.7,
    students: 2103,
    instructor: "Emma Rodriguez",
    thumbnail: "/placeholder.svg?height=200&width=300",
    content: [
      {
        id: 1,
        title: "Digital Marketing Fundamentals",
        type: "text",
        duration: "12 min",
        content: `Digital marketing encompasses all marketing efforts that use electronic devices or the internet. It's how businesses connect with customers where they spend much of their time: online.

Core Components of Digital Marketing:

1. Search Engine Optimization (SEO):
   - Improving website visibility in search engine results
   - Keyword research and optimization
   - Technical SEO and site structure
   - Content optimization and link building

2. Pay-Per-Click Advertising (PPC):
   - Google Ads, Bing Ads
   - Social media advertising (Facebook, Instagram, LinkedIn)
   - Display advertising and remarketing
   - Budget management and bid optimization

3. Content Marketing:
   - Blog posts, articles, and educational content
   - Video marketing and podcasting
   - Infographics and visual content
   - Email newsletters and marketing campaigns

4. Social Media Marketing:
   - Platform-specific strategies (Facebook, Instagram, Twitter, LinkedIn)
   - Community building and engagement
   - Influencer partnerships
   - Social commerce and advertising

5. Email Marketing:
   - List building and segmentation
   - Automated campaigns and drip sequences
   - Personalization and A/B testing
   - Performance tracking and optimization

Digital Marketing Benefits:
- Global reach and targeted audiences
- Cost-effective compared to traditional marketing
- Measurable results and real-time analytics
- Personalization and customer segmentation
- Interactive engagement with customers

Key Metrics to Track:
- Website traffic and user behavior
- Conversion rates and ROI
- Social media engagement
- Email open and click-through rates
- Customer acquisition cost (CAC)
- Customer lifetime value (CLV)`
      },
      {
        id: 2,
        title: "SEO Fundamentals",
        type: "video",
        duration: "30 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4",
        content: "Learn the basics of Search Engine Optimization, keyword research, and on-page optimization techniques."
      },
      {
        id: 3,
        title: "Social Media Strategy",
        type: "text",
        duration: "18 min",
        content: `Social media marketing involves creating and sharing content on social media networks to achieve marketing and branding goals.

Platform-Specific Strategies:

1. Facebook:
   - Ideal for: Community building, detailed targeting, diverse content types
   - Best practices: Regular posting, engaging with comments, using Facebook Groups
   - Content types: Photos, videos, live streams, articles, events

2. Instagram:
   - Ideal for: Visual storytelling, younger demographics, brand awareness
   - Best practices: High-quality visuals, consistent aesthetic, strategic hashtags
   - Content types: Posts, Stories, Reels, IGTV, Shopping posts

3. LinkedIn:
   - Ideal for: B2B marketing, professional networking, thought leadership
   - Best practices: Industry insights, professional updates, networking
   - Content types: Articles, professional updates, company news, industry trends

4. Twitter:
   - Ideal for: Real-time engagement, news, customer service, trending topics
   - Best practices: Timely responses, hashtag participation, thread creation
   - Content types: Short updates, threads, images, polls, live tweeting

5. TikTok:
   - Ideal for: Gen Z audience, creative content, viral marketing
   - Best practices: Trendy content, music integration, authentic personality
   - Content types: Short videos, challenges, tutorials, behind-the-scenes

Social Media Marketing Best Practices:
- Define clear goals and target audience
- Create a content calendar and posting schedule
- Engage authentically with your community
- Use analytics to measure performance
- Adapt strategies based on platform algorithms
- Maintain consistent brand voice and visual identity
- Collaborate with influencers and brand advocates
- Monitor mentions and respond to feedback promptly

Content Creation Tips:
- Mix promotional and educational content (80/20 rule)
- Use user-generated content and testimonials
- Create platform-native content rather than cross-posting
- Experiment with different content formats
- Tell stories that resonate with your audience`
      },
      {
        id: 4,
        title: "Content Marketing Strategy",
        type: "video",
        duration: "28 min",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4",
        content: "Develop effective content marketing strategies that engage audiences and drive conversions."
      },
      {
        id: 5,
        title: "Email Marketing & Automation",
        type: "text",
        duration: "22 min",
        content: `Email marketing remains one of the highest ROI marketing channels, generating an average of $42 for every $1 spent.

Email Marketing Fundamentals:

1. List Building Strategies:
   - Lead magnets (eBooks, templates, courses)
   - Newsletter subscriptions with valuable content
   - Gated content and exclusive offers
   - Contest and giveaway entries
   - Website opt-in forms and pop-ups

2. Email Types and Campaigns:
   - Welcome series for new subscribers
   - Newsletter campaigns with regular updates
   - Promotional emails for sales and offers
   - Educational content and tutorials
   - Re-engagement campaigns for inactive subscribers
   - Abandoned cart recovery emails

3. Segmentation and Personalization:
   - Demographic segmentation (age, location, gender)
   - Behavioral segmentation (purchase history, website activity)
   - Psychographic segmentation (interests, values)
   - Lifecycle stage segmentation (new, active, churned)
   - Custom segmentation based on specific criteria

4. Email Design Best Practices:
   - Mobile-responsive design (60%+ open on mobile)
   - Clear and compelling subject lines
   - Scannable content with headers and bullets
   - Single, clear call-to-action (CTA)
   - Consistent branding and visual hierarchy

5. Automation and Drip Campaigns:
   - Welcome sequences for new subscribers
   - Educational email courses
   - Product recommendation engines
   - Birthday and anniversary emails
   - Win-back campaigns for inactive users

Key Metrics to Monitor:
- Open Rate: Percentage of recipients who open emails
- Click-Through Rate (CTR): Percentage who click links
- Conversion Rate: Percentage who complete desired action
- Unsubscribe Rate: Rate of list attrition
- Deliverability Rate: Emails reaching inboxes
- Revenue Per Email: Direct revenue attribution

Deliverability Best Practices:
- Use double opt-in for subscribers
- Maintain good sender reputation
- Avoid spam trigger words
- Regular list cleaning and maintenance
- Authentication with SPF, DKIM, and DMARC
- Monitor blacklist status and sender score`
      }
    ],
    quiz: {
      title: "Digital Marketing Mastery Quiz",
      questions: [
        {
          id: 1,
          question: "What does SEO stand for?",
          options: ["Social Engine Optimization", "Search Engine Optimization", "Site Enhancement Operations", "Search Enhancement Optimization"],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which platform is best for B2B marketing?",
          options: ["Instagram", "TikTok", "LinkedIn", "Snapchat"],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "What is the average ROI for email marketing?",
          options: ["$20 for every $1 spent", "$32 for every $1 spent", "$42 for every $1 spent", "$52 for every $1 spent"],
          correctAnswer: 2
        },
        {
          id: 4,
          question: "What percentage of emails are opened on mobile devices?",
          options: ["40%+", "50%+", "60%+", "70%+"],
          correctAnswer: 2
        }
      ]
    }
  }
];
