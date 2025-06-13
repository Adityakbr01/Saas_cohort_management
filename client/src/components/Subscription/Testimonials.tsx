import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    company: "TechCorp",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The Pro plan has been incredible for my career growth. The certificates and live sessions are worth every penny.",
    rating: 5,
    plan: "Pro",
  },
  {
    name: "Michael Chen",
    role: "Learning Manager",
    company: "InnovateCo",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Our team of 30 developers loves the Business plan. The analytics help us track everyone's progress effectively.",
    rating: 5,
    plan: "Business",
  },
  {
    name: "Emily Davis",
    role: "Marketing Specialist",
    company: "StartupXYZ",
    avatar: "/placeholder.svg?height=60&width=60",
    content: "Started with Basic and it's perfect for learning new skills. Great value for money!",
    rating: 5,
    plan: "Basic",
  },
];

const Testimonials: React.FC = () => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">What Our Subscribers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} aria-label={`Testimonial from ${testimonial.name}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                ))}
              </div>
              <p className="text-muted-foreground mb-3">"{testimonial.content}"</p>
              <Badge variant="outline">{testimonial.plan} Plan</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default memo(Testimonials);