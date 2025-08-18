import { Course } from "@/types";

export const seedCourses: Course[] = [
  {
    id: "course_react_fundamentals",
    title: "React Fundamentals",
    description: "Learn the core concepts of React including components, state, props, and hooks. Perfect for beginners starting their React journey.",
    category: "Programming",
    level: "Beginner",
    duration: "6 weeks",
    rating: 4.8,
    ratingCount: 156,
    students: 1247,
    instructor: "Sarah Johnson",
    thumbnail: "/placeholder.svg",
    status: "published",
    content: [
      {
        id: "content_1",
        title: "Introduction to React",
        type: "text",
        duration: "30 min",
        content: `
# Introduction to React

React is a powerful JavaScript library for building user interfaces, particularly web applications. Created by Facebook, React has revolutionized how we think about building interactive UIs.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components."

## Key Features

- **Component-Based**: Build encapsulated components that manage their own state
- **Declarative**: React makes it painless to create interactive UIs
- **Learn Once, Write Anywhere**: Develop new features without rewriting existing code
- **Virtual DOM**: Efficient rendering through a virtual representation of the DOM

## Why Learn React?

1. **Industry Demand**: React is one of the most popular frontend frameworks
2. **Large Ecosystem**: Extensive library and tooling support
3. **Performance**: Optimized rendering with Virtual DOM
4. **Flexibility**: Can be integrated into existing projects gradually

Ready to dive in? Let's start building!
        `
      },
      {
        id: "content_2",
        title: "Setting Up Your Development Environment",
        type: "video",
        duration: "20 min",
        content: "Learn how to set up your development environment for React development.",
        videoUrl: "https://example.com/react-setup"
      },
      {
        id: "content_3",
        title: "Your First React Component",
        type: "text",
        duration: "45 min",
        content: `
# Your First React Component

Let's create your first React component! Components are the building blocks of React applications.

## Function Components

The simplest way to define a component is to write a JavaScript function:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## JSX - JavaScript XML

JSX is a syntax extension for JavaScript that looks similar to HTML:

\`\`\`jsx
const element = <h1>Hello, world!</h1>;
\`\`\`

## Props

Props are how you pass data to components:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Using the component
<Welcome name="Sara" />
\`\`\`

Practice creating components to solidify your understanding!
        `
      }
    ],
    quiz: {
      id: "quiz_react_basics",
      title: "React Fundamentals Quiz",
      courseId: "course_react_fundamentals",
      questions: [
        {
          id: "q1",
          question: "What is React primarily used for?",
          options: [
            "Building databases",
            "Building user interfaces",
            "Server-side programming",
            "Mobile app deployment"
          ],
          correctAnswer: 1,
          explanation: "React is a JavaScript library specifically designed for building user interfaces, particularly for web applications."
        },
        {
          id: "q2",
          question: "What is JSX?",
          options: [
            "A new programming language",
            "A syntax extension for JavaScript",
            "A React component",
            "A database query language"
          ],
          correctAnswer: 1,
          explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files."
        }
      ]
    }
  },
  {
    id: "course_python_data_science",
    title: "Python for Data Science",
    description: "Master Python programming for data analysis, visualization, and machine learning. Includes pandas, numpy, matplotlib, and scikit-learn.",
    category: "Data Science",
    level: "Intermediate",
    duration: "10 weeks",
    rating: 4.9,
    ratingCount: 234,
    students: 892,
    instructor: "Dr. Michael Chen",
    thumbnail: "/placeholder.svg",
    status: "published",
    content: [
      {
        id: "content_py_1",
        title: "Python Basics for Data Science",
        type: "text",
        duration: "40 min",
        content: `
# Python Basics for Data Science

Python is the most popular programming language for data science due to its simplicity and powerful libraries.

## Why Python for Data Science?

- **Easy to Learn**: Simple, readable syntax
- **Rich Ecosystem**: Extensive libraries like pandas, numpy, matplotlib
- **Community Support**: Large, active community
- **Versatility**: Can handle data collection, processing, analysis, and visualization

## Essential Python Concepts

### Variables and Data Types
\`\`\`python
# Numbers
age = 25
price = 99.99

# Strings
name = "Data Scientist"

# Lists
data = [1, 2, 3, 4, 5]

# Dictionaries
person = {"name": "Alice", "age": 30}
\`\`\`

### Control Structures
\`\`\`python
# If statements
if age >= 18:
    print("Adult")

# Loops
for item in data:
    print(item)
\`\`\`

Let's dive deeper into data manipulation!
        `
      },
      {
        id: "content_py_2",
        title: "Introduction to Pandas",
        type: "text",
        duration: "60 min",
        content: `
# Introduction to Pandas

Pandas is the cornerstone library for data manipulation and analysis in Python.

## What is Pandas?

Pandas provides data structures and data analysis tools for Python. It's built on top of NumPy and provides easy-to-use data structures and data analysis tools.

## Key Data Structures

### Series
A one-dimensional labeled array:
\`\`\`python
import pandas as pd

# Creating a Series
s = pd.Series([1, 3, 5, 7, 9])
print(s)
\`\`\`

### DataFrame
A two-dimensional labeled data structure:
\`\`\`python
# Creating a DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'London', 'Tokyo']
}
df = pd.DataFrame(data)
print(df)
\`\`\`

## Basic Operations

\`\`\`python
# Reading data
df = pd.read_csv('data.csv')

# Viewing data
df.head()  # First 5 rows
df.info()  # Data types and info
df.describe()  # Statistical summary

# Selecting data
df['Name']  # Select column
df.iloc[0]  # Select row by position
df.loc[df['Age'] > 30]  # Filter rows
\`\`\`

Practice these operations to become proficient!
        `
      }
    ],
    quiz: {
      id: "quiz_python_data",
      title: "Python Data Science Quiz",
      courseId: "course_python_data_science",
      questions: [
        {
          id: "q1",
          question: "Which library is primarily used for data manipulation in Python?",
          options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
          correctAnswer: 1,
          explanation: "Pandas is the primary library for data manipulation and analysis in Python, providing powerful data structures like DataFrame and Series."
        },
        {
          id: "q2",
          question: "What is a DataFrame in Pandas?",
          options: [
            "A one-dimensional array",
            "A two-dimensional labeled data structure",
            "A plotting function",
            "A machine learning model"
          ],
          correctAnswer: 1,
          explanation: "A DataFrame is a two-dimensional, size-mutable, potentially heterogeneous tabular data structure with labeled axes (rows and columns)."
        }
      ]
    }
  },
  {
    id: "course_web_design_fundamentals",
    title: "Web Design Fundamentals",
    description: "Learn the principles of modern web design including HTML, CSS, responsive design, and UX/UI best practices.",
    category: "Design",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.7,
    ratingCount: 189,
    students: 756,
    instructor: "Emily Rodriguez",
    thumbnail: "/placeholder.svg",
    status: "published",
    content: [
      {
        id: "content_web_1",
        title: "HTML Fundamentals",
        type: "text",
        duration: "50 min",
        content: `
# HTML Fundamentals

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## What is HTML?

HTML describes the structure of a web page using a series of elements. Elements tell the browser how to display the content.

## Basic HTML Structure

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is my first paragraph.</p>
</body>
</html>
\`\`\`

## Common HTML Elements

### Headings
\`\`\`html
<h1>Main Heading</h1>
<h2>Subheading</h2>
<h3>Sub-subheading</h3>
\`\`\`

### Paragraphs and Text
\`\`\`html
<p>This is a paragraph.</p>
<strong>Bold text</strong>
<em>Italic text</em>
\`\`\`

### Links and Images
\`\`\`html
<a href="https://example.com">Visit Example</a>
<img src="image.jpg" alt="Description">
\`\`\`

### Lists
\`\`\`html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
\`\`\`

HTML is the foundation of all web pages!
        `
      },
      {
        id: "content_web_2",
        title: "CSS Styling Basics",
        type: "text",
        duration: "45 min",
        content: `
# CSS Styling Basics

CSS (Cascading Style Sheets) is used to style and layout web pages.

## What is CSS?

CSS describes how HTML elements should be displayed. It can control the layout of multiple web pages all at once.

## CSS Syntax

\`\`\`css
selector {
    property: value;
    property: value;
}
\`\`\`

## Selectors

### Element Selectors
\`\`\`css
h1 {
    color: blue;
    font-size: 24px;
}

p {
    color: #333;
    line-height: 1.6;
}
\`\`\`

### Class Selectors
\`\`\`css
.highlight {
    background-color: yellow;
    padding: 10px;
}
\`\`\`

### ID Selectors
\`\`\`css
#header {
    background-color: #f0f0f0;
    text-align: center;
}
\`\`\`

## Common Properties

\`\`\`css
/* Colors and Backgrounds */
color: red;
background-color: #f0f0f0;

/* Typography */
font-family: Arial, sans-serif;
font-size: 16px;
font-weight: bold;

/* Spacing */
margin: 10px;
padding: 20px;

/* Layout */
width: 100%;
height: 200px;
display: block;
\`\`\`

CSS brings your HTML to life with beautiful styling!
        `
      }
    ],
    quiz: {
      id: "quiz_web_design",
      title: "Web Design Fundamentals Quiz",
      courseId: "course_web_design_fundamentals",
      questions: [
        {
          id: "q1",
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
            "Hyperlink and Text Markup Language"
          ],
          correctAnswer: 0,
          explanation: "HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages."
        },
        {
          id: "q2",
          question: "Which CSS property is used to change the text color?",
          options: ["text-color", "font-color", "color", "text-style"],
          correctAnswer: 2,
          explanation: "The 'color' property in CSS is used to set the color of text content."
        }
      ]
    }
  },
  {
    id: "course_digital_marketing",
    title: "Digital Marketing Mastery",
    description: "Comprehensive guide to digital marketing including SEO, social media marketing, content marketing, and analytics.",
    category: "Marketing",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.6,
    ratingCount: 312,
    students: 1456,
    instructor: "Mark Thompson",
    thumbnail: "/placeholder.svg",
    status: "published",
    content: [
      {
        id: "content_dm_1",
        title: "Introduction to Digital Marketing",
        type: "text",
        duration: "35 min",
        content: `
# Introduction to Digital Marketing

Digital marketing encompasses all marketing efforts that use an electronic device or the internet.

## What is Digital Marketing?

Digital marketing is the component of marketing that utilizes internet and online-based digital technologies to promote products and services.

## Key Components

1. **Search Engine Optimization (SEO)**
2. **Content Marketing**
3. **Social Media Marketing**
4. **Pay-per-Click (PPC)**
5. **Affiliate Marketing**
6. **Email Marketing**
7. **Online PR**

## Benefits of Digital Marketing

- **Cost-Effective**: Often more affordable than traditional marketing
- **Measurable**: Detailed analytics and reporting
- **Targeted**: Reach specific audiences
- **Global Reach**: Access to worldwide markets
- **Real-time Results**: Immediate feedback and adjustments

## Digital Marketing Funnel

1. **Awareness**: Making potential customers aware of your brand
2. **Interest**: Generating interest in your products/services
3. **Consideration**: Prospects evaluate your offerings
4. **Conversion**: Turning prospects into customers
5. **Retention**: Keeping customers engaged and loyal

Understanding these fundamentals is crucial for success!
        `
      }
    ],
    quiz: {
      id: "quiz_digital_marketing",
      title: "Digital Marketing Quiz",
      courseId: "course_digital_marketing",
      questions: [
        {
          id: "q1",
          question: "What does SEO stand for?",
          options: [
            "Social Engine Optimization",
            "Search Engine Optimization",
            "Site Engine Optimization",
            "Service Engine Optimization"
          ],
          correctAnswer: 1,
          explanation: "SEO stands for Search Engine Optimization, which is the practice of increasing the quantity and quality of traffic to your website through organic search engine results."
        }
      ]
    }
  },
  {
    id: "course_mobile_app_development",
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native. Learn to create apps for both iOS and Android from a single codebase.",
    category: "Mobile Development",
    level: "Advanced",
    duration: "14 weeks",
    rating: 4.8,
    ratingCount: 127,
    students: 543,
    instructor: "David Kim",
    thumbnail: "/placeholder.svg",
    status: "published",
    content: [
      {
        id: "content_rn_1",
        title: "Getting Started with React Native",
        type: "text",
        duration: "40 min",
        content: `
# Getting Started with React Native

React Native lets you build mobile apps using only JavaScript. It uses the same design as React.

## What is React Native?

React Native is an open-source mobile application framework created by Facebook. It's used to develop applications for Android, iOS, and other platforms by enabling developers to use React along with native platform capabilities.

## Key Features

- **Cross-Platform**: Write once, run on both iOS and Android
- **Native Performance**: Direct access to native APIs
- **Hot Reloading**: See changes instantly
- **Large Community**: Extensive ecosystem and support

## Core Components

### View
The fundamental component for building UI:
\`\`\`jsx
import React from 'react';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello, React Native!</Text>
    </View>
  );
};
\`\`\`

### Text
For displaying text:
\`\`\`jsx
<Text style={{ fontSize: 18, color: 'blue' }}>
  Welcome to React Native
</Text>
\`\`\`

### TextInput
For user input:
\`\`\`jsx
<TextInput
  style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
  placeholder="Enter text here"
  onChangeText={text => setText(text)}
  value={text}
/>
\`\`\`

React Native opens up a world of mobile development possibilities!
        `
      }
    ],
    quiz: {
      id: "quiz_react_native",
      title: "React Native Quiz",
      courseId: "course_mobile_app_development",
      questions: [
        {
          id: "q1",
          question: "What is the main advantage of React Native?",
          options: [
            "It only works on iOS",
            "It requires separate codebases for each platform",
            "It allows cross-platform development with a single codebase",
            "It only uses native code"
          ],
          correctAnswer: 2,
          explanation: "React Native's main advantage is that it allows developers to write cross-platform mobile applications using a single codebase that works on both iOS and Android."
        }
      ]
    }
  }
];

export const seedUsers = [
  {
    id: "admin_user",
    email: "admin@smartlearn.com",
    password: "YWRtaW4xMjNzYWx0X2tleV8xMjM=", // "admin123" hashed
    role: "admin",
    firstName: "System",
    lastName: "Administrator",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: "lecturer_demo",
    email: "lecturer@smartlearn.com", 
    password: "bGVjdHVyZXIxMjNzYWx0X2tleV8xMjM=", // "lecturer123" hashed
    role: "lecturer",
    firstName: "Demo",
    lastName: "Lecturer",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: "student_demo",
    email: "student@smartlearn.com",
    password: "c3R1ZGVudDEyM3NhbHRfa2V5XzEyMw==", // "student123" hashed
    role: "student", 
    firstName: "Demo",
    lastName: "Student",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];
