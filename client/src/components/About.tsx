import {Link} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Users,
  BookOpen,
  Award,
  Globe,
  Target,
  Heart,
  Lightbulb,
  Linkedin,
  Twitter,
  Mail,
} from "lucide-react"

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    bio: "Former Google engineer with 10+ years in EdTech. Passionate about democratizing education.",
    image: "/placeholder.svg?height=200&width=200",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "sarah@edulaunch.com",
    },
  },
  {
    name: "Dr. Michael Chen",
    role: "Head of Curriculum",
    bio: "PhD in Computer Science, former Stanford professor. Expert in online learning methodologies.",
    image: "/placeholder.svg?height=200&width=200",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "michael@edulaunch.com",
    },
  },
  {
    name: "Emma Thompson",
    role: "Head of Design",
    bio: "Award-winning UX designer focused on creating intuitive learning experiences.",
    image: "/placeholder.svg?height=200&width=200",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "emma@edulaunch.com",
    },
  },
  {
    name: "David Kumar",
    role: "CTO",
    bio: "Full-stack engineer and cloud architect. Building scalable education technology.",
    image: "/placeholder.svg?height=200&width=200",
    social: {
      linkedin: "#",
      twitter: "#",
      email: "david@edulaunch.com",
    },
  },
]

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for the highest quality in everything we do, from course content to user experience.",
  },
  {
    icon: Heart,
    title: "Accessibility",
    description: "Education should be accessible to everyone, regardless of background or circumstances.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously innovate to create better learning experiences and outcomes.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Learning is better together. We foster a supportive community of learners and educators.",
  },
]

const stats = [
  { number: "500+", label: "Expert Courses", icon: BookOpen },
  { number: "50K+", label: "Active Students", icon: Users },
  { number: "95%", label: "Success Rate", icon: Award },
  { number: "120+", label: "Countries", icon: Globe },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-6 ">
          <Button variant={"outline"} className="py-4" size="sm" asChild>
            <Link to="/" className="py-5">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">EduLaunch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're on a mission to make high-quality education accessible to everyone, everywhere. Our platform connects
            learners with world-class instructors and cutting-edge content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/courses">Explore Courses</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/signup">Join Our Community</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At EduLaunch, we believe that education is the key to unlocking human potential. Our mission is to
                democratize access to high-quality learning experiences that empower individuals to achieve their goals
                and transform their lives.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We partner with industry experts and thought leaders to create comprehensive, practical courses that
                bridge the gap between learning and real-world application. Whether you're looking to advance your
                career, learn a new skill, or pursue a passion, we're here to support your journey.
              </p>
              <Button asChild>
                <Link to="/courses">Start Learning Today</Link>
              </Button>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Students learning online"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape the learning experience we create.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're a diverse team of educators, technologists, and innovators united by our passion for learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="relative mb-4">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="rounded-full mx-auto"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={member.social.linkedin}>
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={member.social.twitter}>
                        <Twitter className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`mailto:${member.social.email}`}>
                        <Mail className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already transforming their careers and lives through our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
