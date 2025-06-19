import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Eye, Plus, Users } from 'lucide-react'

// Types for cohort data
interface Mentor {
  id: string;
  name: string;
  specialization: string;
}

interface Cohort {
  id: string;
  name: string;
  mentor: string;
  mentorId: string;
  startDate: string;
  endDate: string;
  studentsCount: number;
  maxCapacity: number;
  status: string;
  progress: number;
  completionRate: number;
  category: string;
  difficulty: string;
  createdBy: string;
}

// Props interface
interface CohortsTabProps {
  cohorts: Cohort[];
  mentors: Mentor[];
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  isCreateCohortOpen: boolean;
  setIsCreateCohortOpen: (open: boolean) => void;
  handleViewCohort: (cohortId: string) => void;
  handleViewMentor: (mentorId: string) => void;
}

function CohortsTab({
  cohorts,
  mentors,
  filterStatus,
  setFilterStatus,
  isCreateCohortOpen,
  setIsCreateCohortOpen,
  handleViewCohort,
  handleViewMentor,
}: CohortsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
              <SelectItem value="web-dev">Web Development</SelectItem>
              <SelectItem value="mobile-dev">Mobile Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateCohortOpen} onOpenChange={setIsCreateCohortOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>Set up a new learning cohort with mentor assignment.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="cohort-name">Cohort Name</Label>
                <Input id="cohort-name" placeholder="Enter cohort name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentor">Assign Mentor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} - {mentor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="web-dev">Web Development</SelectItem>
                    <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                    <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Max Capacity</Label>
                <Input id="capacity" type="number" placeholder="Enter max students" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter cohort description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateCohortOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateCohortOpen(false)}>Create Cohort</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cohorts.map((cohort) => (
          <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{cohort.name}</CardTitle>
                  <CardDescription>
                    {cohort.category} • {cohort.difficulty}
                  </CardDescription>
                </div>
                <Badge variant={cohort.status === "active" ? "default" : "secondary"}>{cohort.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{cohort.progress}%</span>
                </div>
                <Progress value={cohort.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Students:</span>
                  <span className="ml-1 font-medium">
                    {cohort.studentsCount}/{cohort.maxCapacity}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mentor:</span>
                  <span className="ml-1 font-medium">{cohort.mentor}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleViewCohort(cohort.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewMentor(cohort.mentorId)}>
                  <Users className="h-4 w-4 mr-2" />
                  View Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CohortsTab
