import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

// Types for the data
interface PerformanceData {
  month: string;
  mentorPerformance: number;
  studentEngagement: number;
  completionRate: number;
}

interface SpecializationData {
  name: string;
  value: number;
  color: string;
}

interface CohortProgressData {
  name: string;
  progress: number;
  students: number;
}

// Props interface
interface OverviewTabProps {
  performanceData: PerformanceData[];
  specializationData: SpecializationData[];
  cohortProgressData: CohortProgressData[];
}

function OverviewTab({ performanceData, specializationData, cohortProgressData }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Monthly performance metrics across key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                mentorPerformance: {
                  label: "Mentor Performance",
                  color: "hsl(var(--chart-1))",
                },
                studentEngagement: {
                  label: "Student Engagement",
                  color: "hsl(var(--chart-2))",
                },
                completionRate: {
                  label: "Completion Rate",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="mentorPerformance"
                    stroke="var(--color-mentorPerformance)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="studentEngagement"
                    stroke="var(--color-studentEngagement)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="var(--color-completionRate)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Specialization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mentor Specialization Distribution</CardTitle>
            <CardDescription>Distribution of mentors across specializations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Mentors",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={specializationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {specializationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Cohorts Progress</CardTitle>
          <CardDescription>Real-time progress tracking for all active cohorts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              progress: {
                label: "Progress %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="progress" fill="var(--color-progress)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default OverviewTab
