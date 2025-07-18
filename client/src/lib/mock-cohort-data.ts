import type { CohortData } from "@/types/cohort";

export const mockCohort: CohortData = {
  id: "cohort_1",
  title: "Full Stack Web Development Bootcamp",
  description: "Master modern web development with React, Node.js, and databases",
  instructor: {
    id: "instructor_1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Senior Full Stack Developer with 8+ years experience",
  },
  progress: {
    overall: 45,
    // ✅ Yeh 4 field type ke andar hone chahiye (percent values)
    byType: {
      video: 60,
      reading: 40,
      quiz: 72,
      lessons: 10,
      assignments: 1,
    },
    // ✅ Required fields
    completedLessons: 7,
    totalLessons: 12,
    timeSpent: "6h 20m",
    streak: "3 days",
    streakDays: [1, 2, 3, 4, 5],
    xp: 2200,
    // ✅ Achievements list
    achievements: ["Completed 5 lessons", "Completed first quiz", "3-day streak!"],
  },
  chapters: [
    {
      id: "chapter_1",
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of web development",
      progress: 80,
      isCompleted: false,
      isBookmarked: true,
      estimatedTime: "4 hours",
      lessons: [
        {
          id: "lesson_1_1",
          title: "What is Web Development?",
          type: "video",
          duration: "15 min",
          isCompleted: true,
          isLocked: false,
          isBookmarked: false,
          description: "An introduction to web development concepts and technologies",
          videoUrl: "/sample-video.mp4",
          transcript:
            "Welcome to web development. In this lesson, we'll explore what web development is and why it's important...",
          codeExamples: [
            {
              id: "code_1",
              title: "Basic HTML Structure",
              language: "html",
              code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>`,
              description: "A basic HTML document structure",
            },
            {
              id: "code_2",
              title: "CSS Styling",
              language: "css",
              code: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    line-height: 1.6;
    color: #666;
}`,
              description: "Basic CSS styling for the HTML document",
            },
          ],
          resources: [
            {
              id: "resource_1",
              title: "HTML Cheat Sheet",
              type: "pdf",
              size: "2.3 MB",
              url: "#",
              description: "Quick reference for HTML tags",
            },
          ],
        },
        {
          id: "lesson_1_2",
          title: "Setting Up Your Development Environment",
          type: "reading",
          duration: "20 min",
          isCompleted: true,
          isLocked: false,
          isBookmarked: true,
          description: "Learn how to set up your coding environment",
          content: `# Setting Up Your Development Environment

## Code Editor
Choose a good code editor like Visual Studio Code, which offers:
- Syntax highlighting
- IntelliSense
- Extensions
- Integrated terminal

## Browser Developer Tools
Modern browsers come with powerful developer tools:
- Element inspector
- Console for debugging
- Network tab for monitoring requests
- Performance profiling

## Version Control
Git is essential for tracking changes:
- Initialize repositories
- Commit changes
- Work with branches
- Collaborate with others`,
          codeExamples: [
            {
              id: "code_3",
              title: "Git Basic Commands",
              language: "bash",
              code: `# Initialize a new Git repository
git init

# Add files to staging area
git add .

# Commit changes
git commit -m "Initial commit"

# Check repository status
git status

# View commit history
git log --oneline`,
              description: "Essential Git commands for version control",
            },
          ],
          resources: [
            {
              id: "resource_2",
              title: "VS Code Setup Guide",
              type: "link",
              url: "https://code.visualstudio.com/docs/setup/setup-overview",
              description: "Official VS Code installation guide",
            },
          ],
        },
        {
          id: "lesson_1_3",
          title: "HTML Fundamentals Quiz",
          type: "quiz",
          duration: "10 min",
          isCompleted: false,
          isLocked: false,
          isBookmarked: false,
          description: "Test your knowledge of HTML basics",
          dueDate: "2024-02-15",
          questions: [
            {
              id: "q1",
              type: "multiple-choice",
              question: "What does HTML stand for?",
              options: [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Home Tool Markup Language",
                "Hyperlink and Text Markup Language",
              ],
              points: 1,
              correctAnswer: "Hyper Text Markup Language",
              explanation:
                "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.",
            },

          ],
        },
      ],
    },
    {
      id: "chapter_2",
      title: "JavaScript Fundamentals",
      description: "Master the basics of JavaScript programming",
      progress: 30,
      isCompleted: false,
      isBookmarked: false,
      estimatedTime: "6 hours",
      lessons: [
        {
          id: "lesson_2_1",
          title: "Variables and Data Types",
          type: "video",
          duration: "25 min",
          isCompleted: true,
          isLocked: false,
          isBookmarked: false,
          description: "Learn about JavaScript variables and data types",
          codeExamples: [
            {
              id: "code_4",
              title: "Variable Declarations",
              language: "javascript",
              code: `// Variable declarations
let name = "John Doe";
const age = 25;
var isStudent = true;

// Data types
let number = 42;
let string = "Hello World";
let boolean = true;
let array = [1, 2, 3, 4, 5];
let object = {
    name: "Alice",
    age: 30,
    city: "New York"
};

console.log(typeof number);  // "number"
console.log(typeof string);  // "string"
console.log(typeof boolean); // "boolean"`,
              description: "Examples of variable declarations and data types in JavaScript",
            },
          ],
        },
        {
          id: "lesson_2_2",
          title: "Functions and Scope",
          type: "assignment",
          duration: "45 min",
          isCompleted: false,
          isLocked: false,
          isBookmarked: true,
          description: "Create functions and understand scope in JavaScript",
          dueDate: "2024-02-20",
          instructions:
            "Create a JavaScript program that demonstrates function declarations, expressions, and arrow functions.",
          codeExamples: [
            {
              id: "code_5",
              title: "Function Examples",
              language: "javascript",
              code: `// Function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

// Function expression
const multiply = function(a, b) {
    return a * b;
};

// Arrow function
const add = (a, b) => a + b;

// Higher-order function
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);

console.log(greet("Alice"));
console.log(multiply(3, 4));
console.log(add(5, 7));
console.log(doubled);`,
              description: "Different ways to define and use functions in JavaScript",
            },
          ],
        },
      ],
    },
    {
      id: "chapter_3",
      title: "Machine Learning Basics",
      description: "Introduction to machine learning concepts",
      progress: 25,
      isCompleted: false,
      estimatedTime: "4 weeks",
      isBookmarked: false,
      lessons: [
        {
          id: "lesson_3_1",
          title: "ML Fundamentals",
          type: "video",
          duration: "60 min",
          isCompleted: false,
          isLocked: false,
          isBookmarked: false,
          description: "Understanding machine learning concepts",
          videoUrl: "/sample-video.mp4",
          transcript: "Machine learning is a subset of artificial intelligence...",
          resources: [
            {
              id: "resource_3_1_1",
              title: "ML Glossary",
              type: "pdf",
              url: "/resources/ml-glossary.pdf",
              size: "1.8 MB",
            },
          ],
        },
        {
          id: "lesson_3_2",
          title: "Supervised Learning",
          type: "video",
          duration: "75 min",
          isCompleted: false,
          isLocked: true,
          isBookmarked: false,
          description: "Classification and regression algorithms",
          videoUrl: "/sample-video.mp4",
          transcript: "Supervised learning uses labeled data to train models...",
          resources: [],
        },
        {
          id: "quiz_3_1",
          title: "ML Concepts Quiz",
          type: "quiz",
          duration: "45 min",
          isCompleted: false,
          isLocked: true,
          isBookmarked: false,
          description: "Test your understanding of ML basics",
          dueDate: "2024-07-20T23:59:00",
          questions: [],
        },
      ],
    },
  ],
}
