"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"

const subscriptions = [
  {
    name: "Basic",
    price: "$9",
    period: "month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 team members",
      "10GB storage",
      "Basic analytics",
      "Email support",
      "Standard templates",
      "Mobile app access",
    ],
    popular: false,
    subscribers: 1250,
    color: "default",
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    description: "Best for growing businesses",
    features: [
      "Up to 25 team members",
      "100GB storage",
      "Advanced analytics",
      "Priority support",
      "Custom templates",
      "API access",
      "Advanced integrations",
      "Custom branding",
    ],
    popular: true,
    subscribers: 850,
    color: "primary",
  },
  {
    name: "Business",
    price: "$99",
    period: "month",
    description: "For large organizations with advanced needs",
    features: [
      "Unlimited team members",
      "1TB storage",
      "Enterprise analytics",
      "24/7 phone support",
      "White-label solution",
      "Advanced API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced security",
    ],
    popular: false,
    subscribers: 320,
    color: "secondary",
  },
]

export function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Manage and monitor subscription tiers, features, and subscriber metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.reduce((sum, sub) => sum + sub.subscribers, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$67,890</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card
            key={subscription.name}
            className={`relative ${subscription.popular ? "border-primary shadow-lg" : ""}`}
          >
            {subscription.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{subscription.name}</CardTitle>
              <CardDescription>{subscription.description}</CardDescription>
              <div className="flex items-baseline justify-center space-x-1 pt-4">
                <span className="text-4xl font-bold">{subscription.price}</span>
                <span className="text-muted-foreground">/{subscription.period}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {subscription.subscribers.toLocaleString()} active subscribers
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {subscription.features.map((feature) => (
                  <li key={feature} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" variant={subscription.popular ? "default" : "outline"} size="lg">
                Manage Plan
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                View Subscribers
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
