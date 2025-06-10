"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"

const monthlyEarnings = [
  { month: "Jan", earnings: 45000, subscriptions: 1200, growth: 12, newUsers: 234 },
  { month: "Feb", earnings: 52000, subscriptions: 1350, growth: 15, newUsers: 287 },
  { month: "Mar", earnings: 48000, subscriptions: 1280, growth: -8, newUsers: 198 },
  { month: "Apr", earnings: 61000, subscriptions: 1520, growth: 27, newUsers: 345 },
  { month: "May", earnings: 55000, subscriptions: 1420, growth: -10, newUsers: 267 },
  { month: "Jun", earnings: 67000, subscriptions: 1680, growth: 22, newUsers: 398 },
  { month: "Jul", earnings: 71000, subscriptions: 1750, growth: 6, newUsers: 412 },
  { month: "Aug", earnings: 69000, subscriptions: 1720, growth: -3, newUsers: 389 },
  { month: "Sep", earnings: 78000, subscriptions: 1890, growth: 13, newUsers: 456 },
  { month: "Oct", earnings: 82000, subscriptions: 1950, growth: 5, newUsers: 478 },
  { month: "Nov", earnings: 89000, subscriptions: 2100, growth: 9, newUsers: 523 },
  { month: "Dec", earnings: 95000, subscriptions: 2250, growth: 7, newUsers: 567 },
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
  newUsers: {
    label: "New Users",
    color: "hsl(var(--chart-3))",
  },
}

export function AnalyticsPage() {
  const totalEarnings = monthlyEarnings.reduce((sum, month) => sum + month.earnings, 0)
  const avgGrowth = monthlyEarnings.reduce((sum, month) => sum + month.growth, 0) / monthlyEarnings.length
  const currentSubscriptions = monthlyEarnings[monthlyEarnings.length - 1].subscriptions
  const totalNewUsers = monthlyEarnings.reduce((sum, month) => sum + month.newUsers, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track monthly earnings, subscription growth, and revenue trends with comprehensive insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {avgGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {avgGrowth.toFixed(1)}% average growth
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+180 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyEarnings[monthlyEarnings.length - 1].growth}%</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Revenue trends over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEarnings}>
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="earnings" fill="var(--color-earnings)" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Growth</CardTitle>
            <CardDescription>Active subscriptions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyEarnings}>
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Line
                    dataKey="subscriptions"
                    type="monotone"
                    stroke="var(--color-subscriptions)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-subscriptions)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Acquisition</CardTitle>
          <CardDescription>New user registrations by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyEarnings}>
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Area
                  dataKey="newUsers"
                  type="monotone"
                  fill="var(--color-newUsers)"
                  fillOpacity={0.4}
                  stroke="var(--color-newUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
