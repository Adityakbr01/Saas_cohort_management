
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Users, Star, Play, Download, BadgeIcon as Certificate, Globe, BookOpen } from "lucide-react"


type Course = {
  id: string
  title: string
  description: string
  longDescription: string
  instructor: {
    name: string
    bio: string
    avatar: string
    rating: number
    students: number
    courses: number
  }
  duration: string
  level: "Beginner" | "Intermediate" | "Advanced"
  rating: number
  students: number
  reviewCount: number
  thumbnail: string
  price: string
  originalPrice: string
  language: string
  lastUpdated: string
  certificate: boolean
  downloadable: boolean
  syllabus: {
    title: string
    lessons: number
    duration: string
    topics: string[]
  }[]
  reviews: {
    id: number
    name: string
    avatar: string
    rating: number
    date: string
    comment: string
  }[]
}


// Mock course data - in a real app, this would come from an API
const courseData: { [key: string]: Course } = {
  "1": {
    id: "1",
    title: "Complete React Development Bootcamp",
    description:
      "Master React from basics to advanced concepts including hooks, context, and modern patterns. This comprehensive course will take you from a complete beginner to an advanced React developer.",
    longDescription:
      "This comprehensive React development bootcamp is designed to take you from zero to hero in React development. You'll learn everything from the fundamentals of React to advanced concepts like state management, performance optimization, and testing. The course includes hands-on projects, real-world examples, and best practices used by industry professionals.",
    instructor: {
      name: "Sarah Johnson",
      bio: "Senior Frontend Developer at Google with 8+ years of experience in React development. Sarah has taught over 100,000 students and is passionate about making complex concepts easy to understand.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      students: 125000,
      courses: 12,
    },
    duration: "12 weeks",
    level: "Intermediate",
    rating: 4.8,
    students: 15420,
    reviewCount: 2847,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$89",
    originalPrice: "$149",
    language: "English",
    lastUpdated: "December 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Getting Started with React",
        lessons: 8,
        duration: "2 hours",
        topics: [
          "What is React?",
          "Setting up the development environment",
          "Your first React component",
          "JSX fundamentals",
        ],
      },
      {
        title: "React Components and Props",
        lessons: 12,
        duration: "3 hours",
        topics: [
          "Functional vs Class components",
          "Props and PropTypes",
          "Component composition",
          "Conditional rendering",
        ],
      },
      {
        title: "State Management and Hooks",
        lessons: 15,
        duration: "4 hours",
        topics: ["useState Hook", "useEffect Hook", "Custom Hooks", "Context API"],
      },
      {
        title: "Advanced React Patterns",
        lessons: 10,
        duration: "3 hours",
        topics: ["Higher-Order Components", "Render Props", "React.memo", "Performance optimization"],
      },
      {
        title: "Testing and Deployment",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Unit testing with Jest", "Integration testing", "Deployment strategies", "CI/CD pipelines"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Excellent course! Sarah explains everything clearly and the projects are very practical. I landed a React developer job after completing this course.",
      },
      {
        id: 2,
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "1 month ago",
        comment:
          "Great content and well-structured. The only minor issue is that some videos could be a bit shorter, but overall highly recommended.",
      },
      {
        id: 3,
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "This course exceeded my expectations. The hands-on projects really helped me understand React concepts deeply.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Python for Data Science",
    description:
      "Learn Python programming with focus on data analysis, visualization, and machine learning. Perfect for beginners looking to enter the data science field.",
    longDescription:
      "This comprehensive Python for Data Science course is designed for beginners who want to enter the exciting field of data science. You'll learn Python programming fundamentals, data manipulation with pandas, data visualization with matplotlib and seaborn, and introduction to machine learning with scikit-learn. The course includes real-world datasets and practical projects.",
    instructor: {
      name: "Dr. Michael Chen",
      bio: "PhD in Computer Science and former Stanford professor with 15+ years of experience in data science and machine learning. Michael has published over 50 research papers and taught thousands of students.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      students: 89000,
      courses: 8,
    },
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.9,
    students: 23150,
    reviewCount: 4521,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$79",
    originalPrice: "$129",
    language: "English",
    lastUpdated: "November 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Python Fundamentals",
        lessons: 10,
        duration: "2.5 hours",
        topics: [
          "Python syntax and variables",
          "Data types and structures",
          "Control flow and functions",
          "Object-oriented programming basics",
        ],
      },
      {
        title: "Data Manipulation with Pandas",
        lessons: 12,
        duration: "3 hours",
        topics: [
          "Introduction to pandas",
          "DataFrames and Series",
          "Data cleaning and preprocessing",
          "Grouping and aggregation",
        ],
      },
      {
        title: "Data Visualization",
        lessons: 8,
        duration: "2 hours",
        topics: ["Matplotlib basics", "Seaborn for statistical plots", "Interactive visualizations", "Best practices"],
      },
      {
        title: "Introduction to Machine Learning",
        lessons: 15,
        duration: "4 hours",
        topics: ["Supervised learning", "Unsupervised learning", "Model evaluation", "Scikit-learn library"],
      },
      {
        title: "Real-world Projects",
        lessons: 6,
        duration: "3 hours",
        topics: ["Sales data analysis", "Customer segmentation", "Predictive modeling", "Portfolio project"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Alice Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "Dr. Chen is an amazing instructor! The course is well-structured and the projects are very practical. I feel confident in my data science skills now.",
      },
      {
        id: 2,
        name: "Bob Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "Perfect for beginners! I had no programming experience and now I can analyze data and build machine learning models.",
      },
      {
        id: 3,
        name: "Carol Davis",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Excellent content and clear explanations. The only suggestion would be to add more advanced topics, but overall fantastic course.",
      },
    ],
  },
  "3": {
    id: "3",
    title: "Advanced JavaScript Patterns",
    description:
      "Deep dive into advanced JavaScript concepts, design patterns, and performance optimization. Perfect for experienced developers looking to master JavaScript.",
    longDescription:
      "This advanced JavaScript course is designed for experienced developers who want to master the language. You'll explore advanced concepts like closures, prototypes, async programming, design patterns, and performance optimization. The course includes real-world examples and best practices used in production applications.",
    instructor: {
      name: "Alex Rodriguez",
      bio: "Senior JavaScript Engineer at Netflix with 10+ years of experience building large-scale web applications. Alex is a frequent speaker at JavaScript conferences and contributes to open-source projects.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.8,
      students: 45000,
      courses: 6,
    },
    duration: "6 weeks",
    level: "Advanced",
    rating: 4.7,
    students: 8930,
    reviewCount: 1876,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$99",
    originalPrice: "$159",
    language: "English",
    lastUpdated: "October 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Advanced Language Features",
        lessons: 8,
        duration: "2.5 hours",
        topics: [
          "Closures and scope",
          "Prototypes and inheritance",
          "Async/await and Promises",
          "Generators and iterators",
        ],
      },
      {
        title: "Design Patterns",
        lessons: 10,
        duration: "3 hours",
        topics: ["Module pattern", "Observer pattern", "Factory pattern", "Singleton pattern"],
      },
      {
        title: "Performance Optimization",
        lessons: 6,
        duration: "2 hours",
        topics: ["Memory management", "Event loop optimization", "Code splitting", "Lazy loading"],
      },
      {
        title: "Modern JavaScript",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["ES6+ features", "Modules", "Webpack and bundling", "Testing strategies"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "David Kim",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "This course took my JavaScript skills to the next level. Alex's explanations of complex concepts are crystal clear.",
      },
      {
        id: 2,
        name: "Emma White",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Great advanced content. Some topics were challenging but the examples helped a lot. Definitely worth it for experienced developers.",
      },
    ],
  },
  "4": {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn the principles of user interface and user experience design with hands-on projects. Perfect for beginners and developers looking to improve their design skills.",
    longDescription:
      "This comprehensive UI/UX design course covers everything from design principles to user research and prototyping. You'll learn to create beautiful, functional interfaces that provide excellent user experiences. The course includes hands-on projects using industry-standard tools like Figma and Adobe XD.",
    instructor: {
      name: "Emma Thompson",
      bio: "Senior UX Designer at Apple with 12+ years of experience in product design. Emma has worked on award-winning mobile and web applications and is passionate about user-centered design.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      students: 67000,
      courses: 9,
    },
    duration: "10 weeks",
    level: "Beginner",
    rating: 4.6,
    students: 12780,
    reviewCount: 2341,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$69",
    originalPrice: "$119",
    language: "English",
    lastUpdated: "December 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Design Principles",
        lessons: 8,
        duration: "2 hours",
        topics: ["Color theory", "Typography", "Layout and composition", "Visual hierarchy"],
      },
      {
        title: "User Research",
        lessons: 6,
        duration: "1.5 hours",
        topics: ["User personas", "User journey mapping", "Usability testing", "Analytics and feedback"],
      },
      {
        title: "Wireframing and Prototyping",
        lessons: 10,
        duration: "3 hours",
        topics: ["Low-fidelity wireframes", "High-fidelity mockups", "Interactive prototypes", "Design systems"],
      },
      {
        title: "Tools and Workflow",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Figma fundamentals", "Adobe XD basics", "Collaboration tools", "Handoff to developers"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Grace Lee",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "Emma is an excellent teacher! The course is well-structured and the projects are very practical. I learned so much about design principles.",
      },
      {
        id: 2,
        name: "Henry Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Great course for beginners. The Figma tutorials were especially helpful. Would love to see more advanced topics in a follow-up course.",
      },
    ],
  },
  "5": {
    id: "5",
    title: "Cloud Computing with AWS",
    description:
      "Master Amazon Web Services and learn to build scalable cloud applications. Perfect for developers and IT professionals looking to advance their cloud skills.",
    longDescription:
      "This comprehensive AWS course covers everything from basic cloud concepts to advanced services like Lambda, ECS, and RDS. You'll learn to design, deploy, and manage scalable applications on AWS. The course includes hands-on labs and real-world projects to give you practical experience.",
    instructor: {
      name: "David Kumar",
      bio: "AWS Solutions Architect with 8+ years of experience in cloud computing. David holds multiple AWS certifications and has helped hundreds of companies migrate to the cloud.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.8,
      students: 34000,
      courses: 5,
    },
    duration: "14 weeks",
    level: "Intermediate",
    rating: 4.8,
    students: 9650,
    reviewCount: 1923,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$129",
    originalPrice: "$199",
    language: "English",
    lastUpdated: "November 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "AWS Fundamentals",
        lessons: 10,
        duration: "3 hours",
        topics: [
          "Introduction to cloud computing",
          "AWS global infrastructure",
          "IAM and security",
          "Billing and cost management",
        ],
      },
      {
        title: "Compute Services",
        lessons: 12,
        duration: "4 hours",
        topics: ["EC2 instances", "Auto Scaling", "Load Balancers", "Lambda functions"],
      },
      {
        title: "Storage and Databases",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["S3 storage", "EBS volumes", "RDS databases", "DynamoDB"],
      },
      {
        title: "Advanced Services",
        lessons: 10,
        duration: "3.5 hours",
        topics: ["VPC networking", "CloudFormation", "Monitoring and logging", "DevOps practices"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Ivan Petrov",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "Excellent course! David explains complex AWS concepts in a very understandable way. The hands-on labs are invaluable.",
      },
      {
        id: 2,
        name: "Julia Martinez",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "3 weeks ago",
        comment:
          "This course helped me pass my AWS certification exam. The practical examples and real-world scenarios are fantastic.",
      },
    ],
  },
  "6": {
    id: "6",
    title: "Mobile App Development with Flutter",
    description:
      "Build cross-platform mobile applications using Flutter and Dart programming language. Perfect for developers looking to create iOS and Android apps.",
    longDescription:
      "This comprehensive Flutter course teaches you to build beautiful, high-performance mobile applications for both iOS and Android. You'll learn Dart programming, Flutter widgets, state management, and how to integrate with APIs and databases. The course includes multiple projects to build your portfolio.",
    instructor: {
      name: "Lisa Park",
      bio: "Senior Mobile Developer at Uber with 7+ years of experience in mobile app development. Lisa has built apps used by millions of users and is a Flutter community contributor.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      students: 28000,
      courses: 4,
    },
    duration: "16 weeks",
    level: "Intermediate",
    rating: 4.7,
    students: 7420,
    reviewCount: 1456,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$109",
    originalPrice: "$169",
    language: "English",
    lastUpdated: "October 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Dart Programming",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Dart syntax and basics", "Object-oriented programming", "Async programming", "Error handling"],
      },
      {
        title: "Flutter Fundamentals",
        lessons: 12,
        duration: "4 hours",
        topics: ["Widgets and layouts", "Navigation and routing", "State management", "Animations"],
      },
      {
        title: "Advanced Features",
        lessons: 10,
        duration: "3.5 hours",
        topics: ["API integration", "Local storage", "Push notifications", "Device features"],
      },
      {
        title: "Publishing and Deployment",
        lessons: 6,
        duration: "2 hours",
        topics: ["App store guidelines", "Building for release", "Testing strategies", "Performance optimization"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Kevin Zhang",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Lisa is an amazing instructor! I built my first mobile app after completing this course. The projects are very practical.",
      },
      {
        id: 2,
        name: "Maria Santos",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "1 month ago",
        comment:
          "Great course for learning Flutter. The explanations are clear and the code examples are helpful. Would recommend to anyone interested in mobile development.",
      },
    ],
  },
  "7": {
    id: "7",
    title: "Machine Learning Fundamentals",
    description:
      "Introduction to machine learning algorithms and their practical applications. Perfect for beginners looking to understand AI and ML concepts.",
    longDescription:
      "This comprehensive machine learning course introduces you to the fundamental concepts and algorithms used in AI. You'll learn about supervised and unsupervised learning, neural networks, and how to implement ML models using Python and popular libraries like scikit-learn and TensorFlow.",
    instructor: {
      name: "Dr. James Wilson",
      bio: "PhD in Machine Learning from MIT with 12+ years of research experience. James has published numerous papers in top AI conferences and worked at leading tech companies.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.6,
      students: 52000,
      courses: 7,
    },
    duration: "10 weeks",
    level: "Intermediate",
    rating: 4.5,
    students: 11200,
    reviewCount: 2134,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$95",
    originalPrice: "$149",
    language: "English",
    lastUpdated: "September 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Introduction to ML",
        lessons: 6,
        duration: "2 hours",
        topics: ["What is machine learning?", "Types of learning", "Data preprocessing", "Model evaluation"],
      },
      {
        title: "Supervised Learning",
        lessons: 10,
        duration: "3.5 hours",
        topics: ["Linear regression", "Classification algorithms", "Decision trees", "Ensemble methods"],
      },
      {
        title: "Unsupervised Learning",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Clustering algorithms", "Dimensionality reduction", "Association rules", "Anomaly detection"],
      },
      {
        title: "Neural Networks",
        lessons: 8,
        duration: "3 hours",
        topics: ["Perceptrons", "Deep learning basics", "Backpropagation", "CNN and RNN intro"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Olivia Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "Dr. Wilson explains complex ML concepts in a very accessible way. The practical examples really helped me understand the theory.",
      },
      {
        id: 2,
        name: "Peter Brown",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "2 weeks ago",
        comment:
          "Good introduction to machine learning. The course covers a lot of ground and provides a solid foundation for further study.",
      },
    ],
  },
  "8": {
    id: "8",
    title: "Digital Marketing Mastery",
    description:
      "Complete guide to digital marketing including SEO, social media, and content marketing. Perfect for entrepreneurs and marketing professionals.",
    longDescription:
      "This comprehensive digital marketing course covers all aspects of modern online marketing. You'll learn SEO, social media marketing, content marketing, email marketing, and paid advertising. The course includes real-world case studies and practical strategies you can implement immediately.",
    instructor: {
      name: "Maria Garcia",
      bio: "Digital Marketing Director with 9+ years of experience helping brands grow online. Maria has managed marketing campaigns for Fortune 500 companies and startups alike.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.5,
      students: 41000,
      courses: 6,
    },
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.4,
    students: 18500,
    reviewCount: 3421,
    thumbnail: "/placeholder.svg?height=400&width=600",
    price: "$75",
    originalPrice: "$125",
    language: "English",
    lastUpdated: "November 2023",
    certificate: true,
    downloadable: true,
    syllabus: [
      {
        title: "Digital Marketing Foundations",
        lessons: 6,
        duration: "2 hours",
        topics: ["Marketing fundamentals", "Customer personas", "Marketing funnel", "Analytics setup"],
      },
      {
        title: "Search Engine Optimization",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Keyword research", "On-page SEO", "Link building", "Technical SEO"],
      },
      {
        title: "Social Media Marketing",
        lessons: 8,
        duration: "2.5 hours",
        topics: ["Platform strategies", "Content creation", "Community management", "Social advertising"],
      },
      {
        title: "Content and Email Marketing",
        lessons: 6,
        duration: "2 hours",
        topics: ["Content strategy", "Email campaigns", "Marketing automation", "Performance tracking"],
      },
    ],
    reviews: [
      {
        id: 1,
        name: "Rachel Green",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 5,
        date: "1 week ago",
        comment:
          "Maria's course is packed with actionable insights. I implemented her strategies and saw immediate improvements in my business's online presence.",
      },
      {
        id: 2,
        name: "Sam Wilson",
        avatar: "/placeholder.svg?height=40&width=40",
        rating: 4,
        date: "3 weeks ago",
        comment:
          "Great overview of digital marketing. The SEO section was particularly helpful. Would recommend for anyone starting in digital marketing.",
      },
    ],
  },
}

