import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section
      className="relative py-20 lg:py-32"
      role="main"
      aria-labelledby="hero-title"
    >
      {/* Background animation (optional for performance) */}
      <div
        className="absolute top-0 left-0 w-full h-80 pointer-events-none z-0 overflow-hidden"
        style={{
          background: `linear-gradient(to right, rgba(255, 99, 8, 0.1), rgba(189, 201, 230, 0.1), rgba(151, 196, 255, 0.1))`,
          maskImage: `radial-gradient(ellipse at top, black, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(ellipse at top, black, transparent 70%)`,
        }}
        aria-hidden="true"
      ></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <header>
            <h1
              id="hero-title"
              className="font-NeuMechina text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Transform Your Learning
              <span className="text-primary block">Journey Today</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover thousands of courses from expert instructors. Learn at
              your own pace, earn certificates, and advance your career with
              our comprehensive learning platform.
            </p>
          </header>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            role="group"
            aria-label="Call to action buttons"
          >
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/courses" className="font-NeuMechina">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link to="/demo" className="font-NeuMechina">
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                label: "500+",
                desc: "Expert Courses",
              },
              {
                icon: <Users className="h-6 w-6 text-primary" />,
                label: "50K+",
                desc: "Active Students",
              },
              {
                icon: <Award className="h-6 w-6 text-primary" />,
                label: "95%",
                desc: "Success Rate",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                aria-label={item.desc}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold">{item.label}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
