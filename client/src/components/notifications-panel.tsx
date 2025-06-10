"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Bell, Mail, MessageSquare, AlertTriangle } from "lucide-react"

const notifications = [
  {
    id: 1,
    title: "New user registration",
    description: "John Doe has registered for a Pro account",
    time: "2 minutes ago",
    type: "user",
    read: false,
  },
  {
    id: 2,
    title: "Payment received",
    description: "Payment of $299 received from TechCorp Solutions",
    time: "1 hour ago",
    type: "payment",
    read: false,
  },
  {
    id: 3,
    title: "System maintenance",
    description: "Scheduled maintenance will begin at 2:00 AM UTC",
    time: "3 hours ago",
    type: "system",
    read: true,
  },
  {
    id: 4,
    title: "Security alert",
    description: "Multiple failed login attempts detected",
    time: "5 hours ago",
    type: "security",
    read: true,
  },
]

const notificationSettings = [
  { name: "Email Notifications", description: "Receive notifications via email", enabled: true },
  { name: "Push Notifications", description: "Browser push notifications", enabled: true },
  { name: "SMS Alerts", description: "Critical alerts via SMS", enabled: false },
  { name: "Weekly Reports", description: "Weekly summary reports", enabled: true },
]

export function NotificationsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">Manage your notification preferences and view recent alerts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Latest system and user notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${notification.read ? "bg-muted/50" : "bg-blue-50 dark:bg-blue-950/20"}`}
              >
                <div className="flex-shrink-0">
                  {notification.type === "user" && <Bell className="h-5 w-5 text-blue-500" />}
                  {notification.type === "payment" && <Mail className="h-5 w-5 text-green-500" />}
                  {notification.type === "system" && <MessageSquare className="h-5 w-5 text-orange-500" />}
                  {notification.type === "security" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationSettings.map((setting) => (
              <div key={setting.name} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{setting.name}</div>
                  <div className="text-sm text-muted-foreground">{setting.description}</div>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
