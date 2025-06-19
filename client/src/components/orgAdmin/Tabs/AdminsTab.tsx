import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Eye, Loader2, Mail, MoreHorizontal, Search, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

// Types for org admin data
interface OrgAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  lastLogin: string;
  joinDate: string;
  avatar?: string;
  managedMentors: number;
  managedCohorts: number;
  department?: string;
}

// Interface for creating a new admin
interface CreateAdminData {
  name: string;
  email: string;
  role: string;
  department: string;
  permissions: string[];
}

// Props interface - simplified
interface AdminsTabProps {
  apiBaseUrl?: string;
}

function AdminsTab({ apiBaseUrl = '/api' }: AdminsTabProps) {
  const [orgAdmins, setOrgAdmins] = useState<OrgAdmin[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createAdminData, setCreateAdminData] = useState<CreateAdminData>({
    name: '',
    email: '',
    role: '',
    department: '',
    permissions: []
  })

  // Simple toast replacement
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${message}`)
    alert(`${type.toUpperCase()}: ${message}`)
  }

  // Fetch admins from API
  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${apiBaseUrl}/admins`)
      if (!response.ok) {
        throw new Error('Failed to fetch admins')
      }
      const data = await response.json()
      setOrgAdmins(data)
    } catch (error) {
      console.error('Error fetching admins:', error)
      showToast("Failed to load admins. Using mock data.", 'error')
      setOrgAdmins(getMockAdmins())
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new admin
  const handleCreateAdmin = async () => {
    try {
      setIsCreating(true)
      const response = await fetch(`${apiBaseUrl}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createAdminData,
          status: 'active',
          managedMentors: 0,
          managedCohorts: 0,
          joinDate: new Date().toISOString(),
          lastLogin: 'Never'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create admin')
      }

      const newAdmin = await response.json()
      setOrgAdmins(prev => [...prev, newAdmin])
      setIsCreateDialogOpen(false)
      setCreateAdminData({
        name: '',
        email: '',
        role: '',
        department: '',
        permissions: []
      })

      showToast("Administrator created successfully!")
    } catch (error) {
      console.error('Error creating admin:', error)
      showToast("Failed to create administrator. Please try again.", 'error')
    } finally {
      setIsCreating(false)
    }
  }

  // Delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/admins/${adminId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete admin')
      }

      setOrgAdmins(prev => prev.filter(admin => admin.id !== adminId))
      showToast("Administrator removed successfully!")
    } catch (error) {
      console.error('Error deleting admin:', error)
      showToast("Failed to remove administrator. Please try again.", 'error')
    }
  }

  // Mock data fallback
  const getMockAdmins = (): OrgAdmin[] => [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@edulaunch.com",
      role: "Super Admin",
      permissions: ["all"],
      status: "active",
      lastLogin: "2 hours ago",
      joinDate: "2023-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
      managedMentors: 15,
      managedCohorts: 8,
      department: "Administration"
    },
    {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah.wilson@edulaunch.com",
      role: "Mentor Manager",
      permissions: ["mentor_management", "cohort_management", "analytics_view"],
      status: "active",
      lastLogin: "1 day ago",
      joinDate: "2023-02-20",
      avatar: "/placeholder.svg?height=40&width=40",
      managedMentors: 8,
      managedCohorts: 5,
      department: "Education"
    },
  ]

  // Filter admins based on search and role
  const filteredAdmins = orgAdmins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || admin.role.toLowerCase().includes(roleFilter.toLowerCase())
    return matchesSearch && matchesRole
  })

  // Handle permission toggle
  const togglePermission = (permission: string) => {
    setCreateAdminData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  // Load admins on component mount
  useEffect(() => {
    fetchAdmins()
  }, [apiBaseUrl]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search administrators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super-admin">Super Admin</SelectItem>
              <SelectItem value="mentor-manager">Mentor Manager</SelectItem>
              <SelectItem value="analytics-manager">Analytics Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Organization Administrator</DialogTitle>
              <DialogDescription>Add a new administrator with specific roles and permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={createAdminData.name}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={createAdminData.email}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={createAdminData.role} onValueChange={(value) => setCreateAdminData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Mentor Manager">Mentor Manager</SelectItem>
                    <SelectItem value="Analytics Manager">Analytics Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Enter department"
                  value={createAdminData.department}
                  onChange={(e) => setCreateAdminData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mentor-management"
                      checked={createAdminData.permissions.includes('mentor_management')}
                      onCheckedChange={() => togglePermission('mentor_management')}
                    />
                    <Label htmlFor="mentor-management">Mentor Management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cohort-management"
                      checked={createAdminData.permissions.includes('cohort_management')}
                      onCheckedChange={() => togglePermission('cohort_management')}
                    />
                    <Label htmlFor="cohort-management">Cohort Management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="analytics-view"
                      checked={createAdminData.permissions.includes('analytics_view')}
                      onCheckedChange={() => togglePermission('analytics_view')}
                    />
                    <Label htmlFor="analytics-view">Analytics View</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-management"
                      checked={createAdminData.permissions.includes('user_management')}
                      onCheckedChange={() => togglePermission('user_management')}
                    />
                    <Label htmlFor="user-management">User Management</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Administrator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Administrators</CardTitle>
          <CardDescription>
            {isLoading ? "Loading administrators..." : `${filteredAdmins.length} administrator(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading administrators...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Managed Mentors</TableHead>
                  <TableHead>Managed Cohorts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No administrators found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={admin.avatar || "/placeholder.svg"} alt={admin.name} />
                            <AvatarFallback>
                              {admin.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={admin.role === "Super Admin" ? "default" : "secondary"}>{admin.role}</Badge>
                      </TableCell>
                      <TableCell>{admin.managedMentors}</TableCell>
                      <TableCell>{admin.managedCohorts}</TableCell>
                      <TableCell>
                        <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                      </TableCell>
                      <TableCell>{admin.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminsTab
