"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Book, Video, Mail } from "lucide-react"

const faqs = [
  {
    question: "How do I reset a user's password?",
    answer: "Navigate to User Management, select the user, and click 'Reset Password'.",
    category: "User Management",
  },
  {
    question: "How can I view subscription analytics?",
    answer: "Go to Analytics section and select the Subscriptions tab for detailed metrics.",
    category: "Analytics",
  },
  {
    question: "What permissions do org admins have?",
    answer: "Org admins can manage users within their organization and view relevant analytics.",
    category: "Permissions",
  },
  {
    question: "How do I export reports?",
    answer: "In the Reports section, select your desired report and click the Download button.",
    category: "Reports",
  },
]

const resources = [
  {
    title: "Getting Started Guide",
    description: "Complete guide to setting up your dashboard",
    type: "Documentation",
    icon: Book,
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for all features",
    type: "Video",
    icon: Video,
  },
  {
    title: "API Documentation",
    description: "Technical documentation for developers",
    type: "Documentation",
    icon: Book,
  },
  {
    title: "Contact Support",
    description: "Get help from our support team",
    type: "Support",
    icon: Mail,
  },
]

export function HelpCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help Center</h2>
        <p className="text-muted-foreground">Find answers to common questions and get support.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Help Articles</CardTitle>
          <CardDescription>Find answers to your questions quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for help articles..." className="flex-1" />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions and their answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{faq.question}</h4>
                  <Badge variant="outline">{faq.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All FAQs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Helpful resources and documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <resource.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                <Badge variant="outline">{resource.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>Contact our support team for personalized assistance</CardDescription>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            Start Live Chat
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
