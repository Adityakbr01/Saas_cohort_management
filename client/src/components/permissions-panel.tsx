"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Shield, Settings, Eye } from "lucide-react"

const roles = [
  {
    name: "Super Admin",
    description: "Full access to all features and settings",
    permissions: ["Create Users", "Delete Users", "Manage Billing", "System Settings", "View Analytics"],
    userCount: 2,
    color: "destructive",
  },
  {
    name: "Admin",
    description: "Manage users and content within organization",
    permissions: ["Create Users", "Edit Users", "View Analytics", "Manage Content"],
    userCount: 8,
    color: "default",
  },
  {
    name: "Moderator",
    description: "Moderate content and assist users",
    permissions: ["Edit Content", "View Users", "Moderate Comments"],
    userCount: 15,
    color: "secondary",
  },
  {
    name: "User",
    description: "Standard user access",
    permissions: ["View Content", "Edit Profile"],
    userCount: 1247,
    color: "outline",
  },
]

export function PermissionsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Permissions & Roles</h2>
        <p className="text-muted-foreground">Manage user roles and their associated permissions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>{role.name}</CardTitle>
                </div>
                <Badge variant={role.color as any}>{role.userCount} users</Badge>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Permissions</h4>
                <div className="space-y-2">
                  {role.permissions.map((permission) => (
                    <div key={permission} className="flex items-center justify-between">
                      <span className="text-sm">{permission}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Users
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