interface CourseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params
  const course = courseData[id]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{course.language}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>Last updated {course.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={course.thumbnail}
                alt={`${course.title} course thumbnail`}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Course Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{course.longDescription}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">53 Lessons</p>
                        <p className="text-sm text-muted-foreground">14.5 hours</p>
                      </div>
                      <div className="text-center">
                        <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Downloadable</p>
                        <p className="text-sm text-muted-foreground">Resources</p>
                      </div>
                      <div className="text-center">
                        <Certificate className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Certificate</p>
                        <p className="text-sm text-muted-foreground">Of completion</p>
                      </div>
                      <div className="text-center">
                        <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Lifetime</p>
                        <p className="text-sm text-muted-foreground">Access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="syllabus" className="mt-6">
                <div className="space-y-4">
                  {course.syllabus.map((section: Course["syllabus"][number], index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {section.lessons} lessons • {section.duration}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.topics.map((topic: string, topicIndex: number) => (
                            <li key={topicIndex} className="flex items-center gap-2 text-sm">
                              <Play className="h-3 w-3 text-muted-foreground" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={course.instructor.avatar || "/placeholder.svg"}
                          alt={course.instructor.name}
                        />
                        <AvatarFallback>
                          {course.instructor.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{course.instructor.name}</h3>
                        <p className="text-muted-foreground mb-4">{course.instructor.bio}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium">{course.instructor.rating}</p>
                            <p className="text-muted-foreground">Instructor Rating</p>
                          </div>
                          <div>
                            <p className="font-medium">{course.instructor.students.toLocaleString()}</p>
                            <p className="text-muted-foreground">Students</p>
                          </div>
                          <div>
                            <p className="font-medium">{course.instructor.courses}</p>
                            <p className="text-muted-foreground">Courses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold">{course.rating}</div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Course Rating</p>
                        </div>
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-2 mb-1">
                              <span className="text-sm w-3">{rating}</span>
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <Progress value={rating === 5 ? 70 : rating === 4 ? 20 : 5} className="flex-1" />
                              <span className="text-sm text-muted-foreground w-8">
                                {rating === 5 ? "70%" : rating === 4 ? "20%" : "5%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {course.reviews.map((review: Course["reviews"][number]) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                              <AvatarFallback>
                                {review.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{review.name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                              <p className="text-muted-foreground">{review.comment}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold">{course.price}</span>
                    <span className="text-lg text-muted-foreground line-through">{course.originalPrice}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">40% off for limited time</p>
                </div>

                <div className="space-y-3 mb-6">
                  <Button className="w-full" size="lg">
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Wishlist
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span>{course.certificate ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloadable:</span>
                    <span>{course.downloadable ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
