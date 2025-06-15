import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"
import { Link } from "react-router-dom"

export default function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-NeuMechina text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Transform Your Learning
            <span className="text-primary block">Journey Today</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover thousands of courses from expert instructors. Learn at your own pace, earn certificates, and
            advance your career with our comprehensive learning platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/courses" className="font-NeuMechina">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/demo" className="font-NeuMechina">Watch Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-muted-foreground">Expert Courses</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">50K+</h3>
              <p className="text-muted-foreground">Active Students</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">95%</h3>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
