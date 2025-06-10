"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis } from "recharts"

const monthlyEarnings = [
  { month: "Jan", earnings: 45000, subscriptions: 1200, growth: 12 },
  { month: "Feb", earnings: 52000, subscriptions: 1350, growth: 15 },
  { month: "Mar", earnings: 48000, subscriptions: 1280, growth: -8 },
  { month: "Apr", earnings: 61000, subscriptions: 1520, growth: 27 },
  { month: "May", earnings: 55000, subscriptions: 1420, growth: -10 },
  { month: "Jun", earnings: 67000, subscriptions: 1680, growth: 22 },
  { month: "Jul", earnings: 71000, subscriptions: 1750, growth: 6 },
  { month: "Aug", earnings: 69000, subscriptions: 1720, growth: -3 },
  { month: "Sep", earnings: 78000, subscriptions: 1890, growth: 13 },
  { month: "Oct", earnings: 82000, subscriptions: 1950, growth: 5 },
  { month: "Nov", earnings: 89000, subscriptions: 2100, growth: 9 },
  { month: "Dec", earnings: 95000, subscriptions: 2250, growth: 7 },
]

const chartConfig = {
  earnings: {
    label: "Monthly Earnings",
    color: "hsl(var(--chart-1))",
  },
  subscriptions: {
    label: "Active Subscriptions",
    color: "hsl(var(--chart-2))",
  },
}

export function AnalyticsChart() {
  const totalEarnings = monthlyEarnings.reduce((sum, month) => sum + month.earnings, 0)
  const avgGrowth = monthlyEarnings.reduce((sum, month) => sum + month.growth, 0) / monthlyEarnings.length
  const currentSubscriptions = monthlyEarnings[monthlyEarnings.length - 1].subscriptions

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h3>
        <p className="text-muted-foreground">Track monthly earnings, subscription growth, and revenue trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{avgGrowth.toFixed(1)}% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGrowth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Monthly average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlyEarnings[monthlyEarnings.length - 1].earnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{monthlyEarnings[monthlyEarnings.length - 1].growth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Revenue trends over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyEarnings}>
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="earnings" fill="var(--color-earnings)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Growth</CardTitle>
            <CardDescription>Active subscriptions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={monthlyEarnings}>
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="subscriptions"
                  type="monotone"
                  stroke="var(--color-subscriptions)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
