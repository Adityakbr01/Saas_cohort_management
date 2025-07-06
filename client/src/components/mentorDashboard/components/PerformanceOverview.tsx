import {
    CartesianGrid,
    Tooltip as ChartTooltip,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export const performanceData = [
  { month: "Jan", engagement: 85, completion: 88, satisfaction: 4.7 },
  { month: "Feb", engagement: 88, completion: 90, satisfaction: 4.8 },
  { month: "Mar", engagement: 92, completion: 92, satisfaction: 4.9 },
  { month: "Apr", engagement: 89, completion: 89, satisfaction: 4.8 },
  { month: "May", engagement: 94, completion: 94, satisfaction: 4.9 },
  { month: "Jun", engagement: 91, completion: 92, satisfaction: 4.9 },
];

interface PerformanceOverviewProps {
  performanceData: typeof performanceData;
}

function PerformanceOverview({ performanceData }: PerformanceOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          Your mentoring performance metrics over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <ChartContainer
          config={{
            engagement: {
              label: "Student Engagement",
              color: "hsl(var(--chart-1))",
            },
            completion: {
              label: "Completion Rate",
              color: "hsl(var(--chart-2))",
            },
            satisfaction: {
              label: "Satisfaction Score",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="w-[942px] h-[530px]"
        >
          <LineChart width={942} height={530} data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="engagement"
              stroke="var(--color-engagement)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="var(--color-completion)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="satisfaction"
              stroke="var(--color-satisfaction)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default PerformanceOverview;
